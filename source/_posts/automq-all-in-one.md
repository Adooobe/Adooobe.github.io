---
title: AutoMQ Message Reading Flow
date: 2025-01-14 23:18:00
tags: AutoMQ, Kafka, Message Queue, Architecture
categories: Distributed Systems
---

# AutoMQ Message Reading Flow

AutoMQ is a cloud-native Apache Kafka distribution that achieves better elasticity and cost-effectiveness through the separation of storage and compute. This article demonstrates the complete flow of how consumers read messages in AutoMQ.

## Core Components Description

- **ElasticKafkaApis**: API layer that handles client requests
- **ElasticReplicaManager**: Manages replicas and read operations
- **ElasticLog**: Elastic log management component
- **S3Storage**: Cloud storage abstraction layer
- **LogCache**: Log-level cache
- **BlockCache**: Block-level cache

## Message Reading Sequence Diagram

{% mermaid %}
sequenceDiagram
    participant Consumer
    participant ElasticKafkaApis
    participant ElasticReplicaManager
    participant ElasticLog
    participant S3Storage
    participant LogCache
    participant BlockCache
    participant S3

    Consumer->>ElasticKafkaApis: Fetch Request
    ElasticKafkaApis->>ElasticReplicaManager: fetchMessages
    
    Note over ElasticReplicaManager: Set ReadHint (READ_ALL + FAST_READ)
    
    ElasticReplicaManager->>ElasticReplicaManager: readFromLocalLogV2
    ElasticReplicaManager->>ElasticLog: readAsync
    ElasticLog->>ElasticLogFileRecords: read
    
    alt ReadHint.isReadAll()
        ElasticLogFileRecords->>S3Storage: read0
        S3Storage->>LogCache: get (Try LogCache first)
        
        alt LogCache Hit
            LogCache-->>S3Storage: Return cached data
            S3Storage-->>ElasticLogFileRecords: ReadDataBlock
        else LogCache Miss
            alt FastRead mode
                S3Storage-->>ElasticLogFileRecords: FastReadFailFastException
            else Regular read
                S3Storage->>BlockCache: read
                alt BlockCache Hit
                    BlockCache-->>S3Storage: Cached data
                else BlockCache Miss
                    BlockCache->>S3: Read Object
                    S3-->>BlockCache: Data blocks
                    BlockCache-->>S3Storage: Data
                end
                S3Storage-->>ElasticLogFileRecords: ReadDataBlock
            end
        end
    else 
        Note over ElasticLogFileRecords: Return BatchIteratorRecordsAdaptor
    end
    
    ElasticLogFileRecords-->>ElasticLog: Records
    ElasticLog-->>ElasticReplicaManager: FetchDataInfo
    ElasticReplicaManager-->>ElasticKafkaApis: LogReadResult
    ElasticKafkaApis-->>Consumer: Fetch Response
{% endmermaid %}

## Key Flow Analysis

### 1. Read Hint Mechanism
AutoMQ uses ReadHint to optimize reading strategies:
- **READ_ALL**: Indicates that complete data needs to be read
- **FAST_READ**: Fast read mode, prioritizing cache usage

### 2. Multi-level Cache Architecture
- **LogCache**: Log-level cache that stores complete log segments
- **BlockCache**: Block-level cache that stores data blocks from S3 objects
- S3 storage is only accessed when cache misses occur

### 3. Fast-Fail Mechanism
In FastRead mode, if cache misses occur, exceptions are quickly returned to avoid blocking read operations.

