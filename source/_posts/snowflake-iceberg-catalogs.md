---
title: snowflake-iceberg-catalogs
date: 2024-12-23 10:10:17
tags:
---
## BackGround

We are trying to use Iceberg to organize data into an uniform structure and use it in cross-cloud scenario. However, it's a terrible journey to use iceberg tables in Snowflake to be honest. In conclusion, Snowflake Open Catalog (managed apache polaris service) is not "open" enough for us because it just likes a one-way channel. If I am using the internal catalog, it is read-only for external systems. If it is an external catalog, then it is read-only for Snowflake.

## Process

### Scenario

In the first step, we only need to operate Iceberg tables in Snowflake and everything looks good.we are able to create and use iceberg tables using our own S3 storage by following the steps as per the [docs](https://docs.snowflake.com/en/user-guide/tutorials/create-your-first-iceberg-table#create-a-table)

![only snowflake](only-snowflake.png)

But thing goes down when we wanna use another services to operate the same Iceberg tables. We have no idea to access to snowflake internal iceberg catalog.

![access_to_internal_catalog](access_to_internal_catalog.png)

In order to access the iceberg catalog, we have to give up Snowflake catalog. Two alternatives are as follows:

* using external catalog such as AWS Glue:
  ![access_to_glue_catalog](glue_catalog.png)
* using Snowflake Open Catalog:
  * case 1:
    ![snowflake-read-only](snowflake-read-only.png)
  * case 2:
    ![databend-read-only](databend-read-only.png)

If we consider cross-cloud applications, things would be more complicated.

![snowflake-cross-cloud](snowflake-cross-cloud.png)
