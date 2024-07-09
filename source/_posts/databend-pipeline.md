---
title: databend-pipeline
date: 2024-05-10 17:28:02
tags: databend, query execution
---
## Execution of Databend Pipeline

### Query

```sql
mysql> desc t;
+-------+------+------+---------+-------+
| Field | Type | Null | Default | Extra |
+-------+------+------+---------+-------+
| id    | INT  | NO   | 0       |       |
| val   | INT  | NO   | 0       |       |
+-------+------+------+---------+-------+

mysql> explain pipeline select t.id from t group by t.id;
+--------------------------------------------------------+
| explain                                                |
+--------------------------------------------------------+
| CompoundBlockOperator(Project) × 1 processor           |
|   TransformFinalGroupBy × 1 processor                  |
|     TransformSpillReader × 1 processor                 |
|       TransformPartitionBucket × 1 processor           |
|         TransformGroupBySpillWriter × 1 processor      |
|           TransformPartialGroupBy × 1 processor        |
|             DeserializeDataTransform × 1 processor     |
|               SyncReadParquetDataSource × 1 processor  |
+--------------------------------------------------------+
```

## Reference

1. [https://databend-internals.psiace.me/docs/source-reading/pipeline-execution/](https://databend-internals.psiace.me/docs/source-reading/pipeline-execution/)
