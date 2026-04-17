import tkinter as tk
from tkinter import filedialog
import sys
from basicSipy import *

class OutputRedirector:
    def __init__(self, widget):
        self.widget = widget

    def write(self, text):
        self.widget.config(state="normal")
        self.widget.insert(tk.END, text)
        self.widget.see(tk.END)
        self.widget.config(state="disabled")

    def flush(self):
        pass

def run_code():
    code = text.get("1.0", tk.END)
    output.config(state="normal")
    output.delete("1.0", tk.END)
    output.config(state="disabled")

    try:
        exec(code, globals())
    except Exception as e:
        print(f"Fehler: {e}")

def open_file():
    path = filedialog.askopenfilename(filetypes=[("SiPy Files", "*.sipy")])
    if not path:
        return
    with open(path, "r") as f:
        text.delete("1.0", tk.END)
        text.insert("1.0", f.read())

def save_file():
    path = filedialog.asksaveasfilename(defaultextension=".sipy")
    if not path:
        return
    with open(path, "w") as f:
        f.write(text.get("1.0", tk.END))

root = tk.Tk()
root.title("SiPy Editor")

text = tk.Text(root, font=("Consolas", 12))
text.pack(fill="both", expand=True)

run_button = tk.Button(root, text="Run", command=run_code)
run_button.pack()

output = tk.Text(root, height=10, state="disabled", bg="#111", fg="#0f0")
output.pack(fill="x")

sys.stdout = OutputRedirector(output)
sys.stderr = OutputRedirector(output)

menu = tk.Menu(root)
filemenu = tk.Menu(menu, tearoff=0)
filemenu.add_command(label="Open", command=open_file)
filemenu.add_command(label="Save", command=save_file)
menu.add_cascade(label="File", menu=filemenu)
root.config(menu=menu)

root.mainloop()
#made by Metrix31
