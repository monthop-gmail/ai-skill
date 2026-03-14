# n8n Example

ตัวอย่าง n8n Workflow Automation + PostgreSQL + CF Tunnel sidecar

## Architecture

```
Internet → CF Tunnel → n8n (:5678) → PostgreSQL
                          │
                          ▼
                     Webhooks รับ event จากภายนอก
                     (GitHub, Slack, API ต่างๆ)
```

## โครงสร้าง

```
n8n/
├── docker-compose.yml      # n8n + db + tunnel
├── docker-compose.prd.yml  # override: + redis queue mode
├── .env.example
└── .gitignore
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF_TUNNEL_TOKEN + แก้ N8N_ENCRYPTION_KEY ใน .env

# 3. รัน
docker compose up -d

# 4. เข้าใช้งาน
#    http://localhost:5678
#    https://n8n.dev.example.com
```

## CF Dashboard Setup

1. **Zero Trust → Networks → Tunnels** → Create Tunnel
2. ตั้งชื่อ เช่น `n8n-dev` → Copy Token
3. Add Public Hostname:
   - Subdomain: `n8n` / Domain: `dev.example.com`
   - Service: `http://n8n:5678`
4. ใส่ Token ใน `.env` → `CF_TUNNEL_TOKEN=eyJhIjoixxxxx`

## Webhook URL

n8n ต้องรู้ URL ของตัวเองเพื่อสร้าง webhook ที่ถูกต้อง:

```bash
# .env
WEBHOOK_URL=https://n8n.dev.example.com/
```

เมื่อสร้าง workflow ที่ใช้ Webhook trigger → n8n จะให้ URL เป็น
`https://n8n.dev.example.com/webhook/xxxx` ซึ่งเข้าถึงได้จากภายนอกผ่าน CF Tunnel

## Production — Queue Mode

PRD override เพิ่ม Redis + เปิด queue mode เพื่อรองรับ workflow จำนวนมาก:

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```

```
n8n (main) → Redis queue → n8n (worker) → PostgreSQL
```

## Backup

```bash
# dump workflows + credentials
docker compose exec db pg_dump -U n8n n8n > backup.sql

# restore
docker compose exec -T db psql -U n8n n8n < backup.sql
```
