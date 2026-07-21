# Deploy FinFlow (Live Demo Guide)

FinFlow is a multi-service stack (Postgres, Redis, Kafka, 7 Spring services + React). For interviews and portfolio demos, use one of these paths.

## Option A — Best for resume demos (local, one command)

```bash
cd infra/docker
docker compose up -d --build
```

| Surface | URL |
|---|---|
| **Web UI** | http://localhost:3001 |
| API Gateway | http://localhost:8080 |
| Grafana | http://localhost:3000 (monitoring compose) |
| Kafka UI | http://localhost:8090 |
| Zipkin | http://localhost:9411 |

If you need observability:

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

**Demo flow**

1. Open the web UI → Register user A → Create wallet (5,000 BRL)
2. Incognito → Register user B → Copy user id from Dashboard
3. As A → Payments → send 100 BRL → watch saga timeline to APPROVED
4. Send 50,001 BRL → fraud REJECTED → reserved funds release

Record a Loom of this flow and link it from your GitHub README.

## Option B — Frontend on Vercel + API on a VM / cloud

1. Deploy backend stack to a single VM (4+ GB RAM) with Docker Compose.
2. Point a domain / public IP at gateway port 8080 (TLS via Caddy/nginx).
3. Deploy `web/` to Vercel:

```bash
cd web
vercel
```

Set env:

```
VITE_API_BASE_URL=https://api.your-domain.com
```

Rebuild so Vite bakes the API URL into the bundle.

Enable CORS on the gateway (already allows `*` in this project for demo). Tighten origins before any real production use.

## Option C — Free-tier constraints (honest expectations)

Full Kafka + 7 JVMs will not fit comfortably on free PaaS tiers. Practical portfolio options:

- **Recorded demo + public GitHub** (highest ROI) — see [LOOM-SCRIPT.md](LOOM-SCRIPT.md)
- **Frontend-only on Vercel** — see [VERCEL.md](VERCEL.md)
- **Always-on VM** (Hetzner / Oracle free tier / small DigitalOcean droplet ~$6–12)

## Security checklist before public exposure

- [ ] Change `JWT_SECRET`
- [ ] Change Postgres password
- [ ] Restrict gateway CORS `allowedOrigins`
- [ ] Do not expose Postgres / Kafka / Redis ports publicly
- [ ] Prefer TLS termination in front of the gateway

## Resume one-liner

> Built and demoed FinFlow end-to-end: React dashboard + Spring microservices with Kafka saga, transactional outbox, wallet locking, and Docker Compose one-command bring-up.
