---
title: Apache Arrow For the first time
date: 2023-10-08 20:17:14
tags: bigdata 
---
内存格式，和parquet文件存储格式差不多，但是某些行为上和parquet不一致，比如对待null值的处理是不一样的。
至于为什么能节省序列化和反序列化，arrow/arrow flight/arrow2之间的爱恨情仇还得再看