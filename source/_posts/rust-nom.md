---
title: rust-nom
date: 2024-04-26 15:24:19
tags:
---
## the First time of nom

```rust
use nom::{
    branch::alt,
    bytes::complete::{tag, take_while_m_n},
    character::complete::{alpha1, char},
    combinator::map,
    IResult,
    multi::separated_list0,
    sequence::{delimited, tuple},
};
use nom::bytes::complete::{is_not, take_while1};
use nom::character::complete::{alphanumeric1, multispace0};
use nom::combinator::recognize;
use nom::sequence::{pair, preceded, separated_pair};

fn column_identifier(input: &str) -> IResult<&str, &str> {
    alpha1(input)
}

fn option_identifier(input : &str) -> IResult<&str, &str> {
    take_while1(|c: char| c.is_alphanumeric() || c == '_')(input)
}

fn table_identifier(input: &str) -> IResult<&str, &str> {
    alpha_numeric_token(input)
}

fn alpha_numeric_token(input: &str) -> IResult<&str, &str> {
    recognize(
        pair(alpha1, alphanumeric1)
    )(input)
}

fn quoted_string(input: &str) -> IResult<&str, &str> {
    delimited(char('\''), is_not("\'"), char('\''))(input)
}

fn option_value(input: &str) -> IResult<&str, &str> {
    preceded(multispace0,
        alt((
        take_while1(|c: char| c.is_alphanumeric() || c == '_'),
        quoted_string,
    )))(input)
}

fn string_literal(input: &str) -> IResult<&str, &str> {
    delimited(char('\''), take_while_m_n(1, 255, |c: char| c != '\''), char('\''))(input)
}

fn option(input: &str) -> IResult<&str, (&str, &str)> {
    preceded(multispace0,
      separated_pair(
        option_identifier,
        preceded(multispace0, char('=')),
        option_value,
    ))(input)
}
fn options(input: &str) -> IResult<&str, Vec<(&str, &str)>> {
    preceded(
        preceded(multispace0, tag("options")),
        delimited(
          preceded(multispace0, char('(')),
          separated_list0(preceded(multispace0, char(',')), option),
          preceded(multispace0, char(')')),
    ))(input)
}

pub(crate) fn select_statement(input: &str) -> IResult<&str, (&str, Vec<&str>, Vec<(&str, &str)>)> {
    map(
        tuple((
            tag("select "),
            separated_list0(char(','), column_identifier),
            tag(" from "),
            table_identifier,
            options,
        )),
        |(_, columns, _, table, options)| {
            (table, columns, options)
        },
    )(input)
}

fn main() {
    let sql = "select a,b,c from t1 options (option_a = '1',option_b = 1)";
    match select_statement(sql) {
        Ok((remaining, (table, columns, opts))) => {
            println!("Table: {}", table);
            println!("Columns: {:?}", columns);
            println!("Options: {:?}", opts);
            println!("Remaining: {}", remaining);
        },
        Err(e) => println!("Error parsing SQL: {:?}", e),
    }
}
```

## Reference

1. https://github.com/xitu/gold-miner/blob/master/TODO1/learning-parser-combinators-with-rust-1.md
