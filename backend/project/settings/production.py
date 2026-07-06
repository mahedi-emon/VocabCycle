"""
VocabCycle – Production Settings
Neon Postgres, HTTPS enforcement, strict security.
"""

import dj_database_url
from .base import *  # noqa: F401, F403

DEBUG = False

ALLOWED_HOSTS = os.getenv(  # noqa: F405
    "ALLOWED_HOSTS", "vocabcycle.rawsyst.com,api.vocabcycle.rawsyst.com"
).split(",")

# Neon Postgres via DATABASE_URL
DATABASES = {
    "default": dj_database_url.config(
        default=os.getenv("DATABASE_URL"),  # noqa: F405
        conn_max_age=600,
        conn_health_checks=True,
        ssl_require=True,
    )
}

# Security hardening
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# CORS – production origins only
CORS_ALLOWED_ORIGINS = os.getenv(  # noqa: F405
    "CORS_ALLOWED_ORIGINS", "https://vocabcycle.rawsyst.com"
).split(",")
