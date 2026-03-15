# Accsumana Example

Odoo ERP + **OCA Thai Accounting** + PostgreSQL + CF Tunnel sidecar

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

## OCA Dependency Repos (pre-cloned)

```
/mnt/extra-addons/
├── l10n-thailand/      ← OCA/l10n-thailand
├── reporting-engine/   ← OCA/reporting-engine (report_xlsx_helper)
├── partner-contact/    ← OCA/partner-contact (partner_company_type, partner_firstname)
├── server-ux/          ← OCA/server-ux (date_range, base_tier_validation)
└── mis-builder/        ← OCA/mis-builder (mis_builder)
```

## โครงสร้าง

```
accsumana/
├── docker-compose.yml      # odoo + db + tunnel
├── docker-compose.prd.yml  # production override
├── Dockerfile              # custom image + OCA modules
├── odoo.conf               # addons_path config
├── .env.example            # template
└── .gitignore
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF_TUNNEL_TOKEN ใน .env

# 3. Build + รัน
docker compose up -d --build

# 4. เข้าใช้งาน
#    http://localhost:8069
#    https://acc.dev.example.com

# 5. ติดตั้ง Thai modules
#    Settings → Apps → Update Apps List
#    ค้นหา "l10n_th" → Install
```

## CF Dashboard Setup

1. **Zero Trust → Networks → Tunnels** → Create Tunnel
2. ตั้งชื่อ เช่น `accsumana-dev` → Copy Token
3. Add Public Hostname:
   - Subdomain: `acc` / Domain: `dev.example.com`
   - Service: `http://odoo:8069`
4. ใส่ Token ใน `.env` → `CF_TUNNEL_TOKEN=eyJhIjoixxxxx`

## เปลี่ยน Odoo Version

```bash
# แก้ .env
ODOO_VERSION=17.0

# Rebuild
docker compose up -d --build
```

> OCA repos จะ clone branch ตาม ODOO_VERSION อัตโนมัติ

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
