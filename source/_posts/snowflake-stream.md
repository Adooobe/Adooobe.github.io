---
title: Snowflake CDC VS Hudi CDC
date: 2023-10-30 09:55:24
tags: stream cdc snowflake
---
## Batch vs. Streaming

Batch and streaming are different ways to treat data transformation. We usually talk about `Flow-Batch integration` artitechture but I have not seen any applications which can do self-adaption batch or streaming operation in the same semantic and I totally agree the point of view proposed by [this article](https://dl.acm.org/doi/pdf/10.1145/3589776).

> batch systems process input datasets in their entirety to produce new output datasets in their entirety.
>
> streaming systems process the changes to input datasets over time to incrementally evolve their corresponding outputs over time.

In my opinion, streaming systems combine the data and time semantic but batch systems only concerns about data. It leads to a new physical concept: `changes`. In Snowflake, `Streams` are based on `changes` which capture the changes to a dataset over time.

As for ETL pipeline, streaming or batch is depedent on the compute engine. If we use Flink for Hudi CDC, the pipeline is streaming but micro-batch with Spark. Unluckily, Snowflake does not yet have mature streaming capabilities ( I'm not so familiar with the implementation of Dynamic Table)

## Implementation

## Reference

1. https://dl.acm.org/doi/pdf/10.1145/3589776
2. https://15445.courses.cs.cmu.edu/fall2021/notes/05-bufferpool.pdf
