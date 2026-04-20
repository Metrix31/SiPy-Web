import sys
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QTextEdit, QPushButton,
    QFileDialog, QVBoxLayout, QWidget, QMenuBar, QStatusBar, QInputDialog
)
from PySide6.QtGui import QAction, QTextCursor, QFont
from PySide6.QtCore import Qt

from basicSipy import *

def qt_getln(prompt_text=""):
    text, ok = QInputDialog.getText(None, "Eingabe", prompt_text)
    if ok:
        return text
    else:
        return ""

Basic.getln = staticmethod(qt_getln)
getln = qt_getln

# ---------------------------------------------------------
# Output Redirector
# ---------------------------------------------------------
class OutputRedirector:
    def __init__(self, widget):
        self.widget = widget

    def write(self, text):
        self.widget.moveCursor(QTextCursor.End)
        self.widget.insertPlainText(text)
        self.widget.moveCursor(QTextCursor.End)

    def flush(self):
        pass


# ---------------------------------------------------------
# SiPy Editor
# ---------------------------------------------------------
class SiPyEditor(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("SiPy Editor (Qt Version)")
        self.resize(900, 700)

        # ---- Editor ----
        self.editor = QTextEdit()
        self.editor.setFont(QFont("Consolas", 12))

        # ---- Output ----
        self.output = QTextEdit()
        self.output.setReadOnly(True)
        self.output.setStyleSheet("background-color: #111; color: #0f0;")
        self.output.setFont(QFont("Consolas", 11))

        # ---- Run Button ----
        self.run_button = QPushButton("Run")
        self.run_button.clicked.connect(self.run_sipy)

        # ---- Layout ----
        layout = QVBoxLayout()
        layout.addWidget(self.editor)
        layout.addWidget(self.run_button)
        layout.addWidget(self.output)

        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)

        # ---- Menü ----
        menu = QMenuBar()
        file_menu = menu.addMenu("File")

        open_action = QAction("Open", self)
        open_action.triggered.connect(self.open_file)

        save_action = QAction("Save", self)
        save_action.triggered.connect(self.save_file)

        file_menu.addAction(open_action)
        file_menu.addAction(save_action)

        self.setMenuBar(menu)
        self.setStatusBar(QStatusBar())

        # ---- stdout/stderr umleiten ----
        sys.stdout = OutputRedirector(self.output)
        sys.stderr = OutputRedirector(self.output)

    # ---------------------------------------------------------
    # SiPy Code ausführen
    # ---------------------------------------------------------
    def run_sipy(self):
        code = self.editor.toPlainText()
        self.output.clear()

        # eigener Namespace für SiPy
        sipy_env = {}

        # Interpreter-Funktionen hineinladen
        sipy_env.update(globals())

        try:
            exec(code, sipy_env)
        except Exception as e:
            print(f"Fehler: {e}")

    # ---------------------------------------------------------
    # Datei öffnen
    # ---------------------------------------------------------
    def open_file(self):
        path, _ = QFileDialog.getOpenFileName(
            self, "Open SiPy File", "", "SiPy Files (*.sipy)"
        )
        if not path:
            return

        with open(path, "r", encoding="utf-8") as f:
            self.editor.setPlainText(f.read())

    # ---------------------------------------------------------
    # Datei speichern
    # ---------------------------------------------------------
    def save_file(self):
        path, _ = QFileDialog.getSaveFileName(
            self, "Save SiPy File", "", "SiPy Files (*.sipy)"
        )
        if not path:
            return

        with open(path, "w", encoding="utf-8") as f:
            f.write(self.editor.toPlainText())


# ---------------------------------------------------------
# Start
# ---------------------------------------------------------
app = QApplication(sys.argv)
window = SiPyEditor()
window.show()
app.exec()