# FinFlow Web

React + Vite + TypeScript dashboard for the FinFlow distributed payment platform.

## Local development

Prerequisites: Node 20+, API gateway running on `http://localhost:8080`.

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173 — Vite proxies `/api/*` to the gateway.

## Production image

```bash
docker build -t finflow-web ./web
docker run -p 3000:80 finflow-web
```

Nginx serves the SPA and proxies `/api` to `api-gateway:8080` on the Docker network.
