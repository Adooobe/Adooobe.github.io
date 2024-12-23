---
title: Flink on K8s VS Flink on Yarn
date: 2024-12-05 10:17:54
tags: Flink cloud-native Kubernetes Yarn
---
## Background

We have a cluster of EMR based on Hadoop and run several Flink Streaming jobs in production so far. However, to formulate the real-time data warehouse and support low-latency data needs, especially for tag services and ad-hoc queries from C-end, a robust SLA guarantee for ETL workflows is essential.

What we are concerned about are as follows:

* High Available(Both clusters and jobs)
* Failover
* Maintenance

In conclusion, we finally decided to use cloud-native Flink to solve or improve our capabilities of streaming ETL.

## Flink on Yarn Architecture

### Overview

![yarn-structure](yarn-architecture.png#pic_center)

![flink-on-yarn](flink-on-yarn.svg#pic_center)

### Advantages

#### Ecosystem Integration

It is well known that Flink can seamlessly integrate into existing Hadoop clusters, leveraging Yarn and other infrastructure like HBase and HDFS within the Hadoop ecosystem.

#### Experienced Practice

Before the Kubernetes deployment matured, Flink on Yarn accumulated extensive practical experience in production environments within the industry,  especially in China, where a large amount of related documentation and resources can be found to assist with development.

### Drawbacks

#### Heavy Dependencies

* HDFS
* ZooKeeper

#### "Rigid Dispatch Strategy"

![yarn-resource-management](yarn-resource-management.png#pic_center)

## Cloud-Native Architecture

### Overview

![structure](architecture.svg#pic_center)

### Advantages

#### Minimalism

* Deploy and run Flink Batch/Streaming Job without Apache Hadoop
* Do not have to install too many redundant components in a huge messy cluster
* Load dependencies on demand

#### Job Lifecycle Management

* Running, suspending and deleting applications
* Stateful and stateless application upgrades
* Triggering and managing savepoints
* Handling errors, rolling-back broken upgrades

#### JobManager High-availability

![Job Manager HA](jobmanager_ha_overview.png#pic_center)

Flink’s [high availability services](https://nightlies.apache.org/flink/flink-docs-master/docs/deployment/ha/overview/#high-availability-services) encapsulate the required services to make everything work:

* **Leader election** : Selecting a single leader out of a pool of `n` candidates
* **Service discovery** : Retrieving the address of the current leader
* State persistence : Persisting state which is required for the successor to resume the job execution (JobGraphs, user code jars, completed checkpoints)
* Ops-Friendly
* Flink All in EKS
* Job status changed listener
* [Powerful Metric Reporters](https://nightlies.apache.org/flink/flink-docs-master/docs/ops/metrics/)

### Drawbacks

#### Higher Threshold of Flink/Kubernetes

We will assume a good level of Flink Kubernetes and general operational experience for different cluster and job types. For Flink related concepts please refer to [https://flink.apache.org/](https://flink.apache.org/).

* Kubernete
  * Affinity
  * Toleration
  * CRs
  * Basic APIs
* Flink
  * FlinkConfiguration in K8s
  * Architecture of EMR on EKS
  * Flink Kubernetes Operator
  * Operator Chains

## Cloud-Native Flink Development Platform - Dinky

To facilitate developers in SQL-based development, Dinky, a lightweight Flink development platform came up.

### TODO

#### Emergency

* Refactor Dinky dinky-gateway module to apply AWS EKS using fabric8 kubernetes client.

#### Required

* Add Flink task-related dependencies to the PodTemplate to flexibly include necessary dependencies based on the task requirements without changing the base image.
* set `restartNonce` to restart Flink K8S Applications without spec change.
* Support parsing the environment parameters of FlinkSQL job to set checkpoint/savepoint into FlinkDeployment.
* Support Autoscaler and Autotuning(new feature in Flink 1.18)

#### Important

* Submit Pull Request to Dinky coummunity

#### Optional

* set `upgradeMode` strategy to support `savepoint`

## Appendix

1. https://adooobe.github.io/2024/12/05/flink-kubernetes-operator/
2. https://dinky.org.cn/docs/next/user_guide/studio/environment_config#kubernetes-operator-执行模式
