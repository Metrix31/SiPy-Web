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

    add(other) { return new Basic(this.value + Basic.toBasic(other).value); }
    sub(other) { return new Basic(this.value - Basic.toBasic(other).value); }
    mul(other) { return new Basic(this.value * Basic.toBasic(other).value); }
    div(other) { return new Basic(this.value / Basic.toBasic(other).value); }
    mod(other) { return new Basic(this.value % Basic.toBasic(other).value); }

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

function tuple(...items) { return new TupleValue(items); }
function set(...items) { return new SetValue(items); }
function queue(...items) { return new QueueValue(items); }
function stack(...items) { return new StackValue(items); }

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

function loop(count, action) {
    count = Basic.toBasic(count).value;

    if (typeof action === "string") {
        for (let i = 0; i < count; i++) {
            executeInline(action);
        }
        return;
    }

    if (typeof action === "function") {
        for (let i = 0; i < count; i++) action();
        return;
    }

    warn("loop() erwartet String oder Funktion");
}

function ifcase(condition, actionTrue, actionFalse = null) {
    condition = condition instanceof Basic ? condition.value : condition;
    const selected = condition ? actionTrue : actionFalse;
    if (selected === null) return;
    if (typeof selected === "string") executeInline(selected);
    else if (typeof selected === "function") selected();
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
        sleep: (ms) => {
            ms = Basic.toBasic(ms).value;
            const start = Date.now();
            while (Date.now() - start < ms) {}
        }
    }
};

let vars = {};
let constants = new Set();
let warnings = [];
let compiledCache = { code: null, bytecode: null };
const runtimeNames = new Set([
    "math", "strings", "collections", "random", "time",
    "integer", "floater", "string", "boolean", "pi",
    "tuple", "set", "queue", "stack", "enumType", "calc", "f", "print",
    "writeln", "getln", "loop", "ifcase", "warn", "breakpoint", "True", "False", "None"
]);

function createDefaultVars() {
    return {
        math: modules.math,
        strings: modules.strings,
        collections: modules.collections,
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
    vars[name] = modules[name];
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

function executeInline(code) {
    const bytecode = compileSiPy(code).bytecode;
    executeBytecode(bytecode);
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
    const lines = expandPythonBlocks(cleanCode);
    const bytecode = [];
    const declared = new Set(Object.keys(createDefaultVars()));
    const assigned = new Set();
    const usedText = cleanCode;

    let buffer = [];
    let startLine = 1;
    let depth = 0;

    lines.forEach((entry) => {
        const source = entry.source.trim();
        if (!source) return;

        if (buffer.length === 0) startLine = entry.line;
        const transformed = transformLine(source, entry.line, declared, assigned);
        buffer.push(transformed);
        depth += braceDelta(transformed);

        if (depth < 0) throw new Error("Zeile " + entry.line + ": Unerwartete schliessende Klammer");
        if (depth === 0) {
            bytecode.push({
                line: startLine,
                source: buffer.join("\n"),
                run: createStatementRunner(buffer.join("\n"), startLine)
            });
            buffer = [];
        }
    });

    if (depth !== 0) throw new Error("Block wurde nicht geschlossen");

    assigned.forEach((name) => {
        const reads = new RegExp("\\b" + escapeRegExp(name) + "\\b", "g");
        const occurrences = usedText.match(reads);
        if (!occurrences || occurrences.length < 2) warn("Variable '" + name + "' wird gesetzt, aber nicht weiter verwendet");
    });

    const result = { bytecode };
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
        if (closed.closesWithBrace) entries.push({ line: rawLines.length, source: "}" });
    }

    return entries;
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

function transformLine(line, lineNumber, declared, assigned) {
    if (/^import\s*\(/.test(line)) return line.replace(/^import\s*\(/, "importModule(");

    const constMatch = line.match(/^const\s+([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)\s*=\s*(.+)$/u);
    if (constMatch) {
        declared.add(constMatch[1]);
        assigned.add(constMatch[1]);
        return "defineConst(" + JSON.stringify(constMatch[1]) + ", " + transformInterpolatedStrings(constMatch[2]) + ");";
    }

    const walrusConst = line.match(/^([A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)\s*:=\s*(.+)$/u);
    if (walrusConst) {
        declared.add(walrusConst[1]);
        assigned.add(walrusConst[1]);
        return "defineConst(" + JSON.stringify(walrusConst[1]) + ", " + transformInterpolatedStrings(walrusConst[2]) + ");";
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
        return "setVar(" + JSON.stringify(assignment[1]) + ", " + transformInterpolatedStrings(assignment[2]) + ");";
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
        return Function(
            "vars", "Basic", "setVar", "defineConst", "importModule", "formatValue",
            "with (vars) {\n" + js + "\n}"
        );
    } catch (error) {
        throw new Error("Zeile " + line + ": Parserfehler: " + error.message);
    }
}

function executeBytecode(bytecode, options = {}) {
    let executedLines = 0;
    const maxSteps = options.maxSteps || Infinity;
    for (let index = options.startIndex || 0; index < bytecode.length && executedLines < maxSteps; index++) {
        const statement = bytecode[index];
        if (options.breakpoints && options.breakpoints.has(statement.line)) {
            return { executedLines, paused: true, index, line: statement.line, reason: "breakpoint" };
        }
        try {
            statement.run(vars, Basic, setVar, defineConst, importModule, formatValue);
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

function resetRuntime() {
    vars = createDefaultVars();
    constants = new Set();
    warnings = [];
}

function runSiPy(code, options = {}) {
    resetRuntime();
    const compiled = compileSiPy(code);
    const result = executeBytecode(compiled.bytecode, options);
    result.warnings = warnings.slice();
    result.memory = inspectMemory();
    return result;
}

function createDebugSession(code, breakpoints = new Set()) {
    resetRuntime();
    const compiled = compileSiPy(code);
    return {
        bytecode: compiled.bytecode,
        index: 0,
        breakpoints: new Set(breakpoints),
        done: compiled.bytecode.length === 0
    };
}

function stepDebugSession(session) {
    if (!session || session.done) return { done: true, warnings: warnings.slice(), memory: inspectMemory() };
    const result = executeBytecode(session.bytecode, {
        startIndex: session.index,
        breakpoints: session.breakOnRun ? session.breakpoints : null,
        maxSteps: 1
    });
    session.index = result.paused ? result.index : result.index;
    session.done = session.index >= session.bytecode.length;
    return { ...result, done: session.done, warnings: warnings.slice(), memory: inspectMemory() };
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
