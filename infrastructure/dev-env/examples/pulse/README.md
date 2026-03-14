# PULSE Ecosystem

ชีพจรขององค์กร — รวม Odoo ERP + WordPress + IoT Gateway + n8n ทำงานร่วมกัน

> ดู [examples/pulse-modular](../pulse-modular/) สำหรับเวอร์ชัน modular (Docker Compose include)

## Architecture

```
                    ┌─────────────────────────────────────────┐
                    │            Cloudflare DNS                │
                    │                                         │
                    │  erp.dev.example.com      ──► Odoo      │
                    │  www.dev.example.com      ──► WordPress  │
                    │  nodered.dev.example.com  ──► Node-RED   │
                    │  mqtt.dev.example.com     ──► EMQX       │
                    │  n8n.dev.example.com      ──► n8n        │
                    └─────────────────────────────────────────┘

    ┌──────────┐       ┌───────────┐       ┌──────────────────┐
    │  Odoo    │◄─────►│   n8n     │◄─────►│    WordPress     │
    │  ERP     │       │ Workflow  │       │    Website       │
    │          │       │ Automation│       │                  │
    │ odoo-db  │       │  n8n-db   │       │     wp-db        │
    │ (pg)     │       │  (pg)     │       │   (mariadb)      │
    └────▲─────┘       └─────▲─────┘       └──────────────────┘
         │                   │
         │              ┌────┴─────┐
         │              │  Redis   │  ← shared cache
         │              └──────────┘
         │
    ┌────┴──────────────────────────┐
    │       IoT Gateway             │
    │                               │
    │  EMQX (MQTT Broker)          │
    │       ▲                       │
    │       │ subscribe/publish     │
    │  Node-RED (Flow Engine)      │
    │       ▲                       │
    │       │ MQTT                  │
    │  อุปกรณ์ IoT / Sensor / PLC   │
    └───────────────────────────────┘
```

## Data Flow ตัวอย่าง

### 1. IoT → Odoo (บันทึกข้อมูล sensor ลง ERP)

```
Sensor → MQTT → EMQX → Node-RED → Odoo XML-RPC API
                          │
                          └─ แปลงข้อมูล + validate
                             ก่อนส่งเข้า Odoo
```

### 2. Odoo → WordPress (sync สินค้า ERP ไปหน้าเว็บ)

```
Odoo (สร้างสินค้าใหม่)
  → n8n webhook trigger
  → n8n แปลงข้อมูล
  → WordPress REST API (สร้าง WooCommerce product)
```

### 3. WordPress → Odoo (คำสั่งซื้อจากเว็บเข้า ERP)

```
WordPress (WooCommerce order)
  → n8n webhook trigger
  → n8n แปลงข้อมูล
  → Odoo XML-RPC (สร้าง Sale Order)
```

### 4. IoT Alert → แจ้งเตือน

```
Sensor (ค่าเกิน threshold)
  → EMQX → Node-RED (ตรวจจับ)
  → n8n webhook
  → n8n ส่ง LINE Notify / Slack / Email
```

## Services

| Service | Port | หน้าที่ | Tunnel |
|---------|------|--------|--------|
| **Odoo** | 8069 | ERP หลัก — บัญชี, สต็อก, ขาย, HR | `erp.dev.example.com` |
| **WordPress** | 80 | เว็บไซต์องค์กร / WooCommerce | `www.dev.example.com` |
| **EMQX** | 1883 | MQTT Broker รับข้อมูลจาก IoT | `mqtt.dev.example.com` |
| **Node-RED** | 1880 | Flow engine แปลง IoT data → API calls | `nodered.dev.example.com` |
| **n8n** | 5678 | Workflow automation เชื่อมทุก service | `n8n.dev.example.com` |
| **Redis** | 6379 | Shared cache (WP object cache, n8n queue) | internal only |

## โครงสร้าง

```
pulse/
├── docker-compose.yml       # ทุก service + 5 tunnels
├── docker-compose.prd.yml   # resource limits
├── .env.example
├── .gitignore
└── wp-content/
    ├── plugins/
    └── themes/
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. สร้าง 5 Tunnels บน CF Dashboard → ใส่ token ใน .env

# 3. รัน
docker compose up -d

# 4. เข้าใช้งาน
#    Odoo:     https://erp.dev.example.com
#    Website:  https://www.dev.example.com
#    Node-RED: https://nodered.dev.example.com
#    n8n:      https://n8n.dev.example.com
```

## CF Dashboard Setup

สร้าง **5 Tunnels**:

| Tunnel | Public Hostname | Service | Type |
|--------|----------------|---------|------|
| `pulse-odoo-dev` | `erp.dev.example.com` | `http://odoo:8069` | HTTP |
| `pulse-wp-dev` | `www.dev.example.com` | `http://wordpress:80` | HTTP |
| `pulse-nodered-dev` | `nodered.dev.example.com` | `http://nodered:1880` | HTTP |
| `pulse-mqtt-dev` | `mqtt.dev.example.com` | `tcp://emqx:1883` | TCP |
| `pulse-n8n-dev` | `n8n.dev.example.com` | `http://n8n:5678` | HTTP |

## Backup ทั้ง Ecosystem

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/${DATE}"
mkdir -p "${BACKUP_DIR}"

# Odoo DB
docker compose exec -T odoo-db pg_dumpall -U odoo > "${BACKUP_DIR}/odoo.sql"

# WordPress DB
docker compose exec -T wp-db mariadb-dump -u root -p${WP_DB_ROOT_PASS} wordpress > "${BACKUP_DIR}/wordpress.sql"

# n8n DB
docker compose exec -T n8n-db pg_dump -U n8n n8n > "${BACKUP_DIR}/n8n.sql"

# Node-RED flows
docker compose cp nodered:/data/flows.json "${BACKUP_DIR}/nodered-flows.json"

echo "Backup complete: ${BACKUP_DIR}"
```

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```

## เมื่อไหร่ควรแยก Repo?

```
ใช้ pulse repo เดียวตอน:         ใช้แยก repo ตอน:
├── PoC / prototype              ├── production
├── ทีมเล็ก 1-3 คน              ├── หลายทีม
├── deploy พร้อมกันทั้ง stack     ├── deploy แยกอิสระ
└── dev environment              └── service มี custom code เยอะ
```
