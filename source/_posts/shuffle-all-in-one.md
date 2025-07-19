---
title: shuffle-all-in-one
date: 2024-08-12 15:25:10
tags:
top: 1
---
## Join Order

A typical database may execute an SQL query in multiple ways, depending on the selected operators' order and algorithms. One crucial decision is the order in which the optimizer should join relations. The difference between optimal and non-optimal join order might be orders of magnitude. Therefore, the optimizer must choose the proper order of joins to ensure good overall performance. In this blog post, we define the join order problem and estimate the complexity of join planning.

Consider a typical scene:

```sql
SELECT
lineitem.*
FROM
customer,
orders,
lineitem
WHERE
c_custkey = ?
AND c_custkey = o_custkey
AND o_orderkey = l_orderkey
```

Assume that the **`customer` table has 150,000 records, the** `orders` table has 1,500,000 records, and the `lineitem` table has 6,000,000 records. Then we will get different execution plan by different joining order.

![costomer + orders + lineitem](join_order_1.png#pic_center)

This join order is very efficient because most customers are filtered early, and we have a tiny intermediate relation. But however, if we change the joining order:

![orders + lineitem + costomer](join_order_2.png#pic_center)

It produces a large intermediate relation because we map every **`lineitem` to an** `order` only to discard most of the produced tuples in the second join.

### Search Space

I think it is useless to calculate the number of conditions the joining order will be. So I just put out the conclusion:

If `n` tables to be joined, there would be

N! * C_{N-1} = \frac{((2N-2)!}{(N-1)!}$

## Join Type

Let's talk about different join types.

## Reference

1. https://www.querifylabs.com/blog/introduction-to-the-join-ordering-problem
