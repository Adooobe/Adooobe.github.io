---
title: flink-k8s-operator
date: 2025-03-31 15:06:11
tags:
---
## Background

Recently, I'm taking almost all efforts on Cloud-Native Flink with AWS infra like Elastic Kubernetes Service(EKS), Elastic MapReduce(EMR) on EKS. I've run though about 80% of the task types in the test cluster so far (Of course I must have to thank the Ops and AWS Team for their help. Without them, many problems could not have been solved). Today, I wanna share everything I know about how to delpoy and run Flink Job on AWS EKS with you.

I'm not a professional cloud-native infra engineer so I'll just talk about what we do to deploy Flink Job on Kubernetes as follows:

1. Determine the job type
2. Manage the job lifecycles
3. Manage the job resources
4. The pitfalls you may need to take care

## Determine the deployment

**1. Deployment Methods: Flink Kubernetes Operator vs. Native Kubernetes Integration**

* **Flink Kubernetes Operator**: This operator acts as a control plane, automating the deployment, management, and scaling of Flink applications on Kubernetes. It encapsulates the expertise of a human operator, handling tasks such as job submission, upgrades, and failure recovery.

  * **Automated Lifecycle Management**: Manages the complete deployment lifecycle of Flink applications.
  * **Monitoring and Metrics Integration**: Provides full logging and metrics integration for better observability.

  By leveraging the Flink Kubernetes Operator, you can achieve a more Kubernetes-native experience, benefiting from enhanced automation and integration features.
* **Native Kubernetes Integration**: Flink's native integration allows you to deploy Flink clusters directly onto Kubernetes without additional layers.

  * **More Flexible Resource Management**: Flink communicates directly with Kubernetes to allocate and deallocate resources as needed. It means Native Kubernetes Integration is able to provide more flexible resource and communication management within the pod, for example, the request and limit of vCores.
  * **Manual Operations**: Deployment, scaling, and recovery processes require manual intervention or custom automation scripts.

  While this method offers more control, it demands a deeper understanding of both Flink and Kubernetes operations.

2. **Deployment Modes: Session vs. Application**

* **Session Mode**: In this mode, a long-running Flink cluster is deployed, capable of executing multiple jobs.

  * **Resource Sharing**: Multiple jobs share the same cluster resources, which can lead to resource contention.
  * **Quick Job Submission**: Since the cluster is already running, jobs can be submitted and start executing quickly.
  * **Potential Isolation Issues**: A misbehaving job can impact other jobs running on the same cluster due to shared resources.

  Session mode is suitable for development, testing, or scenarios where quick job turnaround is prioritized over strict resource isolation.
* **Application Mode**: Each job runs in its dedicated Flink cluster, with the cluster's lifecycle tied to the job's duration.

  * **Resource Isolation**: Each job has its own set of resources, ensuring that one job's behavior doesn't affect others. However, it also brings higher requirements for job-level resource monitoring and management.
  * **Enhanced Stability**: Failures are contained within the individual job's cluster, reducing the risk of cascading issues.
  * **Higher Resource Overhead**: Spinning up separate clusters for each job can lead to increased resource consumption and longer startup times.

## Manage the job lifycycles

To minimize the cost of job lifycycle management, we finally choose the Flink Kubernetes Operator and Dinky<sup>[2]</sup> to manage Flink Job (I still want to complain, these two are obviously not a good match)
![Operator Workflow](flink-operator-status-workflow.png#pic_center)

However, currently we deploy jobs using Dinky, which do not follow the operator job lifecycle management. Everytime we submit a task (Flink Job is seen as a task instance), it would delete the old flinkdeployment and upload a new one. Luckily, jobs are streaming and stable in our production so we took our eyes on task recovery rather than job status because it is always RUNNING.

## Manage the job resources

In our plan, resources are devided into three catalogories:

1. User Defined Functions(UDFs)

Usually, we consider UDFs as Dynamic User Code to load using `add jar` statement. Unluckily, we stepped into a pit you would see at the next section. So the same method as the connector are used to handle UDFs. Of course, this is not an elegant approach, which can lead to operational difficulties or other unforeseen problems, so we are also considering using initContainer to optimize it

2. Flink Source/Sink Connectors, Catalog

The part of connectors are considered as solid or rarely changed. So we could put them into `flink/lib` which includes basic flink runtime dependencies.

3. Plugins

Most of our current plugins are related to file systems and metrics and AWS provides sound plugin and management.

## The pitfalls you may need to take care

1.
2. Another problem we encounterd was about resource release. We sometimes would regularly run several Flink batch job.

## Appendix

1. https://adooobe.github.io/2024/12/05/flink-kubernetes-operator/
2. https://dinky.org.cn/docs/next/user_guide/studio/environment_config#kubernetes-operator-执行模式
3.
