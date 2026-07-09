from django.contrib.auth.hashers import PBKDF2PasswordHasher

class LightPBKDF2PasswordHasher(PBKDF2PasswordHasher):
    """
    A lighter PBKDF2 password hasher with 30,000 iterations.
    Optimized for throttled resource-constrained environments (like 0.1 vCPU containers).
    Speeds up login and signup operations by 10-20x without overloading Gunicorn workers.
    """
    iterations = 30000
