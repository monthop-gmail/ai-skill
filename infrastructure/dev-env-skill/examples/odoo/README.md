# Odoo Example

ตัวอย่าง Odoo ERP + PostgreSQL + CF Tunnel sidecar

## โครงสร้าง

```
odoo/
├── docker-compose.yml      # odoo + db + tunnel
├── docker-compose.prd.yml  # override สำหรับ prd
├── .env.example            # template
├── .gitignore
└── custom-addons/          # (optional) Odoo modules เพิ่มเติม
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF_TUNNEL_TOKEN ใน .env

# 3. รัน
docker compose up -d

# 4. เข้าใช้งาน
#    http://localhost:8069
#    https://erp.dev.example.com
```

## CF Dashboard Setup

1. **Zero Trust → Networks → Tunnels** → Create Tunnel
2. ตั้งชื่อ เช่น `odoo-dev` → Copy Token
3. Add Public Hostname:
   - Subdomain: `erp` / Domain: `dev.example.com`
   - Service: `http://odoo:8069`
4. ใส่ Token ใน `.env` → `CF_TUNNEL_TOKEN=eyJhIjoixxxxx`

## Custom Addons

วาง Odoo module ใน `custom-addons/` แล้ว restart:

```bash
docker compose restart odoo
```

จากนั้นไปที่ Odoo → Settings → Apps → Update Apps List

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```

## Backup Database

```bash
# dump
docker compose exec db pg_dumpall -U odoo > backup.sql

# restore
docker compose exec -T db psql -U odoo < backup.sql
```
