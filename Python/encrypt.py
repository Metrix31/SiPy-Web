from cryptography.fernet import Fernet
from pathlib import Path

def generate_key(key_file="sipy.key"):
    key_path = Path(key_file)
    if not key_path.exists():
        key = Fernet.generate_key()
        key_path.write_bytes(key)
        print(f"Key gespeichert in {key_file}")
    else:
        key = key_path.read_bytes()
        print(f"Key aus {key_file} geladen")
    return key

def encrypt_sipy(input_path, output_path=None, key_file="sipy.key"):
    key = generate_key(key_file)
    f = Fernet(key)

    input_path = Path(input_path)
    if output_path is None:
        output_path = input_path.with_suffix(input_path.suffix + ".enc")

    data = input_path.read_bytes()
    encrypted = f.encrypt(data)
    Path(output_path).write_bytes(encrypted)
    print(f"Verschlüsselt: {input_path} -> {output_path}")

if __name__ == "__main__":
    encrypt_sipy("programm.sipy")
#made by Metrix31
