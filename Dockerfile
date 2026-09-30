# Multi-stage Dockerfile for Rotax 914 MALE UAV Digital Twin
# Stage 1: Build the React + Vite 3D Dashboard
FROM node:20-slim AS frontend-builder
WORKDIR /app/dashboard

COPY dashboard/package*.json ./
RUN npm ci || npm install

COPY dashboard/ ./
RUN npm run build

# Stage 2: Python simulation backend and full-stack runtime
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend simulation code and datasets
COPY simulation/ ./simulation/
COPY PROJECT_CONTEXT.md ./

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/dashboard/dist ./dashboard/dist

# Expose port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Start server
CMD ["python", "simulation/server.py"]
