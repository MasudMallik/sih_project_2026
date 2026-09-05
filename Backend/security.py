
from bcrypt import checkpw,hashpw,gensalt

def create_hash(password: str)->bytes:
    new_password=hashpw(password.encode("UTF-8"),gensalt(16))
    return new_password

def check_hash(password: str, hash_password :bytes)->bool:
    return checkpw(password.encode("UTF-8"),hash_password)