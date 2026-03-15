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

## โครงสร้าง

```
accsumana-modular/
├── docker-compose.yml              # root: include ทุก service
├── docker-compose.prd.yml          # production override
├── Dockerfile                      # custom image + OCA modules
├── odoo.conf                       # addons_path config
├── .env.example                    # template
├── .gitignore
└── services/
    ├── postgres/compose.yaml       # PostgreSQL
    ├── odoo/compose.yaml           # Odoo ERP + Thai Acc
    ├── adminer/compose.yaml        # DB management UI
    └── tunnels/compose.yaml        # CF Tunnels (odoo + adminer)
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF_TUNNEL_TOKEN_ODOO + CF_TUNNEL_TOKEN_ADMINER ใน .env

# 3. Build + รัน
docker compose up -d --build

# 4. เข้าใช้งาน
#    https://acc.dev.example.com
#    https://dbadmin.dev.example.com

# 5. ติดตั้ง Thai modules
#    Settings → Apps → Update Apps List
#    ค้นหา "l10n_th" → Install
```

## CF Dashboard Setup

สร้าง 2 Tunnels:

| Tunnel | Public Hostname | Service |
|--------|----------------|---------|
| accsumana-odoo | `acc.dev.example.com` | `http://odoo:8069` |
| accsumana-adminer | `dbadmin.dev.example.com` | `http://adminer:8080` |

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
