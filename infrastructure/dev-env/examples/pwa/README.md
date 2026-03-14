# PWA Example

ตัวอย่าง Progressive Web App (Vite + Nginx) + CF Tunnel sidecar

## โครงสร้าง

```
pwa/
├── docker-compose.yml      # app (nginx) + tunnel
├── docker-compose.prd.yml  # override สำหรับ prd
├── Dockerfile              # multi-stage: build (node) → serve (nginx)
├── nginx.conf              # SPA routing + cache + gzip
├── .env.example            # template
├── .gitignore
└── src/
    ├── index.html
    ├── main.js
    ├── sw.js               # service worker
    └── manifest.json
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF_TUNNEL_TOKEN ใน .env

# 3. รัน
docker compose up -d

# 4. เข้าใช้งาน
#    http://localhost:80
#    https://app.dev.example.com
```

## CF Dashboard Setup

1. **Zero Trust → Networks → Tunnels** → Create Tunnel
2. ตั้งชื่อ เช่น `pwa-dev` → Copy Token
3. Add Public Hostname:
   - Subdomain: `app` / Domain: `dev.example.com`
   - Service: `http://app:80`
4. ใส่ Token ใน `.env` → `CF_TUNNEL_TOKEN=eyJhIjoixxxxx`

## PWA Features ที่ nginx.conf รองรับ

- **SPA Routing** — ทุก path fallback ไป `index.html`
- **Service Worker** — `sw.js` ไม่ cache เพื่อให้อัปเดตทันที
- **Static Assets** — cache 1 ปี + immutable header
- **Gzip** — compress JS/CSS/JSON/SVG/WASM
- **manifest.json** — cache 1 วัน สำหรับ PWA install prompt

## HTTPS สำหรับ PWA

PWA ต้องการ HTTPS เพื่อเปิดใช้ Service Worker — CF Tunnel ให้ HTTPS อัตโนมัติ
ไม่ต้องตั้งค่า SSL certificate เอง

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```
