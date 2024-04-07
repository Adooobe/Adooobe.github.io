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

## MySQL redo log

Firstly, let us talk about what is redo log and why we need redo log.

In mySQL design, to avoid disk operation each DML and load data from disk each query statement, there is a `buffer pool` to reduce disk I/O and mySQL will query the adjacent data of aiming data, then put them into buffer pool as one page.

However, when we make changes to the data in the buffer pool, the buffer pool does not immediately flush data into disk, resulting in inconsistency between the data in the buffer pool and the data on the disk. It is called a dirty page. If MySQL crashed when dirty page happened, ACID was destroyed.

![buffer pool](./snowflake-stream/buffer_pool.png#pic_center)

## Implementation


## Reference

1. https://dl.acm.org/doi/pdf/10.1145/3589776
2. https://15445.courses.cs.cmu.edu/fall2021/notes/05-bufferpool.pdf
