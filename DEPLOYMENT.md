# Deployment Guide — Rotax 914 MALE UAV Digital Twin

This project provides a full-stack digital twin system combining:
- **FastAPI Backend & Physics Simulation Engine**: High-fidelity Rotax 914 thermodynamic model with real-time WebSockets, REST fault injection, and 3-layer AI/ML fault diagnosis.
- **React + Three.js 3D UAV Mission Dashboard**: Interactive 3D engine CAD visualization, live telemetry graphs, health decay analytics, and mission replay controls.

---

## 🚀 Quick Start Options

### Option 1: Docker (Recommended for Single-Container Deployment)

The included multi-stage `Dockerfile` automatically builds the React frontend and serves both the frontend and backend from a single container on port `8000`.

```bash
# Build and run with Docker Compose
docker compose up --build -d

# Or build and run directly with Docker
docker build -t rotax914-digital-twin .
docker run -p 8000:8000 -e PORT=8000 rotax914-digital-twin
```

Access the application at:
- **Interactive 3D Dashboard**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### Option 2: Cloud Deployment (Render, Railway, Fly.io)

#### Deploying on Render:
1. Connect your repository to [Render](https://render.com).
2. Choose **Web Service** and select **Docker** runtime (Render will automatically pick up `render.yaml` or `Dockerfile`).
3. Set the health check path to `/health`.
4. Deploy!

#### Deploying on Railway:
1. Create a new project on [Railway](https://railway.app) from your GitHub repo.
2. Railway will automatically detect the `Dockerfile` and deploy the service.

---

### Option 3: Local Development (Separate Frontend & Backend)

#### 1. Start the Simulation Backend:
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start backend server (runs on http://localhost:8000)
python simulation/server.py
```

#### 2. Start the Frontend Dev Server:
```bash
cd dashboard
npm install
npm run dev
```

The Vite dev server will run on [http://localhost:5173](http://localhost:5173) and automatically proxy live telemetry via WebSocket to the backend on port `8000`.

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP & WebSocket server port | `8000` |
| `HOST` | Server host binding | `0.0.0.0` |
| `VITE_API_BASE` | Custom backend REST URL (for separate frontend hosting) | Auto-inferred / `http://localhost:8000` |
| `VITE_WS_URL` | Custom WebSocket URL (for separate frontend hosting) | Auto-inferred / `ws://localhost:8000/ws/engine` |
| `DASHBOARD_DIST_DIR` | Path to built React assets | `dashboard/dist` |
