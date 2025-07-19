---
title: offline-warehouse
date: 2025-05-28 10:31:34
tags: datawarehouse
---
## Murmur

I found some interesting [articles](https://medium.com/@paul.needleman/databricks-vs-optimized-snowflake-by-the-numbers-e980382e04c6) aruging cost and performance between Snowflake and Databricks. The more interesting is under the comments,
1. https://medium.com/@saravanan.aryan/snowflake-vs-iceberg-a-performance-showdown-on-a-billion-row-dataset-ae3571f0d02b
![comment](interesting_comment.png#pic_center)

Back to our main topic, Is Databricks better and cheapper than Snowflake? Actually, as a Snowflake user of enterprise and standard version, I totally agree the comments under the decisive one that Snowflake is more convinient for most of users who are not able to proficient in BigData Storage & Computing Engine rather than providing more flexiable capabilities like Databricks. However, on the other hand, we have not determined building LakeHouse (or traditional DataWarehouse) based on Snowflake or Databricks yet.

## Alternatives

* Snowflake credit: 8c/64g <=> 1 credits
* DBU: 8c/32g <=> 1 DBU


| Architecture Combination     | Cost (Storage + Compute)                                | ETL/Query Performance (Complex SQL, Joins)                 | Flink Integration (Ingestion to ODS/DWD)                       | Streaming Capability (Latency, E2E)          | Maintainability & Maturity              | Openness & Vendor Lock-in          |
| ------------------------------ | --------------------------------------------------------- |------------------------------------------------------------| ---------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------- | ------------------------------------ |
| **Snowflake + Native Table** | 💰💰💰 (Storage: $40+/TB/mo, Compute: $2/credit avg)    | ⭐⭐⭐⭐ (Up to billions of rows Join in <10 min)              | ⭐⭐⭐ (Via Snowpipe only; Flink → Snowpipe Streaming)        | ⏱️ ~5 sec latency(micro-batching)          | ✅ Fully managed, minimal tuning        | ❌ Closed format, Snowflake only   |
| **Snowflake + Iceberg**      | 💰💰💰 (Storage: ~$25/TB on S3, Compute: $2/credit avg) | ⭐⭐⭐ (50%~500% slower than native table format)             | ⭐⭐⭐ (Flink → Iceberg write; Snowflake external read)       | ⏱️ ~2-10 min latency (depends on Flink)    | ⚠️ Metadata & partition tuning needed | ✅ Open format (Apache Iceberg)    |
| **Databricks + Iceberg**     | 💰💰 (Storage: ~$25/TB on S3, Compute: $0.55/DBU avg)   | ⭐⭐⭐ (Optimized read, 10B+ rows in ~10 min)                 | ⭐⭐⭐⭐ (Flink native write; Spark read/write; cross-engine)  | ⏱️ ~1-5 min latency (structured streaming) | ⚠️ Requires catalog setup & tuning    | ✅ Open format (cross-platform)    |
| **Databricks + Delta**       | 💰💰 (Storage: ~$25/TB on S3, Compute: $0.55/DBU avg)   | ⭐⭐⭐⭐⭐ (Best-in-class Spark optimization: Z-order, caching) | ⭐⭐⭐⭐ (Native Delta Sink in Flink; Spark streaming support) | ⏱️ ~1-3 min latency (streaming or trigger) | ✅ Mature, production ready             | ⚠️ Open spec, but Databricks-led |



## Reference
