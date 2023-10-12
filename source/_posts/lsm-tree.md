---
title: the principle and application of LSM Tree 
date: 2023-10-02 19:24:02
tags: LSM Storage
---
# LSM Tree

## Feature

* Ordered
* Block Storage(Disk)-oriented
* Hierarchical

## Structure

![LSM-Tree Structure](lsm_tree.png#pic_center)

## Workflow

### WAL

When LSM Tree received a input(insert/update/delete) operation, to avoid accidental crashing or shutdown，It is neccessary to write ahead log(WAL) that saves operation records into log files.

```go
type Wal struct {
	f    *os.File
	path string
	lock sync.Locker
}
```

### Memtable

Memtable is an append-only data structure (every node inserted cannot be changed by logical delete and removing duplicates based on update time.) like Binary search tree (e.g. RedBlack tree - LevelDB) or SkipList (e.g. HBase, more popular).

### Sorted String Table (SSTables)

Usually, a SSTable consists of an index block and multiple data blocks. Data block structure is as follows:

![Sorted Strings Table](sstable.png#pic_center)

where data is only ordered in segment layer rather than global.

### Optimization

#### improve read performance

For LSM Tree, what we concerned is read performance rather than write. As data increases, some methods to improve read performance need to come into our pictures.

* **Sparse Index**

As mentioned above, SStable has several segments that data are orderly stored. Without any optimization, we can also use binary search algorithm to find a certain element by scanning all the SStables and every Segments in each SStable unitl finding it. But unfortunately, for binary search algorithm, the minimum memory unit is segment for us to find the key in *O(logn)* or spent a Disk IO, both are too expensive in big data scenarios. So it is neccessary to  build a sparse index in memory to accelerate query efficiency.

![sparse index](sparse_index.png#pic_center)

> Sparse indexes only contain entries for documents that have the indexed field, even if the index field contains a null value. The index skips over any document that is missing the indexed field. The index is "sparse" because it does not include all documents of a collection.

* **Bloom Filter**

When the number of SStable increases in Disk, if some key is not present in the records, we need to scan all the SStable to find that key. Bloom filter is to overcome this issue. Unlike sparse indexes, [Bloom filters](https://adooobe.github.io/2023/10/02/bloom/) are designed to address the performance issues that arise when querying for non-existent keys.

### Compaction

#### questions in query

Let's talk about query in LSM Tree first. There are two query methods: *point lookup query* and *range query*.

* **point lookup query**: find the element what we want from new segment to old one.
* **range query**: when a big range query is executed, data have to be found in memtable, immutable memtable and multiple SSTalbes in different levels. (Notice: range query should be **key range query** like the follow picture)

![LSM Tree range query](range_query.png#pic_center)

During range reads, the iterator will seek to the start range similar to point lookup (using Binary search with in SSTs) using`SeekTo()` call. After seeking to start range, there will be series of iterators created one for each memtable, one for each Level-0 files (because of overlapping nature of SSTs in L0) and one for each level later on. A merging iterator will collect keys from each of these iterators and gives the data in sorted order till the End range is reached.

```go
itr := txn.NewIterator(badger.DefaultIteratorOptions)   
for itr.Seek("startKey"); itr.Valid(); itr.Next() {
    item := itr.Item()
    key := item.Key()
    if bytes.Compare(key, "endKey") > 0 {
      break
    }
    // rest of the logic.
}
```

Step1. find *startkey* position (write as startPosition) by `seek()` and move sub iterator to `startPosition + 1`

Step2. compare the sub iterators' element, return the minimal value and move the itr pointer.

Step3. repeat Step2 until the returned element > endkey

So in range query, as SSTables become more and more, query execution also becomes heavier and heavier.

#### Sorted Run

> LSM tree organizes files into several sorted runs. A sorted run consists of one or multiple [data file](https://nightlies.apache.org/flink/flink-table-store-docs-release-0.3/docs/concepts/file-layouts/#data-files)s and each data file belongs to exactly one sorted run.
>
> ![sorted runs](sorted_runs.png#pic_center)
>
> As you can see, different sorted runs may have overlapping primary key ranges, and may even contain the same primary key. When querying the LSM tree, all sorted runs must be combined and all records with the same primary key must be merged according to the user-specified [merge engine](https://nightlies.apache.org/flink/flink-table-store-docs-release-0.3/docs/features/table-types/#merge-engines) and the timestamp of each record.

In my opinion, in LSM Tree, a single logically ordered and no-repeat structure can be regarded as a `sorted run`.

#### Methods

![LSM Tree merge policies](merge_policy.png#pic_center)

* tiered compaction(low write amplification)
  ![size_tiered_compaction](size_tiered_compaction.png#pic_center)
  * high read and space amplification
  *
* leveled compaction

Like the picture above, leveled merge policies will merge SSTables into next level with the same range.

## Improvement

* **bLSM**
* **Diff-Index LSM**

## Reference

1. https://www.cnblogs.com/whuanle/p/16297025.html
2. https://www.geeksforgeeks.org/introduction-to-log-structured-merge-lsm-tree/
3. https://www.mongodb.com/docs/manual/core/index-sparse/#:~:text=Sparse%20indexes%20only%20contain%20entries,all%20documents%20of%20a%20collection.
4. https://hzhu212.github.io/posts/2d7c5edb/
5. https://zhuanlan.zhihu.com/p/380013595
6. https://github.com/facebook/rocksdb/wiki/Iterator-Implementation
