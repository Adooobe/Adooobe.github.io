title: z-order
date: 2023-10-19 13:33:09
tags: big data, index
top: 1
---------------------

## What is Z-order & Why Z-order

Z-order is a concept of sorting data. Specifically，to quote Wikipedia, `“Z-order maps multidimensional data to one dimension while preserving locality of the data points.”` In the field of big data, Columns in table are regarded as dimensions to some extension. In other words, Z-order brings us a better way to organize data.

Firstly, let's think about two different ordered data, Z-order data and Linear-order data.

![z-order data](z-order.png#pic_center)

![linear-order data](linear-order.png#pic_center)

It is difficult for us to determine which one performs better immediately so there is a simple example to examine why z-order data may be the better one.


| x | y | z |
| :-: | :-: | :-: |
| 0 | 0 | 1 |
| 0 | 3 | 1 |
| 1 | 0 | 1 |
| 1 | 2 | 1 |
| 2 | 1 | 1 |
| 2 | 3 | 1 |
| 3 | 0 | 1 |
| 3 | 3 | 1 |

data in z-order:


| x | y | z |
| :-: | :-: | :-: |
| 0 | 0 | 1 |
| 1 | 0 | 1 |
| 3 | 0 | 1 |
| 2 | 1 | 1 |
| 1 | 2 | 1 |
| 0 | 3 | 1 |
| 2 | 3 | 1 |
| 3 | 3 | 1 |

Now, think about executing a query as follows:

1. `select sum(z) from test where x = 2`
2. `select sum(z) from test where y = 2`

How do we know the query behavior of this SQL? Let's figure out it in clickhouse.

default minmax index:


| granule | x_min | x_max | y_min | y_max |
| --------- | ------- | ------- | ------- | ------- |
| 0       | 0     | 0     | 0     | 3     |
| 1       | 1     | 1     | 0     | 2     |
| 2       | 2     | 2     | 1     | 3     |
| 3       | 3     | 3     | 0     | 3     |

minmax index with z-order:


| granule | x_min | x_max | y_min | y_max |
| --------- | ------- | ------- | ------- | ------- |
| 0       | 0     | 1     | 0     | 0     |
| 1       | 2     | 3     | 0     | 1     |
| 2       | 0     | 1     | 2     | 3     |
| 3       | 2     | 3     | 3     | 3     |

For default minmax index, we filter only one granule when filtering `x=2` and  4 granules when filtering `y=2`. For z-order data, the results are
2 and 2. It seems that z-order data may be litter better than default one but what if we have more than 3 dimensions filter conditions? Therefore, arranging data according to z-order can help us filter out data does not need to be read, achieving better dataskipping.

## Z-order in OLTP & OLAP

In conclusion, Z-order in OLAP can be more popular than OLTP. There are two reasons as follows.

One is due to the order of physical data that data can only be ordered as one rule in disk. If we put data into disk ordered by primary key, it can't be ordered by another key. It means we can't get satisfying performance when filtering some other column as same as filtering sprimary key columns. Another one is we can create serveral B-Tree index in OLTP to replace the capabilities of z-order but OLAP not (because index in memory is too expensive for OLAP).

## Extension: GeoHash VS Morton Code

1. https://zhuanlan.zhihu.com/p/35940647
2. https://zhuanlan.zhihu.com/p/468542418 (z-order code, but I don't understand:( )

## Reference

1. https://blog.cloudera.com/speeding-up-queries-with-z-order/
2. https://izualzhy.cn/lakehouse-zorder
3. https://juejin.cn/post/7118344872947515428
4. https://zhuanlan.zhihu.com/p/491256487
