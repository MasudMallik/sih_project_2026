
from bcrypt import checkpw, hashpw, gensalt

def create_hash(password: str) -> bytes:
    return hashpw(password.encode("utf-8"), gensalt(12))

def check_hash(password: str, hash_password) -> bool:
    if isinstance(hash_password, str):
        hash_password = hash_password.encode("utf-8")
    try:
        return checkpw(password.encode("utf-8"), hash_password)
    except Exception:
        return False