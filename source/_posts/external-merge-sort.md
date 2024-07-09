---
title: external-merge-sort
date: 2024-04-18 14:08:30
tags: MergeSort
---
## Brief

A good memory is no match for a bad pen， see once forget once, better write it down.

## K-way Merge Sort

There are three data structures to implemenet the k-way merge algorithm:

* heap
* winner tree
* loser tree

## Implementation

```rust
struct LoserTree {
    internal: Vec<usize>,
    leaves: Vec<i32>,
    // initialize MAX_INT
    sentinel: i32,
}

impl LoserTree {
    pub fn new(input: Vec<Vec<i32>>) -> Self {
        let sentinel = i32::MAX;
        let k = input.len();
        let mut leaves = vec![sentinel; k];
        let mut internal = vec![0; k];

        // init leaves
        for (i, data) in input.iter().enumerate() {
            if !data.is_empty() {
                leaves[i] = data[0];
            }
        }

        let mut tree = LoserTree {
            internal,
            leaves,
            sentinel,
        };
        // init tree nodes
        for i in (0..k).rev() {
            tree.adjust(i);
        }
        tree
    }

    fn adjust(&mut self, mut leaf: usize) {
        // get parent node
        let mut parent = (leaf + self.leaves.len()) >> 1;
        while parent > 0 {
            // 如果当前叶子节点的值更小，或者内部节点未初始化
            if self.leaves[leaf] < self.leaves[self.internal[parent]] {
                std::mem::swap(&mut leaf, &mut self.internal[parent]);
            }
            parent >>= 1;
        }
        // 根节点的特殊调整
        self.internal[0] = leaf;
    }

    // 获取下一个元素
    pub fn next(&mut self, input: &Vec<Vec<i32>>, indexes: &mut Vec<usize>) -> Option<i32> {
        let winner = self.internal[0];
        let value = self.leaves[winner];
        if value == self.sentinel {
            return None;
        }

        // 更新winner对应的叶子节点
        let next_index = indexes[winner] + 1;
        self.leaves[winner] = *input[winner].get(next_index).unwrap_or(&self.sentinel);
  
        // 更新相应序列的索引
        indexes[winner] = next_index;
        // 重新调整族_TREE
        self.adjust(winner);
  
        Some(value)
    }
}

fn main() {
    let input = vec![vec![1, 3, 5], vec![2, 4, 6], vec![0, 7, 8, 9]];
    // 索引，记录每个序列当前处理的位置
    let mut indexes = vec![0; input.len()];
  
    let mut loser_tree = LoserTree::new(input.clone());
    let mut result = vec![];
    while let Some(next) = loser_tree.next(&input, &mut indexes) {
        result.push(next);
    }

    println!("Merged array: {:?}", result);
}
```
