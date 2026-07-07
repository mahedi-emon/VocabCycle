# ──────────────────────────────────────────────
# VocabCycle Backend – Dockerfile (Optimized Alpine)
# Python 3.12 alpine, Multi-stage compilation
# ──────────────────────────────────────────────

# Stage 1: Build dependencies on Alpine
FROM python:3.12-alpine AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install Alpine build dependencies for compiling psycopg2 and Pillow
RUN apk add --no-cache gcc musl-dev postgresql-dev jpeg-dev zlib-dev libpng-dev libffi-dev

COPY requirements.txt .

# Build wheel binaries
RUN pip install --no-cache-dir --upgrade pip && \
    pip wheel --no-cache-dir --wheel-dir /app/wheels -r requirements.txt


# Stage 2: Final runner image on Alpine
FROM python:3.12-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=project.settings.production

WORKDIR /app

# Install runtime libraries required by psycopg2 and Pillow (no build tools)
RUN apk add --no-cache libpq jpeg zlib libpng libffi

# Copy wheels from builder and install them
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt && \
    rm -rf /wheels requirements.txt

# Copy project files (excluded files are handled by .dockerignore)
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Run migrations, collectstatic, and start with Gunicorn
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn project.wsgi:application --config gunicorn.conf.py"]
