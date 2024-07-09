---
title: Study Notes: TDOP  
date: 2024-04-09 13:50:47
tags: sqlparser, TDOP
top: 3
---
## TDOP(Top Down Operator Precedence) Algorithm

The Top-Down Operator Precedence (TDOP) algorithm primarily addresses the challenge of efficiently performing lexical and syntactic analysis in compilers, especially in handling operator precedence and associativity rules. By setting different precedence levels and utilizing a look-ahead mechanism, TDOP effectively manages issues related to operator left-associativity, right-associativity, and parentheses, thereby enabling a concise and flexible strategy for parsing expressions. This approach simplifies and streamlines the process of parsing various expression syntaxes, making it widely applicable in the design of compilers and interpreters.

> Top down operator precedence parsing (TDOP from now on) is based on a few fundamental principles:
>
> * A "binding power" mechanism to handle precedence levels
> * A means of implementing different functionality of tokens depending on their position relative to their neighbors - prefix or infix.
> * As opposed to classic RD, where semantic actions are associated with grammar rules (BNF), TDOP associates them with tokens.

### Bind Power

In my opinion, bind power is used to define the operator precedence. There are two bind powers (lbp and rbp) for each token in TDOP Algorithm to determine the order precedence. Sepecilly, for the ternary operator like `a = b ? c : d`, it can be devided into two binary operator `?` and `:`.

For example, there is an expression including two different tokens and three expressions(although it is only one letter)

```python
a + b * c
^ ^ ^ ^ ^
E A F B G
```

We know that multiplication take precedence of addition operator, so we can set the bind power of multiplication = 20, addtion = 10 for the process of TDOP Algorithm to transfer the expressions to AST(Abstract Syntax Tree).

### Pseudocode

```python
def expression(rbp=0):
    global token
    t = token
    token = next()
    left = t.nud()
    while rbp < token.lbp:
        t = token
        token = next()
        left = t.led(left)

    return left

class literal_token(object):
    def __init__(self, value):
        self.value = int(value)
    def nud(self):
        return self.value

class operator_add_token(object):
    lbp = 10
    def led(self, left):
        right = expression(10)
        return left + right

class operator_mul_token(object):
    lbp = 20
    def led(self, left):
        return left * expression(20)

class end_token(object):
    lbp = 0

```

Besides, in our instance, a simple tokenizer for basic arithmetic operations is neccessary

```python
import re
token_pat = re.compile("\s*(?:(\d+)|(.))")

def tokenize(program):
    for number, operator in token_pat.findall(program):
        if number:
            yield literal_token(number)
        elif operator == "+":
            yield operator_add_token()
        elif operator == "*":
            yield operator_mul_token()
        else:
            raise SyntaxError('unknown operator: %s', operator)
    yield end_token()

def parse(program):
    global token, next
    next = tokenize(program).next
    token = next()
    return expression()
```

We should notice that function `def tokenize(program)` using `yield`, which return a generator it can be seen as an iterator to use.

Let's see an example:

```matlab
3 + 1 * 2 * 4 + 5
```

process:

```matlab
<<expression with rbp 0>> 
    <<literal nud = 3>>
    <<led of "+">>
    <<expression with rbp 10>> call '+'.led(3)
       <<literal nud = 1>>
       <<led of "*">>
       <<expression with rbp 20>> call '*'.led(1)
          <<literal nud = 2>> return 1 * 2
       <<led of "*">>
       <<expression with rbp 20>> call '*'.led(2)
          <<literal nud = 4>> return 2 * 4
    <<led of "+">>
    <<expression with rbp 10>> call '+'.led(8)
       <<literal nud = 5>> return 8 + 5
```

#### Duality

Ok, let us think about subtraction operator. Generally, on both sides of a subtraction operation, there is an expression, but sometimes the subtraction can also be considered as a negation operation. In other words, for `'-'`, it could be both binary andunary operator.

```python
class operator_sub_token(object):
    lbp = 10
    def nud(self):
        return -expression(100)
    def led(self, left):
        return left - expression(10)
```

Example:

```
3 - 2 + 4 * -5
```

```python

<<expression with rbp 0>> 
    <<literal nud = 3>>
    <<led of "-">>
    <<expression with rbp 10>> call '-'.led(3)
       <<literal nud = 2>>
       <<lbp = rbp = 10>> return 2
    <<led of "+">> 
       <<expression with rbp 10>> call '+'.led(1)
          <<literal nud = 4>>
          <<led of "*">> call '*'.led(4)
            <<expression with rbp 20>> call -expression(100)
              <<nud of "-">> 
                <<expression with rbp 100>>
                  <<literal nud = 5>> return 5
                # return -5
            # return 4 * -5
       # return left = 1 + -20
    # return -19
```

#### Right Associative

Like exponentiation, we can do that by calling **expression** **in the handler of exponentiation with a** **rbp** **lower than the** **lbp** of exponentiation:

```
class operator_pow_token(object):
    lbp = 30
    def led(self, left):
        return left ** expression(30 - 1)
```

## Reference

1. https://eli.thegreenplace.net/2010/01/02/top-down-operator-precedence-parsing
