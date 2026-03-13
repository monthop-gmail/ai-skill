# PULSE Ecosystem (Modular)

ชีพจรขององค์กร — รวม Odoo ERP + WordPress + IoT Gateway + n8n ทำงานร่วมกัน

**เวอร์ชัน Modular** — แยก compose file ต่อ service ใช้ Docker Compose `include` (v2.20+)

> ดู [examples/pulse](../pulse/) สำหรับเวอร์ชัน single-file

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
pulse-modular/
├── docker-compose.yml                    # root: include ทุก service
├── docker-compose.prd.yml               # resource limits
├── .env.example
├── .gitignore
├── wp-content/
│   ├── plugins/
│   └── themes/
└── services/
    ├── odoo/
    │   └── compose.yaml                 # Odoo + PostgreSQL
    ├── wordpress/
    │   └── compose.yaml                 # WordPress + MariaDB
    ├── iot/
    │   └── compose.yaml                 # EMQX + Node-RED
    ├── n8n/
    │   └── compose.yaml                 # n8n + PostgreSQL
    ├── redis/
    │   └── compose.yaml                 # Redis cache
    └── tunnels/
        └── compose.yaml                 # 5 Cloudflare tunnels
```

## ข้อดีของ Modular

| Feature | Single-file (pulse) | Modular (pulse-modular) |
|---------|-------------------|----------------------|
| ดูง่าย เข้าใจเร็ว | ✅ | — |
| แก้ service แยกไม่กระทบตัวอื่น | — | ✅ |
| Docker Compose version | ไม่จำกัด | v2.20+ |
| จำนวน service เยอะ ๆ | ไฟล์ยาว | ✅ แยกดูแลง่าย |
| ทีมหลายคนแก้พร้อมกัน | conflict เยอะ | ✅ แก้คนละไฟล์ |
| รันแค่บาง service | ✅ ได้อยู่แล้ว | ✅ ชัดเจนกว่า |

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. สร้าง 5 Tunnels บน CF Dashboard → ใส่ token ใน .env

# 3. รัน ทั้งหมด
docker compose up -d

# 4. หรือรันแค่บาง service
docker compose up -d odoo odoo-db redis

# 5. เข้าใช้งาน
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

## Backup

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/${DATE}"
mkdir -p "${BACKUP_DIR}"

docker compose exec -T odoo-db pg_dumpall -U odoo > "${BACKUP_DIR}/odoo.sql"
docker compose exec -T wp-db mariadb-dump -u root -p${WP_DB_ROOT_PASS} wordpress > "${BACKUP_DIR}/wordpress.sql"
docker compose exec -T n8n-db pg_dump -U n8n n8n > "${BACKUP_DIR}/n8n.sql"
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
