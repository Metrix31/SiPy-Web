# SiPy

![LICENSE](https://img.shields.io/badge/license-Apache%202.0-blue)
 
 
![LANGUAGE](https://img.shields.io/badge/status-active-success)

> A simple open-source programming language created by Metrix31.

SiPy is a lightweight and beginner-friendly programming language designed for learning programming concepts and building small projects. Its goal is to provide a clean, readable, and easy-to-understand syntax.

Currently, SiPy has two implementations:

- JavaScript (Web Version)
- Python (Interpreter Version)

Both implementations use the same syntax and language features.

---

## Features

- Easy-to-read syntax
- Built-in Integer and String types
- Input and output functions
- Mathematical operations
- Comparison operators
- Conditional execution
- Loops
- Platform-independent design
- Open Source

---

## Hello World

```sipy
writeln("Hello World")
```

Output:

```text
Hello World
```

---

## Quick Example

```sipy
name = string(getln("What's your name?"))

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

## Getting Started

### Variables

```sipy
name = string("Simon")
number = integer(42)
```

### Output

```sipy
writeln("Hello World")
```

### User Input

```sipy
name = string(getln("Name: "))
writeln(name)
```

---

## Language Goals

SiPy was designed to be:

- Easy to learn
- Easy to read
- Consistent
- Cross-platform
- Beginner-friendly

### Key Characteristics

- Object-like methods (`a.add(b)`)
- Built-in data types
- Simple conditions
- Simple loops
- Identical syntax across implementations

---

## Implementations

### JavaScript Version

The main implementation runs directly in the browser.

### Python Version

An additional interpreter implementation for local execution.

Both versions use the same language syntax.

---

## Documentation

Full language documentation can be found in:

```text
DOCUMENTATION.md
```

---

## Roadmap

Planned features:

- Additional data types
- User-defined functions
- Module system
- Error handling
- Improved developer tools
- Package manager

---

## License

Licensed under the Apache License 2.0.

---

## Author

**Metrix31**

GitHub:

https://github.com/Metrix31

Project:

https://github.com/Metrix31/SiPy-Web

---

⭐ If you like SiPy, consider starring the repository.
