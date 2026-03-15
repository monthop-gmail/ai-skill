# Homesumana Modular Example

ตัวอย่าง Odoo ERP (homesumana) แบบ modular — แยก compose ต่อ service ใช้ Docker Compose `include`

## โครงสร้าง

```
homesumana-modular/
├── docker-compose.yml              # root: include ทุก service
├── docker-compose.prd.yml          # production override
├── .env.example                    # template
├── .gitignore
└── services/
    ├── postgres/compose.yaml       # PostgreSQL
    ├── odoo/compose.yaml           # Odoo ERP
    ├── adminer/compose.yaml        # DB management UI
    └── tunnels/compose.yaml        # CF Tunnels (odoo + adminer)
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF_TUNNEL_TOKEN_ODOO + CF_TUNNEL_TOKEN_ADMINER ใน .env

# 3. รัน
docker compose up -d

# 4. เข้าใช้งาน
#    https://erp.dev.example.com
#    https://dbadmin.dev.example.com
```

## CF Dashboard Setup

สร้าง 2 Tunnels:

| Tunnel | Public Hostname | Service |
|--------|----------------|---------|
| homesumana-odoo | `erp.dev.example.com` | `http://odoo:8069` |
| homesumana-adminer | `dbadmin.dev.example.com` | `http://adminer:8080` |

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
