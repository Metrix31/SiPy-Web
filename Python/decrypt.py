from cryptography.fernet import Fernet
from pathlib import Path

def load_key(key_file="sipy.key"):
    return Path(key_file).read_bytes()

def decrypt_sipy(input_path, output_path=None, key_file="sipy.key"):
    key = load_key(key_file)
    f = Fernet(key)

    input_path = Path(input_path)
    if output_path is None:
        # .sipy.enc -> .sipy
        if input_path.suffix == ".enc":
            output_path = input_path.with_suffix("")
        else:
            output_path = input_path.with_name(input_path.name + ".dec")

    data = input_path.read_bytes()
    decrypted = f.decrypt(data)
    Path(output_path).write_bytes(decrypted)
    print(f"Entschlüsselt: {input_path} -> {output_path}")

if __name__ == "__main__":
    decrypt_sipy("programm.sipy.enc")
#made by Metrix31
