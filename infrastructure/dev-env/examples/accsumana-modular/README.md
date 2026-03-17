# Accsumana Modular Example

Odoo ERP + **OCA Thai Accounting** แบบ modular — แยก compose ต่อ service ใช้ Docker Compose `include`

## OCA Thai Modules (pre-installed)

| Module | หน้าที่ |
|--------|--------|
| `l10n_th_account_tax` | VAT + ภาษีหัก ณ ที่จ่าย (WHT) |
| `l10n_th_account_tax_report` | รายงานภาษี (PND1, PND3, PND53, VAT report) + e-filing |
| `l10n_th_account_wht_cert_form` | พิมพ์ใบ 50 ทวิ |
| `l10n_th_amount_to_text` | แปลงจำนวนเงินเป็นภาษาไทย (บาท/สตางค์) |
| `l10n_th_base_sequence` | เลขที่เอกสารแบบไทย (ปี พ.ศ., สาขา, ไตรมาส) |
| `l10n_th_base_utils` | ฟอนต์ไทย + utility แปลงเดือน/ปี |
| `l10n_th_partner` | ข้อมูลคู่ค้าแบบไทย (บจก., มหาชน, สาขา/สนญ.) |
| `l10n_th_mis_report` | งบการเงิน (งบดุล, กำไรขาดทุน, งบทดลอง) |
| `l10n_th_tier_department` | Tier validation ตามแผนก |

## Custom Module: `accsumana`

Meta-module ที่ติดตั้ง Thai Accounting ทุกตัวในคลิกเดียว อยู่ใน repo [monthop-gmail/odoo-addons](https://github.com/monthop-gmail/odoo-addons) (clone อัตโนมัติตอน build)

```bash
# ติดตั้ง accsumana (จะลง dependency ทั้งหมดให้อัตโนมัติ)
docker compose exec odoo odoo -d odoo \
  --db_host=db --db_port=5432 --db_user=odoo --db_password=odoo \
  -i accsumana --stop-after-init
```

## โครงสร้าง

```
accsumana-modular/
├── docker-compose.yml              # root: include ทุก service
├── docker-compose.prd.yml          # production override
├── Dockerfile.18                   # Odoo 18 image + OCA modules
├── Dockerfile.19                   # Odoo 19 image + OCA modules (fork)
├── odoo.conf                       # addons_path + proxy_mode config
├── .env.example                    # template
├── .gitignore
└── services/
    ├── postgres/compose.yaml       # PostgreSQL
    ├── odoo/compose.yaml           # Odoo ERP + Thai Acc
    ├── adminer/compose.yaml        # DB management UI
    └── tunnels/compose.yaml        # CF Tunnels (odoo + adminer)
```

### Odoo 18 vs 19

| | Dockerfile.18 | Dockerfile.19 |
|---|---|---|
| OCA repos | OCA official | monthop-gmail fork (pending PRs) |
| odoo-addons | ไม่มี | clone จาก monthop-gmail/odoo-addons |

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF_TUNNEL_TOKEN_ODOO + CF_TUNNEL_TOKEN_ADMINER ใน .env

# 3. Build + รัน
docker compose up -d --build

# 4. ติดตั้ง Thai modules ผ่าน accsumana meta-module
docker compose exec odoo odoo -d odoo \
  --db_host=db --db_port=5432 --db_user=odoo --db_password=odoo \
  -i accsumana --stop-after-init

# 5. (Optional) ติดตั้ง Passkey
docker compose exec odoo odoo -d odoo \
  --db_host=db --db_port=5432 --db_user=odoo --db_password=odoo \
  -i auth_passkey,auth_passkey_portal \
  --stop-after-init
```

## เปลี่ยน Odoo Version

แก้ `.env` ทั้ง 2 ค่า แล้ว rebuild:

```bash
# แก้ .env
ODOO_MAJOR_VERSION=18   # เลือก Dockerfile.18 หรือ Dockerfile.19
ODOO_VERSION=18.0

# ลบ volume เก่า (DB schema ไม่ compatible ข้าม major version)
docker compose down -v

# Build ใหม่
docker compose up -d --build
```

> **สำคัญ:** Dockerfile ต้องมี `ARG ODOO_VERSION` ก่อน `FROM` เพื่อให้ build arg ส่งเข้า base image ได้

## CF Tunnel Setup

### วิธีที่ 1: สร้างผ่าน CF Dashboard

สร้าง 2 Tunnels แล้วใส่ token ใน `.env`:

| Tunnel | Public Hostname | Service |
|--------|----------------|---------|
| accsumana-odoo | `odoo.example.com` | `http://odoo:8069` |
| accsumana-adminer | `dbadmin.example.com` | `http://adminer:8080` |

### วิธีที่ 2: สร้างผ่าน CF API

```bash
# สร้าง tunnel
curl -X POST "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/cfd_tunnel" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"accsumana-odoo","tunnel_secret":"'$(openssl rand -base64 32)'","config_src":"cloudflare"}'

# ตั้ง ingress (ใส่ TUNNEL_ID จาก response)
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/cfd_tunnel/${TUNNEL_ID}/configurations" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"config":{"ingress":[{"hostname":"odoo.example.com","service":"http://odoo:8069"},{"service":"http_status:404"}]}}'

# สร้าง DNS CNAME
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"odoo","content":"${TUNNEL_ID}.cfargotunnel.com","proxied":true}'
```

นำ `token` จาก response มาใส่ `CF_TUNNEL_TOKEN_ODOO` ใน `.env`

## Passkey + HTTPS (CF Tunnel)

เมื่อใช้ CF Tunnel (HTTPS) กับ Passkey ต้องตั้งค่าเพิ่ม ไม่งั้นจะเจอ error:

```
InvalidRegistrationResponse: Unexpected client data origin "https://...", expected "http://..."
```

### แก้ไข:

1. `odoo.conf` ต้องมี `proxy_mode = True` (เพื่อให้ Odoo อ่าน X-Forwarded-Proto)

2. ตั้ง `web.base.url` และ freeze ผ่าน DB โดยตรง:

```bash
docker compose exec db psql -U odoo -d odoo -c "
  UPDATE ir_config_parameter SET value = 'https://odoo.example.com' WHERE key = 'web.base.url';
  INSERT INTO ir_config_parameter (key, value, create_uid, write_uid, create_date, write_date)
    VALUES ('web.base.url.freeze', 'True', 1, 1, now(), now())
    ON CONFLICT (key) DO UPDATE SET value = 'True';
"
docker compose restart odoo
```

> **หมายเหตุ:** ต้องตั้งผ่าน DB เพราะ Odoo จะ auto-reset `web.base.url` เป็น `http://` ทุกครั้งที่ admin login
> `web.base.url.freeze = True` ป้องกันการ auto-reset

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d --build
```

## Backup Database

```bash
# dump
docker compose exec db pg_dumpall -U odoo > backup.sql

# restore
docker compose exec -T db psql -U odoo < backup.sql
```
