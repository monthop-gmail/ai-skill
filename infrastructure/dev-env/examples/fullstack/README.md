# Fullstack Example

ตัวอย่าง Fullstack: PWA Frontend + API Backend + PostgreSQL + Redis + CF Tunnel

## Architecture

```
                CF Tunnel (web)          CF Tunnel (api)
                     │                        │
                     ▼                        ▼
Internet ──► frontend (nginx:80)      api (node:4000)
                                          │       │
                                          ▼       ▼
                                     db (pg)   redis
```

- **frontend** — PWA (Vite + Nginx) serve static files
- **api** — Node.js REST API
- **db** — PostgreSQL
- **redis** — Cache + Session store
- **tunnel-web** — CF Tunnel สำหรับ frontend
- **tunnel-api** — CF Tunnel สำหรับ API

## โครงสร้าง

```
fullstack/
├── docker-compose.yml      # ทุก service + 2 tunnels
├── docker-compose.prd.yml  # override สำหรับ prd
├── .env.example
├── .gitignore
├── frontend/
│   ├── Dockerfile          # multi-stage: build → nginx
│   ├── nginx.conf
│   └── src/
└── api/
    ├── Dockerfile
    └── src/
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF_TUNNEL_TOKEN_WEB + CF_TUNNEL_TOKEN_API ใน .env

# 3. รัน
docker compose up -d

# 4. เข้าใช้งาน
#    Frontend: https://web.dev.example.com
#    API:      https://api.dev.example.com
```

## CF Dashboard Setup

สร้าง **2 Tunnels**:

| Tunnel | Public Hostname | Service |
|--------|----------------|---------|
| `fullstack-web-dev` | `web.dev.example.com` | `http://frontend:80` |
| `fullstack-api-dev` | `api.dev.example.com` | `http://api:4000` |

## ทำไมแยก 2 Tunnels?

- Frontend และ API มี **domain แยก** → CORS ชัดเจน
- Scale แยกอิสระ — เพิ่ม API replicas โดยไม่กระทบ frontend
- Security — API อาจจำกัด access ผ่าน CF Access policies แยก

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```
