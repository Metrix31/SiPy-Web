class Basic {
    constructor(value) {
        this.value = value;
    }

    static toBasic(x) {
        return x instanceof Basic ? x : new Basic(x);
    }

    static integer(v) { return new Basic(parseInt(Basic.toBasic(v).value, 10)); }
    static floater(v) { return new Basic(parseFloat(Basic.toBasic(v).value)); }
    static string(v)  { return new Basic(String(Basic.toBasic(v).value)); }
    static boolean(v) { return new Basic(Boolean(Basic.toBasic(v).value)); }

    add(other) { return applyOperatorOverload("add", this, other) || new Basic(this.value + Basic.toBasic(other).value); }
    sub(other) { return applyOperatorOverload("sub", this, other) || new Basic(this.value - Basic.toBasic(other).value); }
    mul(other) { return applyOperatorOverload("mul", this, other) || new Basic(this.value * Basic.toBasic(other).value); }
    div(other) { return applyOperatorOverload("div", this, other) || new Basic(this.value / Basic.toBasic(other).value); }
    mod(other) { return applyOperatorOverload("mod", this, other) || new Basic(this.value % Basic.toBasic(other).value); }

    eq(other)  { return this.value == Basic.toBasic(other).value; }
    neq(other) { return this.value != Basic.toBasic(other).value; }
    gt(other)  { return this.value >  Basic.toBasic(other).value; }
    lt(other)  { return this.value <  Basic.toBasic(other).value; }
    ge(other)  { return this.value >= Basic.toBasic(other).value; }
    le(other)  { return this.value <= Basic.toBasic(other).value; }

    toString() { return String(this.value); }

    static pi() { return new Basic(3.1415926); }
}

class TupleValue {
    constructor(items) {
        this.items = Object.freeze(items.slice());
        this.length = this.items.length;
    }

    get(index) { return this.items[Basic.toBasic(index).value]; }
    toArray() { return this.items.slice(); }
    toString() { return "(" + this.items.map(formatValue).join(", ") + ")"; }
}

class SetValue {
    constructor(items = []) {
        this.values = new Set(items.map(unwrapValue));
    }

    add(value) {
        this.values.add(unwrapValue(value));
        return this;
    }

    has(value) { return this.values.has(unwrapValue(value)); }
    delete(value) { return this.values.delete(unwrapValue(value)); }
    clear() { this.values.clear(); }
    toArray() { return Array.from(this.values); }
    toString() { return "{" + this.toArray().map(formatValue).join(", ") + "}"; }
}

class QueueValue {
    constructor(items = []) {
        this.items = items.slice();
    }

    enqueue(value) {
        this.items.push(value);
        return this;
    }

    dequeue() { return this.items.shift(); }
    peek() { return this.items[0]; }
    isEmpty() { return this.items.length === 0; }
    size() { return this.items.length; }
    toString() { return "Queue(" + this.items.map(formatValue).join(", ") + ")"; }
}

class StackValue {
    constructor(items = []) {
        this.items = items.slice();
    }

    push(value) {
        this.items.push(value);
        return this;
    }

    pop() { return this.items.pop(); }
    peek() { return this.items[this.items.length - 1]; }
    isEmpty() { return this.items.length === 0; }
    size() { return this.items.length; }
    toString() { return "Stack(" + this.items.map(formatValue).join(", ") + ")"; }
}

class GenericType {
    constructor(name, parameters = []) {
        this.name = String(name);
        this.parameters = parameters.slice();
    }

    of(...types) {
        return Object.freeze({
            generic: this.name,
            parameters: this.parameters.slice(),
            types: types.map(String),
            toString: () => this.name + "<" + types.map(String).join(", ") + ">"
        });
    }

    toString() { return this.name + "<" + this.parameters.join(", ") + ">"; }
}

class InterfaceType {
    constructor(name, members = []) {
        this.name = String(name);
        this.members = members.map(String);
    }

    check(value) {
        const target = value instanceof Basic ? value.value : value;
        return this.members.every((member) => target && member in target);
    }

    toString() { return "interface " + this.name; }
}

class BitfieldType {
    constructor(name, fields = []) {
        this.name = String(name);
        this.fields = fields.map(String);
        this.bits = Object.fromEntries(this.fields.map((field, index) => [field, 1 << index]));
    }

    value(...fields) {
        const mask = fields.flat().reduce((current, field) => current | (this.bits[String(field)] || 0), 0);
        return Object.freeze({
            type: this.name,
            mask,
            has: (field) => (mask & (this.bits[String(field)] || 0)) !== 0,
            toString: () => this.name + "(" + this.fields.filter((field) => (mask & this.bits[field]) !== 0).join("|") + ")"
        });
    }

    toString() { return "bitfield " + this.name; }
}

class LazyValue {
    constructor(factory) {
        this.factory = factory;
        this.done = false;
        this.cached = undefined;
    }

    value() {
        if (!this.done) {
            this.cached = this.factory();
            this.done = true;
        }
        return this.cached;
    }

    toString() { return formatValue(this.value()); }
}

function unwrapValue(value) {
    return value instanceof Basic ? value.value : value;
}

function formatValue(value) {
    if (value instanceof Basic) return String(value.value);
    if (value && typeof value.toString === "function" && value.toString !== Object.prototype.toString) {
        return value.toString();
    }
    return JSON.stringify(value);
}

const integer = Basic.integer;
const floater = Basic.floater;
const string  = Basic.string;
const boolean = Basic.boolean;
const pi      = Basic.pi;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

function tuple(...items) { return new TupleValue(items); }
function set(...items) { return new SetValue(items); }
function queue(...items) { return new QueueValue(items); }
function stack(...items) { return new StackValue(items); }
function generic(name, parameters = []) { return new GenericType(name, parameters); }
function interfaceType(name, members = []) { return new InterfaceType(name, members); }
function implementsInterface(value, iface) { return iface instanceof InterfaceType ? iface.check(value) : false; }
function bitfield(name, fields = []) { return new BitfieldType(name, fields); }
function lazy(factory) { return new LazyValue(factory); }
function force(value) { return value instanceof LazyValue ? value.value() : value; }
function generator(...items) { return items[Symbol.iterator](); }
function coroutine(action) { return { next: () => Promise.resolve(typeof action === "function" ? action() : action) }; }
function staticClass(name, members = {}) { return Object.freeze({ className: String(name), ...members }); }
function attr(value, name, data = true) { return withAttributes(value, [{ name: String(name), data }]); }

const operatorOverloads = new Map();

function overload(typeName, operator, fn) {
    operatorOverloads.set(String(typeName) + ":" + String(operator), fn);
}

function applyOperatorOverload(operator, left, right) {
    const key = left && left.constructor ? left.constructor.name + ":" + operator : "";
    const fn = operatorOverloads.get(key);
    return fn ? fn(left, right) : null;
}

function withAttributes(value, attributes) {
    if (value && (typeof value === "object" || typeof value === "function")) {
        const existing = value.__sipyAttributes || [];
        Object.defineProperty(value, "__sipyAttributes", {
            value: existing.concat(attributes),
            enumerable: false,
            configurable: true
        });
        return value;
    }

    return { value, __sipyAttributes: attributes, toString: () => formatValue(value) };
}

function cast(value, targetType) {
    const raw = unwrapValue(force(value));
    switch (String(targetType).toLowerCase()) {
        case "int":
        case "integer":
            return integer(raw);
        case "float":
        case "floater":
            return floater(raw);
        case "str":
        case "string":
            return string(raw);
        case "bool":
        case "boolean":
            return boolean(raw);
        default:
            throw new Error("Unbekannter Cast-Typ '" + targetType + "'");
    }
}

function toIterator(value) {
    value = force(value);
    if (value instanceof QueueValue || value instanceof StackValue) return value.items[Symbol.iterator]();
    if (value instanceof SetValue) return value.toArray()[Symbol.iterator]();
    if (value instanceof TupleValue) return value.toArray()[Symbol.iterator]();
    if (value && typeof value[Symbol.iterator] === "function") return value[Symbol.iterator]();
    throw new Error("Wert ist nicht iterierbar");
}

function enumType(name, members) {
    const enumName = String(name);
    const values = Array.isArray(members) ? members : Array.from(arguments).slice(1);
    const result = {};

    values.forEach((member, index) => {
        const key = String(member);
        result[key] = Object.freeze({ enum: enumName, name: key, ordinal: index, toString: () => enumName + "." + key });
    });

    return Object.freeze(result);
}

const outputEl = document.getElementById("output");

function clearOutput() {
    outputEl.textContent = "";
}

function writeln(x) {
    outputEl.textContent += formatValue(x) + "\n";
}

function getln(promptText = "") {
    const result = window.prompt(promptText);
    return result === null ? "" : result;
}

async function loop(count, action) {
    count = Basic.toBasic(count).value;

    if (typeof action === "string") {
        for (let i = 0; i < count; i++) {
            await executeInline(action);
        }
        return;
    }

    if (typeof action === "function") {
        for (let i = 0; i < count; i++) await action();
        return;
    }

    warn("loop() erwartet String oder Funktion");
}

async function ifcase(condition, actionTrue, actionFalse = null) {
    condition = condition instanceof Basic ? condition.value : condition;
    const selected = condition ? actionTrue : actionFalse;
    if (selected === null) return;
    if (typeof selected === "string") await executeInline(selected);
    else if (typeof selected === "function") await selected();
}

const modules = {
    math: {
        pi: Basic.pi(),
        add: (a, b) => Basic.toBasic(a).value + Basic.toBasic(b).value,
        sqrt: (x) => Math.sqrt(Basic.toBasic(x).value),
        pow: (a, b) => Math.pow(Basic.toBasic(a).value, Basic.toBasic(b).value),
        abs: (x) => Math.abs(Basic.toBasic(x).value)
    },
    strings: {
        upper: (s) => String(Basic.toBasic(s).value).toUpperCase(),
        lower: (s) => String(Basic.toBasic(s).value).toLowerCase(),
        trim: (s) => String(Basic.toBasic(s).value).trim()
    },
    collections: { tuple, set, queue, stack },
    types: {
        generic,
        interface: interfaceType,
        implements: implementsInterface,
        bitfield,
        cast,
        staticClass,
        attr
    },
    concurrency: {
        sleep: (ms) => new Promise((resolve) => setTimeout(resolve, Basic.toBasic(ms).value)),
        coroutine,
        generator,
        lazy,
        force
    },
    random: {
        int: (min, max) => {
            min = Basic.toBasic(min).value;
            max = Basic.toBasic(max).value;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        float: () => Math.random()
    },
    time: {
        now: () => new Date().toLocaleString(),
        sleep: (ms) => new Promise((resolve) => setTimeout(resolve, Basic.toBasic(ms).value))
    }
};

let vars = {};
let constants = new Set();
let warnings = [];
let compiledCache = { code: null, bytecode: null };
let runtimeLimits = { startedAt: 0, timeoutMs: 1000, memoryCap: 200 };
const runtimeNames = new Set([
    "math", "strings", "collections", "random", "time",
    "types", "concurrency",
    "integer", "floater", "string", "boolean", "pi",
    "tuple", "set", "queue", "stack", "enumType", "calc", "f", "print",
    "generic", "interfaceType", "implementsInterface", "bitfield", "cast",
    "lazy", "force", "generator", "coroutine", "staticClass", "attr", "overload",
    "toIterator",
    "writeln", "getln", "loop", "ifcase", "warn", "breakpoint", "True", "False", "None"
]);

function createDefaultVars() {
    return {
        math: modules.math,
        strings: modules.strings,
        collections: modules.collections,
        types: modules.types,
        concurrency: modules.concurrency,
        random: modules.random,
        time: modules.time,
        integer,
        floater,
        string,
        boolean,
        pi,
        tuple,
        set,
        queue,
        stack,
        enumType,
        generic,
        interfaceType,
        implementsInterface,
        bitfield,
        cast,
        lazy,
        force,
        generator,
        coroutine,
        staticClass,
        attr,
        overload,
        toIterator,
        calc,
        f,
        print: writeln,
        writeln,
        getln,
        loop,
        ifcase,
        warn,
        breakpoint: debugBreakpoint,
        True: true,
        False: false,
        None: null
    };
}

function importModule(name) {
    name = String(name);
    if (!modules[name]) throw new Error("Modul '" + name + "' nicht gefunden");
    vars[name] = Object.freeze({ ...modules[name] });
}

function importModuleAs(name, alias) {
    name = String(name);
    alias = String(alias);
    if (!modules[name]) throw new Error("Modul '" + name + "' nicht gefunden");
    if (runtimeNames.has(alias)) throw new Error("Alias '" + alias + "' kollidiert mit einem Runtime-Namen");
    vars[alias] = Object.freeze({ ...modules[name] });
}

function warn(message) {
    warnings.push(String(message));
}

function setVar(name, value) {
    if (constants.has(name)) throw new Error("Konstante Variable '" + name + "' kann nicht neu zugewiesen werden");
    vars[name] = value;
    return value;
}

function defineConst(name, value) {
    if (Object.prototype.hasOwnProperty.call(vars, name)) {
        throw new Error("Konstante '" + name + "' ist bereits definiert");
    }
    vars[name] = value;
    constants.add(name);
    return value;
}

function f(template) {
    return String(template).replace(/\{([^{}]+)\}/g, (_, expr) => {
        return runExpression(expr);
    });
}

function calc(expr) {
    const text = String(expr);
    if (!/^[\d\s+\-*/%().,]+$/.test(text)) {
        throw new Error("Inline-Math erlaubt nur Zahlen und Rechenoperatoren");
    }
    return Function("\"use strict\"; return (" + text + ");")();
}

function runExpression(expr) {
    return Function("vars", "Basic", "formatValue", "with (vars) { return formatValue(" + expr + "); }")(vars, Basic, formatValue);
}

async function executeInline(code) {
    const bytecode = compileSiPy(code).bytecode;
    await executeBytecode(bytecode);
}

function debugBreakpoint() {
    throw Object.assign(new Error("Breakpoint erreicht"), { isBreakpoint: true });
}

function normalizeCode(code) {
    return String(code)
        .replace(/\r\n/g, "\n")
        .replace(/\u201e|\u201c|\u201d/g, "\"")
        .replace(/\u201a|\u2018|\u2019/g, "'");
}

function stripComments(code) {
    let result = "";
    let inString = null;
    let escaped = false;
    let blockComment = false;

    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const next = code[i + 1];

        if (blockComment) {
            if (char === "\n") result += "\n";
            if (char === "*" && next === "/") {
                blockComment = false;
                i++;
            }
            continue;
        }

        if (inString) {
            result += char;
            if (escaped) {
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === inString) {
                inString = null;
            }
            continue;
        }

        if (char === "\"" || char === "'" || char === "`") {
            inString = char;
            result += char;
            continue;
        }

        if (char === "/" && next === "*") {
            blockComment = true;
            i++;
            continue;
        }

        if (char === "#") {
            while (i < code.length && code[i] !== "\n") i++;
            result += "\n";
            continue;
        }

        result += char;
    }

    if (blockComment) throw new Error("Mehrzeiliger Kommentar wurde nicht geschlossen");
    return result;
}

function compileSiPy(code) {
    const normalized = normalizeCode(code);
    if (compiledCache.code === normalized) return compiledCache.bytecode;

    const cleanCode = stripComments(normalized);
    const expanded = expandPythonBlocks(cleanCode);
    const ast = generateAst(expanded);
    const lines = optimizeEntries(expanded);
    const bytecode = [];
    const declared = new Set(Object.keys(createDefaultVars()));
    const assigned = new Set();
    const usedText = cleanCode;
    const parserErrors = [];
    const variableWrites = [];
    let pendingAttributes = [];

    let buffer = [];
    let startLine = 1;
    let depth = 0;

    lines.forEach((entry) => {
        const source = entry.source.trim();
        if (!source) return;

        if (source === "pass") return;

        if (source.startsWith("@")) {
            pendingAttributes.push(parseAttribute(source, entry.line));
            return;
        }

        if (buffer.length === 0) startLine = entry.line;
        let transformed;
        try {
            transformed = transformLine(source, entry.line, declared, assigned, pendingAttributes);
            pendingAttributes = [];
            if (transformed.variableWrite) variableWrites.push({ name: transformed.variableWrite, line: entry.line });
            transformed = transformed.js || transformed;
        } catch (error) {
            parserErrors.push(error.message);
            pendingAttributes = [];
            return;
        }
        buffer.push(transformed);
        depth += braceDelta(transformed);

        if (depth < 0) parserErrors.push("Zeile " + entry.line + ": Unerwartete schliessende Klammer");
        if (depth === 0) {
            try {
                bytecode.push({
                    line: startLine,
                    source: buffer.join("\n"),
                    run: createStatementRunner(buffer.join("\n"), startLine)
                });
            } catch (error) {
                parserErrors.push(error.message);
            }
            buffer = [];
        }
    });

    if (depth !== 0) parserErrors.push("Block wurde nicht geschlossen");
    if (pendingAttributes.length) parserErrors.push("Attribute-Annotation ohne Ziel");

    assigned.forEach((name) => {
        const reads = new RegExp("\\b" + escapeRegExp(name) + "\\b", "g");
        const occurrences = usedText.match(reads);
        if (!occurrences || occurrences.length < 2) warn("Variable '" + name + "' wird gesetzt, aber nicht weiter verwendet");
    });

    if (parserErrors.length) {
        throw new Error("Parserfehler:\n" + parserErrors.join("\n"));
    }

    const result = {
        bytecode,
        debug: {
            ast,
            optimizerPasses: ["peephole:pass-removal", "dead-code:basic-break-trim"],
            variableWrites
        }
    };
    compiledCache = { code: normalized, bytecode: result };
    return result;
}

function expandPythonBlocks(code) {
    const rawLines = code.split("\n");
    const entries = [];
    const stack = [{ indent: 0, closesWithBrace: false }];
    let previousOpenedIndent = false;

    rawLines.forEach((rawLine, index) => {
        if (!rawLine.trim()) return;
        const indent = countIndent(rawLine, index + 1);
        const source = rawLine.trim();
        let skipContinuationClose = isContinuationLine(source);

        if (indent > stack[stack.length - 1].indent) {
            if (!previousOpenedIndent) {
                throw new Error("Zeile " + (index + 1) + ": Unerwartete Einrueckung");
            }
            stack.push({
                indent,
                closesWithBrace: previousOpenedIndent === "brace"
            });
        } else if (indent < stack[stack.length - 1].indent) {
            while (indent < stack[stack.length - 1].indent) {
                const closed = stack.pop();
                if (closed.closesWithBrace) {
                    if (skipContinuationClose) {
                        skipContinuationClose = false;
                    } else {
                        entries.push({ line: index + 1, source: "}" });
                    }
                }
            }
            if (indent !== stack[stack.length - 1].indent) {
                throw new Error("Zeile " + (index + 1) + ": Einrueckung passt zu keinem Block");
            }
        }

        const blockKind = pythonBlockKind(source);
        entries.push({ line: index + 1, source });
        previousOpenedIndent = blockKind;
    });

    while (stack.length > 1) {
        const closed = stack.pop();
        if (closed.closesWithBrace) entries.push({ line: rawLines.length, source: "}", indent: 0 });
    }

    return entries;
}

function generateAst(entries) {
    return entries
        .filter((entry) => entry.source !== "}")
        .map((entry) => ({
            line: entry.line,
            kind: astKind(entry.source),
            source: entry.source
        }));
}

function astKind(source) {
    if (source.startsWith("@")) return "attribute";
    if (/^for\b/.test(source)) return "for";
    if (/^(match|switch)\b/.test(source)) return "match";
    if (/^case\b/.test(source)) return "case";
    if (/^interface\b/.test(source)) return "interface";
    if (/^generic\b/.test(source)) return "generic";
    if (/^try\b|^except\b|^finally\b/.test(source)) return "error-handling";
    if (/^[A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*\s*:?=/.test(source)) return "assignment";
    return "expression";
}

function optimizeEntries(entries) {
    // Dead-code trim: once a `case`/`default` body reaches an unconditional
    // break/return *at its own nesting level*, any further statements before
    // the next case/default/close are unreachable and can be dropped.
    // Crucially this must NOT trigger on a break/return nested inside a
    // for/while/if/try that lives inside the case body - a `break` that
    // exits an inner loop does not end the surrounding case.
    const optimized = [];
    let skipFromDepth = null; // depth at which the triggering break/return sat
    let depth = 0;

    for (const entry of entries) {
        const trimmed = entry.source.trim();
        if (trimmed === "pass") continue;

        const isClose = trimmed === "}";
        const isCaseLabel = /^(case\b|default\s*:)/.test(trimmed);
        // elif/else/except/finally implicitly close the block they continue
        // (no separate "}" entry is emitted for that dedent upstream), so
        // treat them the same as a close for depth purposes before reopening.
        const isContinuation = isContinuationLine(trimmed);
        const opensBlock = !isCaseLabel && trimmed.endsWith(":");

        if (isContinuation) depth--;

        if (skipFromDepth !== null) {
            // Stop skipping once we dedent back to (or above) the level the
            // break/return happened at, and land on a case/default/close/continuation.
            if ((isCaseLabel || isClose || isContinuation) && depth <= skipFromDepth) {
                skipFromDepth = null;
            } else {
                if (isClose) depth--;
                else if (opensBlock) depth++;
                continue;
            }
        }

        optimized.push(entry);

        if (isClose) {
            depth--;
        } else if (opensBlock) {
            depth++;
        }

        if (skipFromDepth === null && /^(break|return)\b/.test(trimmed)) {
            skipFromDepth = depth;
        }
    }

    return optimized;
}

function parseAttribute(source, line) {
    const match = source.match(/^@([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)(?:\((.*)\))?$/u);
    if (!match) throw new Error("Zeile " + line + ": Ungueltige Attribute-Annotation");
    const data = match[2] ? transformInterpolatedStrings(match[2]) : "true";
    return "{ name: " + JSON.stringify(match[1]) + ", data: " + data + " }";
}

function isContinuationLine(source) {
    return /^(elif\b|else\s*:|except\b|finally\s*:)/u.test(source);
}

function countIndent(line, lineNumber) {
    let count = 0;
    for (const char of line) {
        if (char === " ") count++;
        else if (char === "\t") count += 4;
        else break;
    }
    if (count % 4 !== 0) warn("Zeile " + lineNumber + ": Einrueckung ist nicht durch 4 teilbar");
    return count;
}

function pythonBlockKind(source) {
    if (!source.endsWith(":")) return false;
    if (/^(case\b|default\s*:)/.test(source)) return "label";
    return "brace";
}

function applyPendingAttributes(expr, pendingAttributes) {
    if (!pendingAttributes.length) return expr;
    return "withAttributes(" + expr + ", [" + pendingAttributes.join(", ") + "])";
}

function transformLine(line, lineNumber, declared, assigned, pendingAttributes = []) {
    const importAlias = line.match(/^import\s+([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)\s+as\s+([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)$/u);
    if (importAlias) return "importModuleAs(" + JSON.stringify(importAlias[1]) + ", " + JSON.stringify(importAlias[2]) + ");";

    if (/^import\s*\(/.test(line)) return line.replace(/^import\s*\(/, "importModule(");

    const genericLine = line.match(/^generic\s+([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)\s*\[(.*)\]$/u);
    if (genericLine) {
        const name = genericLine[1];
        const params = splitArgs(genericLine[2]).map((part) => JSON.stringify(part));
        declared.add(name);
        assigned.add(name);
        return { js: "setVar(" + JSON.stringify(name) + ", generic(" + JSON.stringify(name) + ", [" + params.join(", ") + "]));", variableWrite: name };
    }

    const interfaceLine = line.match(/^interface\s+([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)\s*\((.*)\)$/u);
    if (interfaceLine) {
        const name = interfaceLine[1];
        const members = splitArgs(interfaceLine[2]).map((part) => JSON.stringify(part.replace(/^["']|["']$/g, "")));
        declared.add(name);
        assigned.add(name);
        return { js: "setVar(" + JSON.stringify(name) + ", interfaceType(" + JSON.stringify(name) + ", [" + members.join(", ") + "]));", variableWrite: name };
    }

    const constMatch = line.match(/^const\s+([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)\s*=\s*(.+)$/u);
    if (constMatch) {
        declared.add(constMatch[1]);
        assigned.add(constMatch[1]);
        return { js: "defineConst(" + JSON.stringify(constMatch[1]) + ", " + applyPendingAttributes(transformInterpolatedStrings(constMatch[2]), pendingAttributes) + ");", variableWrite: constMatch[1] };
    }

    const walrusConst = line.match(/^([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)\s*:=\s*(.+)$/u);
    if (walrusConst) {
        declared.add(walrusConst[1]);
        assigned.add(walrusConst[1]);
        return { js: "defineConst(" + JSON.stringify(walrusConst[1]) + ", " + applyPendingAttributes(transformInterpolatedStrings(walrusConst[2]), pendingAttributes) + ");", variableWrite: walrusConst[1] };
    }

    const forRange = line.match(/^for\s+([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)\s+in\s+range\s*\((.*)\)\s*:$/u);
    if (forRange) {
        const name = forRange[1];
        const parts = splitArgs(forRange[2]);
        const start = parts.length === 1 ? "0" : parts[0];
        const end = parts.length === 1 ? parts[0] : parts[1];
        const step = parts[2] || "1";
        declared.add(name);
        assigned.add(name);
        return "for (setVar(" + JSON.stringify(name) + ", " + start + "); vars[" + JSON.stringify(name) + "] < (" + end + "); setVar(" + JSON.stringify(name) + ", vars[" + JSON.stringify(name) + "] + (" + step + "))) {";
    }

    const forIterator = line.match(/^for\s+([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)\s+in\s+(.+)\s*:$/u);
    if (forIterator) {
        const name = forIterator[1];
        declared.add(name);
        assigned.add(name);
        return "for (const __sipyItem of toIterator(" + transformInterpolatedStrings(forIterator[2]) + ")) { setVar(" + JSON.stringify(name) + ", __sipyItem);";
    }

    const matchLine = line.match(/^(match|switch)\s+(.+)\s*:$/u);
    if (matchLine) return "switch (" + transformInterpolatedStrings(matchLine[2]) + ") {";

    const ifLine = line.match(/^if\s+(.+)\s*:$/u);
    if (ifLine) return "if (" + transformInterpolatedStrings(ifLine[1]) + ") {";

    const elifLine = line.match(/^elif\s+(.+)\s*:$/u);
    if (elifLine) return "} else if (" + transformInterpolatedStrings(elifLine[1]) + ") {";

    if (/^else\s*:$/u.test(line)) return "} else {";

    const whileLine = line.match(/^while\s+(.+)\s*:$/u);
    if (whileLine) return "while (" + transformInterpolatedStrings(whileLine[1]) + ") {";

    if (/^try\s*:$/u.test(line)) return "try {";

    const exceptLine = line.match(/^except(?:\s+([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*))?\s*:$/u);
    if (exceptLine) return "} catch (" + (exceptLine[1] || "error") + ") {";

    if (/^finally\s*:$/u.test(line)) return "} finally {";

    const caseLine = line.match(/^case\s+(.+)\s*:$/u);
    if (caseLine) return "case " + transformInterpolatedStrings(caseLine[1]) + ":";

    if (/^default\s*:$/u.test(line)) return "default:";

    const assignment = line.match(/^([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)\s*=\s*(.+)$/u);
    if (assignment && !/^(if|for|while|switch|catch)\b/.test(line)) {
        declared.add(assignment[1]);
        assigned.add(assignment[1]);
        return { js: "setVar(" + JSON.stringify(assignment[1]) + ", " + applyPendingAttributes(transformInterpolatedStrings(assignment[2]), pendingAttributes) + ");", variableWrite: assignment[1] };
    }

    const jsFor = line.match(/^for\s*\(\s*([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)\s*=\s*([^;]+);(.+)$/u);
    if (jsFor) {
        declared.add(jsFor[1]);
        assigned.add(jsFor[1]);
        return line.replace(/^for\s*\(\s*([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)\s*=\s*([^;]+);/u, (_, name, expr) => {
            return "for (setVar(" + JSON.stringify(name) + ", " + expr + ");";
        });
    }

    if (/==[^=]/.test(line)) warn("Zeile " + lineNumber + ": Nutze nach Moeglichkeit .eq() statt losem ==");
    return transformInterpolatedStrings(line);
}

function transformInterpolatedStrings(line) {
    const withPythonFStrings = line.replace(/\bf(["'])(?:(?=(\\?))\2.)*?\1/g, (match) => {
        const content = match.slice(2, -1)
            .replace(/`/g, "\\`")
            .replace(/\{([^{}]+)\}/g, "${$1}");
        return "`" + content + "`";
    });

    return withPythonFStrings.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (match) => {
        if (!match.includes("${")) return match;
        const content = match.slice(1, -1).replace(/`/g, "\\`");
        return "`" + content + "`";
    });
}

function splitArgs(text) {
    const result = [];
    let current = "";
    let depth = 0;
    let quote = null;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (quote) {
            current += char;
            if (char === quote && text[i - 1] !== "\\") quote = null;
            continue;
        }
        if (char === "\"" || char === "'") {
            quote = char;
            current += char;
            continue;
        }
        if (char === "(") depth++;
        if (char === ")") depth--;
        if (char === "," && depth === 0) {
            result.push(current.trim());
            current = "";
            continue;
        }
        current += char;
    }
    if (current.trim()) result.push(current.trim());
    return result;
}

function braceDelta(text) {
    let delta = 0;
    let quote = null;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (quote) {
            if (char === quote && text[i - 1] !== "\\") quote = null;
            continue;
        }
        if (char === "\"" || char === "'" || char === "`") {
            quote = char;
            continue;
        }
        if (char === "{") delta++;
        if (char === "}") delta--;
    }
    return delta;
}

function createStatementRunner(js, line) {
    try {
        return AsyncFunction(
            "vars", "Basic", "setVar", "defineConst", "importModule", "importModuleAs", "formatValue", "withAttributes",
            "with (vars) {\n" + js + "\n}"
        );
    } catch (error) {
        throw new Error("Zeile " + line + ": Parserfehler: " + error.message);
    }
}

async function executeBytecode(bytecode, options = {}) {
    let executedLines = 0;
    const maxSteps = options.maxSteps || Infinity;
    for (let index = options.startIndex || 0; index < bytecode.length && executedLines < maxSteps; index++) {
        const statement = bytecode[index];
        checkRuntimeLimits(statement.line);
        if (options.breakpoints && options.breakpoints.has(statement.line)) {
            return { executedLines, paused: true, index, line: statement.line, reason: "breakpoint" };
        }
        try {
            await statement.run(vars, Basic, setVar, defineConst, importModule, importModuleAs, formatValue, withAttributes);
            executedLines++;
        } catch (error) {
            if (error.isBreakpoint) {
                return { executedLines, paused: true, index: index + 1, line: statement.line, reason: "breakpoint" };
            }
            throw new Error("Zeile " + statement.line + ": " + error.message);
        }
    }
    const nextIndex = (options.startIndex || 0) + executedLines;
    return { executedLines, paused: false, index: Math.min(nextIndex, bytecode.length) };
}

function checkRuntimeLimits(line) {
    if (runtimeLimits.timeoutMs > 0 && Date.now() - runtimeLimits.startedAt > runtimeLimits.timeoutMs) {
        throw new Error("Zeile " + line + ": Runtime-Timeout nach " + runtimeLimits.timeoutMs + " ms");
    }
    const memorySize = Object.keys(vars).filter((key) => !runtimeNames.has(key)).length;
    if (runtimeLimits.memoryCap > 0 && memorySize > runtimeLimits.memoryCap) {
        throw new Error("Zeile " + line + ": Memory-Cap von " + runtimeLimits.memoryCap + " Variablen erreicht");
    }
}

function resetRuntime(options = {}) {
    vars = createDefaultVars();
    constants = new Set();
    warnings = [];
    runtimeLimits = {
        startedAt: Date.now(),
        timeoutMs: options.timeoutMs ?? 1000,
        memoryCap: options.memoryCap ?? 200
    };
}

async function runSiPy(code, options = {}) {
    resetRuntime(options);
    const compiled = compileSiPy(code);
    const result = await executeBytecode(compiled.bytecode, options);
    result.warnings = warnings.slice();
    result.memory = inspectMemory();
    result.debug = compiled.debug;
    return result;
}

function createDebugSession(code, breakpoints = new Set(), options = {}) {
    resetRuntime(options);
    const compiled = compileSiPy(code);
    return {
        bytecode: compiled.bytecode,
        debug: compiled.debug,
        index: 0,
        breakpoints: new Set(breakpoints),
        done: compiled.bytecode.length === 0
    };
}

async function stepDebugSession(session) {
    if (!session || session.done) return { done: true, warnings: warnings.slice(), memory: inspectMemory() };
    // The timeout budget must only cover the time actually spent executing
    // SiPy code, not the real-world time a user spends thinking between
    // clicks of "Step". Without this reset, pausing for more than
    // timeoutMs between steps falsely throws a Runtime-Timeout error.
    runtimeLimits.startedAt = Date.now();
    const result = await executeBytecode(session.bytecode, {
        startIndex: session.index,
        breakpoints: session.breakOnRun ? session.breakpoints : null,
        maxSteps: 1
    });
    session.index = result.index;
    session.done = session.index >= session.bytecode.length;
    return { ...result, done: session.done, warnings: warnings.slice(), memory: inspectMemory(), debug: session.debug };
}

function inspectMemory() {
    return Object.keys(vars)
        .filter((key) => !runtimeNames.has(key) && typeof vars[key] !== "function")
        .sort()
        .map((key) => ({
            name: key,
            value: formatValue(vars[key]),
            constant: constants.has(key)
        }));
}

function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}