# 1. Local Dev Architecture

> 1 Container = 1 งาน = 1 Repo = 1 DNS

## หลักการ

แต่ละ service จะมี repo ของตัวเอง รันเป็น container เดียว และมี DNS เฉพาะตัวผ่าน Cloudflare Tunnel

## โครงสร้าง Repo ต่อ Service

```
project-a/
├── docker-compose.yml      # รันได้ทั้ง local + prd
├── Dockerfile
├── .env.example            # template (commit ได้)
├── .env                    # ค่าจริง (gitignore)
└── src/
```

## DNS ผ่าน Cloudflare Tunnel

ใช้ CF Tunnel ตัวเดียวรัน daemon บน host แล้ว route แต่ละ service ตาม hostname

```yaml
# docker-compose.yml
services:
  app:
    build: .
    labels:
      - "tunnel.hostname=project-a.dev.example.com"
```

### CF Tunnel Config

```yaml
# tunnel/config.yml
tunnel: <TUNNEL_ID>
credentials-file: /etc/cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: project-a.dev.example.com
    service: http://localhost:3000
  - hostname: project-b.dev.example.com
    service: http://localhost:3001
  - service: http_status:404
```

### เริ่มต้นใช้งาน

```bash
# ติดตั้ง cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
  -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# login + สร้าง tunnel
cloudflared tunnel login
cloudflared tunnel create dev-tunnel

# รัน tunnel
cloudflared tunnel --config tunnel/config.yml run
```

## ข้อดี

- **แยกชัดเจน** — แต่ละ service มี lifecycle ของตัวเอง
- **ง่ายต่อการ debug** — ดู log เฉพาะ container ที่สนใจ
- **เหมือน production** — รันบน Docker เหมือนกันทั้ง local และ prd
- **เข้าถึงง่าย** — ทุก service มี URL จริงผ่าน CF Tunnel
