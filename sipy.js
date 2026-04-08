// --- SiPy Runtime (neue Version) ---

class Basic {
    constructor(value) {
        this.value = value;
    }

    static toBasic(x) {
        return x instanceof Basic ? x : new Basic(x);
    }

    static integer(v) { return new Basic(parseInt(v)); }
    static floater(v) { return new Basic(parseFloat(v)); }
    static string(v)  { return new Basic(String(v)); }
    static boolean(v) { return new Basic(Boolean(v)); }

    add(other) { return new Basic(this.value + Basic.toBasic(other).value); }
    sub(other) { return new Basic(this.value - Basic.toBasic(other).value); }
    mul(other) { return new Basic(this.value * Basic.toBasic(other).value); }
    div(other) { return new Basic(this.value / Basic.toBasic(other).value); }
    mod(other) { return new Basic(this.value % Basic.toBasic(other).value); }

    // Vergleichsoperatoren
    eq(other)  { return this.value == Basic.toBasic(other).value; }
    neq(other) { return this.value != Basic.toBasic(other).value; }
    gt(other)  { return this.value >  Basic.toBasic(other).value; }
    lt(other)  { return this.value <  Basic.toBasic(other).value; }
    ge(other)  { return this.value >= Basic.toBasic(other).value; }
    le(other)  { return this.value <= Basic.toBasic(other).value; }

    static pi() { return new Basic(3.1415926); }
}

function integer(v)  { return Basic.integer(v); }
function floater(v)  { return Basic.floater(v); }
function string(v)   { return Basic.string(v); }
function boolean(v)  { return Basic.boolean(v); }
function pi()        { return Basic.pi(); }

const outputEl = document.getElementById("output");

function clearOutput() {
    outputEl.textContent = "";
}

function writeln(x) {
    if (x instanceof Basic) x = x.value;
    outputEl.textContent += x + "\n";
}

// --- verbesserter Loop: String oder Funktion ---
function loop(count, action) {
    count = Basic.toBasic(count).value;

    if (typeof action === "string") {
        for (let i = 0; i < count; i++) {
            with (vars) {
                eval(action);
            }
        }
        return;
    }

    if (typeof action === "function") {
        for (let i = 0; i < count; i++) {
            action();
        }
        return;
    }

    writeln("Fehler: loop() erwartet String oder Funktion");
}

// --- IF + ELSE ---
function ifcase(condition, actionTrue, actionFalse = null) {
    if (condition instanceof Basic) {
        condition = condition.value;
    }

    if (condition) {
        if (typeof actionTrue === "string") {
            with (vars) eval(actionTrue);
        } else if (typeof actionTrue === "function") {
            actionTrue();
        }
    } else {
        if (actionFalse === null) return;

        if (typeof actionFalse === "string") {
            with (vars) eval(actionFalse);
        } else if (typeof actionFalse === "function") {
            actionFalse();
        }
    }
}

let vars = {};

function runSiPy(code) {
    const lines = code.split("\n");

    for (let rawLine of lines) {
        let line = rawLine.trim();
        if (line === "") continue;

        if (line.includes("=")) {
            let [name, expr] = line.split("=").map(s => s.trim());
            with (vars) {
                vars[name] = eval(expr);
            }
        } else {
            with (vars) {
                eval(line);
            }
        }
    }
}