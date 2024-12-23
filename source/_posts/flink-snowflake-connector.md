---
title: flink-snowflake-connector
date: 2024-07-24 08:52:28
tags: snowflake flink connector
---
## Cornerstone

The design of flink snowflake connector is based on the source code of [deltastream](https://https://github.com/deltastreaminc/flink-connector-snowflake) which saves 90 percents of my efforts and time on it. I'm so appreciative of his contributions to the open-source community and also I would take PRs on the repo to support more features to express my gratitude if allowed. :)

## Structure

We can find the user-defined sink & source connector from [the official website](https://nightlies.apache.org/flink/flink-docs-release-1.19/docs/dev/table/sourcessinks//) and it seems like that sink connector is much eaiser than source connector, great!

![table connectors](table_connectors.png#pic_center)

As per [snowflake documents](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-streaming-recommendation), in this connector, we try to reduce the number of Snowflake ingest client and re-use it by creating additional internal channels for one task manager which means the number of slots in Flink task manager may impact the cost of ingestion in the same bytes of data.

![structure](structure.png#pic_center)

## Supported DataTypes


| DataType  |
| ----------- |
| String    |
| TimeStamp |
| Integer   |
| BigInt    |
| Float     |
| Varchar   |
| Decimal   |
| Map       |

## Usage

```sql
CREATE TABLE source_table (
TRAFFIC_CHANNEL STRING,
BINLOG_BATCH_ID DECIMAL(38, 0),
BINLOG_ID DECIMAL(38, 0),
BINLOG_FILENAME STRING,
BINLOG_NEXT_POSITION DECIMAL(38, 0),
BINLOG_CREATED_AT TIMESTAMP(9),
ORIGIN_SCHEMA_NAME STRING,
ORIGIN_TABLE_NAME STRING,
TARGET_SCHEMA_NAME STRING,
TARGET_TABLE_NAME STRING,
ACTION STRING,
ROW_JSON_BEFORE MAP<String, String>,
ROW_JSON_AFTER MAP<String, String>,
TABLE_SCHEMA MAP<String, String>,
SOURCE_FLAG STRING,
QUEUE_BEGIN_TIME TIMESTAMP(9),
CDC_BEGIN_TIME TIMESTAMP(9)
) WITH (
'connector' = 'datagen',
'rows-per-second' = '1000'
);

CREATE TABLE sink_table (
TRAFFIC_CHANNEL STRING,
BINLOG_BATCH_ID DECIMAL(38, 0),
BINLOG_ID DECIMAL(38, 0),
BINLOG_FILENAME STRING,
BINLOG_NEXT_POSITION DECIMAL(38, 0),
BINLOG_CREATED_AT TIMESTAMP(9),
ORIGIN_SCHEMA_NAME STRING,
ORIGIN_TABLE_NAME STRING,
TARGET_SCHEMA_NAME STRING,
TARGET_TABLE_NAME STRING,
ACTION STRING,
ROW_JSON_BEFORE MAP<String, String>,
ROW_JSON_AFTER MAP<String, String>,
TABLE_SCHEMA MAP<String, String>,
SOURCE_FLAG STRING,
QUEUE_BEGIN_TIME TIMESTAMP(9),
CDC_BEGIN_TIME TIMESTAMP(9)
) WITH (
'connector' = 'snowflake',
'app.id' = '<job_id>',
'snowflake.url' = '<snowflake_account_url>',
'snowflake.user' = '<snowflake_user>',
'snowflake.role' = '<snowflake_role>',
'snowflake.private.key' = '<snowflake_private_key>',
'snowflake.database' = '<snowflake_database>',
'snowflake.schema' = '<snowflake_database>',
'snowflake.table' = '<snowflake_table>'
'sink.parallelism' = '2'
);
```

## Improvement

### Support Flink SQL

* [👌]  SinkFunction
* [👌]  DynamicTableSink
* [👌]  DynamicTableSinkFactory
* [👌]  e2e Test

### Support more thresholds of Buffer

* [👌]  Buffer Size threshold

### Add default ConfigOptions for Flink Jar/SQL

* [👀]  User & Role & PK

### Support insert multi-table mode

* [⏸️]  table schema management (state only?)
* [⏸️]  the design of operator chain

### Support EOS semantic

* [👀]  check if it has been supported

### Support upsert as per Primary Key

* [👀]  get primary key from Flink SQL

## Reference

1. https://adrianleexinhan.medium.com/using-snowflakes-new-snowpipe-streaming-api-with-kafka-622dcbd17a9f
2. https://quickstarts.snowflake.com/guide/data_engineering_streaming_integration/index.html#5
3. https://github.com/snowflakedb/snowflake-ingest-java
