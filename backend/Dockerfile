# ──────────────────────────────────────────────
# VocabCycle Backend – Dockerfile (Optimized Alpine)
# Python 3.12 alpine, Multi-stage compilation
# ──────────────────────────────────────────────

# Stage 1: Build dependencies on Alpine
FROM python:3.12-alpine AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install Alpine build dependencies for compiling psycopg2
RUN apk add --no-cache gcc musl-dev postgresql-dev libffi-dev

COPY requirements.txt .

# Install dependencies into a prefix folder
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# Prune python bytecode cache files to minimize package footprint safely
RUN find /install -depth \( \( -type d -a -name '__pycache__' \) -o \( -type f -a \( -name '*.pyc' -o -name '*.pyo' \) \) \) -exec rm -rf '{}' +


# Stage 2: Final runner image on Alpine
FROM python:3.12-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=project.settings.production

WORKDIR /app

# Install runtime libraries required by psycopg2 (no build tools)
RUN apk add --no-cache libpq libffi

# Copy compiled python dependencies directly from builder
COPY --from=builder /install /usr/local

# Copy project files (excluded files are handled by .dockerignore)
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Run migrations, collectstatic, and start with Gunicorn
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn project.wsgi:application --config gunicorn.conf.py"]
