---
title: hudi-cdc
date: 2023-10-23 11:16:06
tags:
---
## Two choices

### Diff

* Based on Time-Travel
* Without any redundant data
* Low query performance
* Improved by data split(file, bucket .etc)

### CDF

* Need addtional metadata column and writing cost
* Better query performance

In CDF(DeltaLake, Hudi, Databend and Snowflake all chose CDF as CDC implementation), there are also some aspects that require our careful consideration as follows:

* when to persistence：we have a large number of different operators applied in the database system; we need to identify which ones require the CDC (Change Data Capture) hidden columns to be persisted.
* Write: Regarding different types of write operations in various lake formats, the corresponding changes in file metadata should be clarified. The first point that can be optimized under the CDF scheme is to determine, based on different operations, whether there is a need to persist CDC data. This means that some operation's change information is directly read from the CDC file, while for other operations, the modification information is extracted and converted from the ordinary data files. However, as each lake format has its own definition for different operations, a detailed analysis specific to the format is necessary. For instance, operations in DeltaLake like Insert Into/Insert Overwrite, Update, Delete, and Merge are what we normally understand. Meanwhile, Hudi introduces concepts like recordKey as a primary key and preCombineField for comparisons, meaning that even a simple Insert Into SQL syntax might actually correspond to an Update operation in practical logic.
  * For the Insert Into operation, DeltaLake does not read any other existing files, but only adds new data files. As such, when executing the Insert Into operation under the CDF framework with DeltaLake, there is no need for additional data persistence; one only needs to load these batch files at query time and transform the data into the agreed output format. However, within Hudi, because of the logic that combines data or optimizes by writing data into existing small files, it is necessary to read and rewrite existing files; thus, persistence of CDC data is required.
  * For the drop partition operation, both DeltaLake (not supported by the community version, but supported by Alibaba Cloud's EMR version) and Hudi directly mark all data files in that partition as deleted. There is no need to persist any information; during querying, these files are identified, loaded, and each record is marked as a delete operation type, along with other information such as timestamps.
  * For the update operation, the most fundamental operation must be to load the data files that meet the where condition, update the data that satisfies the where condition, and then write the updated data along with the unmodified data directly into a new file. In this case, an expansion of the CDF (Capability Data File) capability is required.
* Read:

## Databend

## Reference

1. https://github.com/apache/hudi/blob/master/rfc/rfc-51/rfc-51.md#approvers
2. https://github.com/apache/hudi/pull/5885/commits
