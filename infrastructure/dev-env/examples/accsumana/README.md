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
| `l10n_th_tier_department` | Tier validation ตามแผนก |

## Custom Module: `accsumana`

Meta-module ที่ติดตั้ง Thai Accounting ทุกตัวในคลิกเดียว อยู่ใน repo [monthop-gmail/odoo-addons](https://github.com/monthop-gmail/odoo-addons) (clone อัตโนมัติตอน build)

```bash
# ติดตั้ง accsumana (จะลง dependency ทั้งหมดให้อัตโนมัติ)
docker compose exec odoo odoo -d odoo \
  --db_host=db --db_port=5432 --db_user=odoo --db_password=odoo \
  -i accsumana --stop-after-init
```

## OCA Dependency Repos (pre-cloned)

```
/mnt/extra-addons/
├── odoo-addons/        ← monthop-gmail/odoo-addons (accsumana meta-module)
├── l10n-thailand/      ← OCA/l10n-thailand (v18) / monthop-gmail fork (v19)
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
├── Dockerfile.18           # Odoo 18 image + OCA modules
├── Dockerfile.19           # Odoo 19 image + OCA modules (fork)
├── odoo.conf               # addons_path + proxy_mode config
├── .env.example            # template
└── .gitignore
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

# 2. ใส่ CF_TUNNEL_TOKEN ใน .env

# 3. Build + รัน
docker compose up -d --build

# 4. ติดตั้ง Thai modules ผ่าน accsumana meta-module
docker compose exec odoo odoo -d odoo \
  --db_host=db --db_port=5432 --db_user=odoo --db_password=odoo \
  -i accsumana --stop-after-init

# 5. (Optional) ติดตั้ง Passkey (Odoo 19+)
docker compose exec odoo odoo -d odoo \
  --db_host=db --db_port=5432 --db_user=odoo --db_password=odoo \
  -i auth_passkey,auth_passkey_portal \
  --stop-after-init
```

## CF Dashboard Setup

1. **Zero Trust → Networks → Tunnels** → Create Tunnel
2. ตั้งชื่อ เช่น `accsumana-dev` → Copy Token
3. Add Public Hostname:
   - Subdomain: `odoo` / Domain: `example.com`
   - Service: `http://odoo:8069`
4. ใส่ Token ใน `.env` → `CF_TUNNEL_TOKEN=eyJhIjoixxxxx`

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
