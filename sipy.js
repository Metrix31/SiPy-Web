// --- SiPy Runtime in JavaScript ---

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

    add(other) {
        other = Basic.toBasic(other);
        return new Basic(this.value + other.value);
    }
    sub(other) {
        other = Basic.toBasic(other);
        return new Basic(this.value - other.value);
    }
    mul(other) {
        other = Basic.toBasic(other);
        return new Basic(this.value * other.value);
    }
    div(other) {
        other = Basic.toBasic(other);
        return new Basic(this.value / other.value);
    }
    mod(other) {
        other = Basic.toBasic(other);
        return new Basic(this.value % other.value);
    }

    static pi() {
        return new Basic(3.1415926);
    }
}

// Kurzbefehle
function integer(v)  { return Basic.integer(v); }
function floater(v)  { return Basic.floater(v); }
function string(v)   { return Basic.string(v); }
function boolean(v)  { return Basic.boolean(v); }
function pi()        { return Basic.pi(); }

// Output
const outputEl = document.getElementById("output");

function clearOutput() {
    outputEl.textContent = "";
}

function writeln(x) {
    if (x instanceof Basic) x = x.value;
    outputEl.textContent += x + "\n";
}

function loop(count, action) {
    count = Basic.toBasic(count).value;

    // Wenn action KEINE Funktion ist -> Ausdruck in Funktion umwandeln
    if (typeof action !== "function") {
        let expr = action; // z. B. writeln("Hallo Welt!")
        action = function() {
            with (vars) {
                eval(expr);
            }
        };
    }

    for (let i = 0; i < parseInt(count); i++) {
        action();
    }
}

// --- Eigene Variablen ohne "let" ---
let vars = {};

function runSiPy(code) {
    const lines = code.split("\n");

    for (let rawLine of lines) {
        let line = rawLine.trim();
        if (line === "") continue;

        // Variable = Ausdruck
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