---
title: Bloom Filter Implementation and Optimization
date: 2023-10-02 19:11:52
tags: Bloom-Filter
mathjax: true
---
# Bloom Filter

## What is Bloom Filter

A bloom filter is a probabilistic data structure that is based on hashing. It is extremely space efficient and is typically used to add elements to a set and test if an element is in a set. Though, the elements themselves are not added to a set. Instead a hash of the elements is added to the set.

## Implementation

```python
import hashlib

class BloomFilter:
    def __init__(self, m, k):
        self.m = m
        self.k = k
        self.data = [0]*m
        self.n = 0
    def insert(self, element):
        if self.k == 1:
            hash1 = h1(element) % self.m
            self.data[hash1] = 1
        elif self.k == 2:
            hash1 = h1(element) % self.m
            hash2 = h2(element) % self.m
            self.data[hash1] = 1
            self.data[hash2] = 1
        self.n += 1
    def search(self, element):
        if self.k == 1:
            hash1 = h1(element) % self.m
            if self.data[hash1] == 0:
                return "Not in Bloom Filter"
        elif self.k == 2:
            hash1 = h1(element) % self.m
            hash2 = h2(element) % self.m
            if self.data[hash1] == 0 or self.data[hash2] == 0:
                return "Not in Bloom Filter"
        prob = (1.0 - ((1.0 - 1.0/self.m) * (self.k*self.n))) * self.k
        return "Might be in Bloom Filter with false positive probability "+str(prob)

def h1(w):
    h = hashlib.md5(w)
    return hash(h.digest().encode('base64')[:6])%10

def h2(w):
    h = hashlib.sha256(w)
    return hash(h.digest().encode('base64')[:6])%10
```

In this sample, we implement a simple Bloom Filter which has two hash function(controlled by *k*) to compute the position of input element in the bit array (named data, array size is *m*).

When an element inserts into BloomFilter, two positions will be changed to 1 in the bit array computed by hash function so that if the element comes again, BloomFilter will get and check if the two positions are both 1. So when other element comes, if any position is not 1, the element doesn't exist in the data array.

It is worth noting that different elements can get same hash values computed by hash function. It means one grid in the bit array is not independently used by unique element but shared. In other words, it can be covered.

## drawback

As mentioned above, Bloom Filter can creat false positives that Bloom Filter has a certain probability of mistakenly identifying non-existent elements.

We have two choices of parameters when building a bloom filter, `m` and `k`. They should each be chosen to dampen the number of false positives as much as possible while still maintaining whatever space requirement the filter needs.

If we have a bloom filter with `m` bits and `k` hash functions, the probability that a certain bit will still be zero after one insertion is

$(1-1/m)^k$

Then, after `n` insertions, the probability of it still being zero after `n` insertions is

$(1-1/m)^{nk}$

So, that means the probability of a false positive is

$(1-(1-1/m)^{nk})^k$

In each of these equations, raising the value of k (the number of hash functions) will make the probability of a false positive less likely. However, it is not computationally efficient to have an enormous value for *k*. To minimize this equation, we must choose the best *k*. We do it this way because we assume that the programmer has already chosen an **m** based on their space constraints and that they have some idea what their potential *n* will be. So the *k* value that minimizes that equation is

$k=ln(2)⋅m/n$

## Use Cases

### Hudi Upsert

### LSM-Tree

See [LSM-Tree](https://adooobe.github.io/2023/10/02/lsm-tree/)

### Others

1. [White List Question](https://zhuanlan.zhihu.com/p/294069121)
2. [Redis Cache Breakdown](https://www.51cto.com/article/753025.html)

## Improvement

There are two limitations that have always restricted the usage of Bloom Filter, bounded source and append-only. The following are several improvement methods that revolve around addressing these two issues.

#### Scalable Bloom Filters (SBF)

![scalable bloom filter structure](scalable_bloom_filter.png#pic_center)

when the filter reaches some fulfillness threshold, it becomes read-only and new bigger and writable filter is created in its place. If in its turn it becomes saturated, the operation is repeated. Every new filter, in order to keep the false positives rate close to the targeted one, has more hash functions than the previous filter.

In Scalable Bloom filter the membership test is applied on all created (read-only + writable) filters. If the item is missing in all filters, it's considered as not existing. In the other side, if one of the filters reports its existence, it means that the element may be in the dataset. An important point to notice here is that Scalable Bloom filter uses a variant of Bloom filters where the bit vector is divided in *k* slices where each stores *M/k* bits (*M* is the size of whole bit vector). Since the number of slices is equal to the number of hash functions, each hash function works on its own slice:

![scalable bloom filter slices](scalable_bloom_filter_slices.png#pic_center)

Thanks to the slices each element is always described by *k* bits resulting on more robust filter without the elements more prone to the false positives than the others.

#### Counting Bloom Filter (CBF)

For the second question, CBF provides ability to delete elements in Bloom Filters. But unfortunately, the premise is that we must ensure that the deleted element is present in the Bloom filter.

![counting bloom filter structure](counting_bloom_filter.png#pic_center)

## Reference

1. https://www.waitingforcode.com/big-data-algorithms/scalable-bloom-filter/read
2. Baquero, C., & Almeida, J. (2007, January). Scalable bloom filters. In European Conference on Principles of Data Mining and Knowledge Discovery (pp. 244-256). Springer, Berlin, Heidelberg.
