class Basic:
    def __init__(self, value):
        self.value = value

    # -----------------------------
    # Hilfsfunktionen für Datentypen
    # -----------------------------
    @staticmethod
    def integer(value):
        return Basic(int(value))

    @staticmethod
    def floater(value):
        return Basic(float(value))

    @staticmethod
    def string(value):
        return Basic(str(value))

    @staticmethod
    def boolean(value):
        return Basic(bool(value))

    # -----------------------------
    # Automatische Umwandlung
    # -----------------------------
    @staticmethod
    def to_basic(x):
        return x if isinstance(x, Basic) else Basic(x)

    # -----------------------------
    # Operatoren
    # -----------------------------
    def add(self, other):
        other = Basic.to_basic(other)
        return Basic(self.value + other.value)

    def sub(self, other):
        other = Basic.to_basic(other)
        return Basic(self.value - other.value)

    def mul(self, other):
        other = Basic.to_basic(other)
        return Basic(self.value * other.value)

    def div(self, other):
        other = Basic.to_basic(other)
        return Basic(self.value / other.value)

    def mod(self, other):
        other = Basic.to_basic(other)
        return Basic(self.value % other.value)

    def __eq__(self, other):
        other = Basic.to_basic(other)
        return self.value == other.value

    def __ne__(self, other):
        other = Basic.to_basic(other)
        return self.value != other.value

    def __gt__(self, other):
        other = Basic.to_basic(other)
        return self.value > other.value

    def __lt__(self, other):
        other = Basic.to_basic(other)
        return self.value < other.value

    def __ge__(self, other):
        other = Basic.to_basic(other)
        return self.value >= other.value

    def __le__(self, other):
        other = Basic.to_basic(other)
        return self.value <= other.value

    # -----------------------------
    # Ausgabe
    # -----------------------------
    @staticmethod
    def writeln(output):
        # Basic-Objekt --> Wert extrahieren
        if isinstance(output, Basic):
            output = output.value

        # Funktion zurückgeben, die später ausgeführt wird
        def fn():
            print(output)

        return fn

    # -----------------------------
    # Eingabe
    # -----------------------------
    @staticmethod
    def getln(prompt_text=""):
        # Eingabe vom Benutzer
        return input(prompt_text)

    # -----------------------------
    # Vergleich
    # -----------------------------
    def ifcase(condition, action_true, action_false=None):
        # Basic -> echten Wert extrahieren
        if isinstance(condition, Basic):
            condition = condition.value

        if condition:
            # TRUE Zweig
            if isinstance(action_true, str):
                eval(action_true)
            elif callable(action_true):
                action_true()
            else:
                writeln(action_true)
        else:
            # FALSE Zweig
            if action_false is None:
                return
            if isinstance(action_false, str):
                eval(action_false)
            elif callable(action_false):
                action_false()
            else:
                writeln(action_false)

    # -----------------------------
    # Loop
    # -----------------------------
    @staticmethod
    def loop(count, statement):
        count = Basic.to_basic(count).value
        for _ in range(int(count)):
            statement()

    # -----------------------------
    # Pi
    # -----------------------------
    def pi(self):
        return Basic(3.1415926 * self)

def import_module(name, vars):
    name = str(name)

    if name not in modules:
        print(f"Fehler: Modul '{name}' existiert nicht")
        return

    vars[name] = modules[name]

# -----------------------------
# Kurzbefehle
# -----------------------------
integer = Basic.integer
floater = Basic.floater
string = Basic.string
boolean = Basic.boolean
writeln = Basic.writeln
loop = Basic.loop
pi = Basic.pi
add = Basic.add
sub = Basic.sub
mul = Basic.mul
div = Basic.div
mod = Basic.mod
ifcase = Basic.ifcase
getln = Basic.getln
#made by Metrix31

sipy_globals = {
    "Basic": Basic,
    "integer": integer,
    "floater": floater,
    "string": string,
    "boolean": boolean,
    "writeln": writeln,
    "loop": loop,
    "ifcase": ifcase,
    "getln": getln,
    "import_module": import_module
}

class SiPyMath:
    @staticmethod
    def pi():
        return Basic(3.1415926)

    @staticmethod
    def add(a, b):
        a = Basic.to_basic(a).value
        b = Basic.to_basic(b).value
        return Basic(a + b)

    @staticmethod
    def sqrt(x):
        x = Basic.to_basic(x).value
        return Basic(x ** 0.5)


class SiPyStrings:
    @staticmethod
    def upper(s):
        s = str(Basic.to_basic(s).value)
        return Basic(s.upper())

    @staticmethod
    def lower(s):
        s = str(Basic.to_basic(s).value)
        return Basic(s.lower())

    @staticmethod
    def contains(s, sub):
        s = str(Basic.to_basic(s).value)
        sub = str(Basic.to_basic(sub).value)
        return Basic(sub in s)

modules = {
    "math": SiPyMath,
    "strings": SiPyStrings
}
