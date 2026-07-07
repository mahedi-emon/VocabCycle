# ──────────────────────────────────────────────
# VocabCycle Backend – Dockerfile
# Python 3.12 slim, Django 5, Gunicorn
# ──────────────────────────────────────────────

FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=project.settings.production

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run migrations, collectstatic, and start with Gunicorn
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn project.wsgi:application --config gunicorn.conf.py"]

