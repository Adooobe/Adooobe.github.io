---
title: Apache Arrow For the first time
date: 2023-10-08 20:17:14
tags: bigdata
---
## Columnar Format

The **Arrow columnar format** includes a language-agnostic in-memory data structure specification, metadata serialization, and a protocol for serialization and generic data transport.

The columnar format has some key features:

* Data adjacency for sequential access (scans)
* O(1) (constant-time) random access
* SIMD and vectorization-friendly
* Relocatable without “pointer swizzling”, allowing for true zero-copy access in shared memory

## Vectorized Operations

## Reference
