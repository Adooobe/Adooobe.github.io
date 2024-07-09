title: raft
date: 2024-04-22 08:35:07
tags: Consensus, Raft, Kafka
----------------------------

## Main Concepts

* Data consistency：Two main consistency scheme are **Shared Memory** and **Messages Passing**. We know that in a distributed system based on message passing, the following errors are inevitable: processes may run slowly, be killed, or restart, leading to possible message delays, losses, or repetitions. It is provided some definitions to classify or solve these troubles:
  * Strong consistency: when a update operator finished, any query should fetch the latest result.
  * Weak consistency: latency is allowed when upating data.
* Term: A time duration of one node as leader of the cluster. The new term means the new leader.
* LOG Replication: Based on the State Machine Replication Theory, every node stored the same commands in log files with the same order. In Raft, there is a **Consensus** module to receive the commands from clients and add them to log files.

## Node Role

* Leader: The most important and the unique role in one term. Leader will handle all the requests from client.
* Follower: Followers would only **response** the requests of **Leader**. If any client sets connection to a Follower, redirection is neccessary.
* Candidate: A temporary role when a term ended.

## Node Communication

![Appendentities](appendentities.png#pic_center)

![RequestVote](RequestVote.png#pic_center)

![InstallSnapshot.png](installsnapshot.png#pic_center)

#### Receiver implementation:

* Reply immediately if term < currentTerm.
* Create a new snapshot file if it is the first chunk (offset is 0).
* Write data into the snapshot file at a given offset.
* Reply and wait for more data chunks if done is false.
* Save the snapshot file, discard any existing or partial snapshot with a smaller index.
* If existing log entry has the same index and term as snapshot’s last included entry, retain log entries following it and reply.
* Discard the entire log.
* Reset the state machine using snapshot contents (and load snapshot’s cluster configuration).

## Log Replication

## Reference

1. https://zhuanlan.zhihu.com/p/27207160
2. https://web.stanford.edu/~ouster/cgi-bin/papers/OngaroPhD.pdf
3. https://raft.github.io/raft.pdf
4. https://wingsxdu.com/posts/algorithms/raft/
5. https://www.sofastack.tech/en/projects/sofa-jraft/raft-introduction/
