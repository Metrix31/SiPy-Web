# SiPy Documentation

> A simple open-source programming language created by Metrix31.

## Table of Contents

- Introduction
- Installation
- Hello World
- Data Types
- Variables
- Input and Output
- Mathematical Operations
- Comparison Operators
- Conditions
- Loops
- Examples
- Language Design
- Implementations
- License

---

# Introduction

SiPy is a simple and easy-to-read programming language designed for educational purposes and small projects.

The language currently has two implementations:

- JavaScript Version
- Python Version

Both implementations use the same syntax and language features.

---

# Installation

## Web Version

The JavaScript version can be used directly in a web browser.

## Python Version

The Python implementation can be executed locally.

---

# Hello World

```sipy
writeln("Hello World")
```

Output:

```text
Hello World
```

---

# Data Types

## Integer

Creates an integer value.

```sipy
number = integer(10)
```

---

## String

Creates a string value.

```sipy
name = string("Simon")
```

---

# Variables

Variables are created through assignment.

```sipy
name = string("SiPy")
number = integer(42)
```

---

# Input and Output

## writeln()

Prints a value to the output.

```sipy
writeln("Hello World")
```

Example:

```sipy
name = string("Simon")
writeln(name)
```

---

## getln()

Reads user input.

```sipy
name = string(getln("What is your name?"))
```

Example:

```sipy
name = string(getln("Name: "))
writeln(name)
```

---

# Mathematical Operations

## add()

Adds two integer values.

Syntax:

```sipy
result = a.add(b)
```

Example:

```sipy
a = integer(10)
b = integer(20)

c = a.add(b)

writeln(c)
```

Output:

```text
30
```

---

# Comparison Operators

## eq()

Compares two values for equality.

Syntax:

```sipy
a.eq(b)
```

Example:

```sipy
a = integer(10)
b = integer(10)

writeln(a.eq(b))
```

Output:

```text
true
```

---

# Conditions

## ifcase()

Executes code based on a condition.

Syntax:

```sipy
ifcase(
    condition,
    "code when true",
    "code when false"
)
```

Example:

```sipy
a = integer(10)
b = integer(20)

ifcase(
    a.eq(b),
    "writeln('Equal')",
    "writeln('Not Equal')"
)
```

Output:

```text
Not Equal
```

---

# Loops

## loop()

Executes a code block multiple times.

Syntax:

```sipy
loop(
    count,
    "code"
)
```

Example:

```sipy
loop(
    5,
    "writeln('Hello')"
)
```

Output:

```text
Hello
Hello
Hello
Hello
Hello
```

---

# Examples

## Addition

```sipy
a = integer(10)
b = integer(20)

c = a.add(b)

writeln(c)
```

---

## Comparison

```sipy
a = integer(10)
b = integer(20)

ifcase(
    a.eq(b),
    "writeln('a equals b')",
    "writeln('a does not equal b')"
)
```

---

## Greeting User

```sipy
name = string(getln("What is your name?"))

loop(
    3,
    "writeln('Hello'); writeln(name)"
)
```

---

## Basic Calculator

```sipy
a = integer(5)
b = integer(7)

sum = a.add(b)

writeln(sum)
```

---

# Language Design

## Goals

- Simple syntax
- Easy to learn
- Readable code
- Platform-independent
- Consistent behavior

## Features

- Object-like methods (`a.add(b)`)
- Built-in data types
- Simple loops
- Simple conditions
- JavaScript and Python implementations

---

# Implementations

## JavaScript Version

The primary implementation of SiPy is written in JavaScript.

## Python Version

An additional interpreter implementation written in Python.

The syntax is identical to the JavaScript version.

---

# Complete Example

```sipy
name = string(getln("What is your name?"))

a = integer(10)
b = integer(20)

sum = a.add(b)

writeln("Result:")
writeln(sum)

ifcase(
    a.eq(b),
    "writeln('Equal')",
    "writeln('Not Equal')"
)

loop(
    3,
    "writeln('Welcome'); writeln(name)"
)
```

---

# License

SiPy is licensed under the Apache License 2.0.

---

# Author

**Metrix31**

GitHub:

https://github.com/Metrix31

Project:

https://github.com/Metrix31/SiPy-Web
