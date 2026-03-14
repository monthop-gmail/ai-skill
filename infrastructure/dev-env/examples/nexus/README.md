# NEXUS Ecosystem

ระบบ Ecosystem รวมศูนย์ — Odoo ERP + ThingsBoard IoT + Keycloak SSO + MinIO Storage + NAS + Cloudflare Tunnel

## Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │              Cloudflare DNS                   │
                    │                                              │
                    │  auth.dev.example.com         ──► Keycloak   │
                    │  erp.dev.example.com          ──► Odoo       │
                    │  iot.dev.example.com          ──► ThingsBoard│
                    │  mqtt.dev.example.com         ──► MQTT       │
                    │  s3.dev.example.com           ──► MinIO API  │
                    │  s3-console.dev.example.com   ──► MinIO UI   │
                    └──────────────────────────────────────────────┘

    ┌──────────┐       ┌───────────┐       ┌──────────────────┐
    │ Keycloak │◄─────►│   Odoo    │       │   ThingsBoard    │
    │   SSO    │  OIDC │   ERP     │       │      IoT         │
    │          │       │           │       │                  │
    └────┬─────┘       └───────────┘       │  MQTT :1883      │
         │ OIDC                            │  CoAP :5683      │
    ┌────┴─────┐                           └────────┬─────────┘
    │  MinIO   │                                    │
    │ S3 Store │                                    │
    └──────────┘                               IoT Devices
                                               Sensor / PLC
         ┌─────────────────────────────┐
         │   PostgreSQL (shared)       │
         │                             │
         │  DB: odoo                   │
         │  DB: keycloak               │
         │  DB: thingsboard            │
         └─────────────────────────────┘

    ┌──────────┐
    │  Samba   │  ← LAN only (port 445)
    │   NAS    │
    └──────────┘
```

## Services

| Service | Port | หน้าที่ | Tunnel |
|---------|------|--------|--------|
| **Keycloak** | 8080 | SSO/OIDC กลาง ให้ทุก service | `auth.dev.example.com` |
| **Odoo** | 8069 | ERP — บัญชี, สต็อก, ขาย, HR | `erp.dev.example.com` |
| **ThingsBoard** | 9090 | IoT Platform — dashboard, rule engine | `iot.dev.example.com` |
| **ThingsBoard** | 1883 | MQTT Broker รับข้อมูลจาก IoT | `mqtt.dev.example.com` |
| **MinIO** | 9000/9001 | S3-compatible object storage | `s3.dev.example.com` |
| **Samba** | 445 | NAS file sharing | LAN only |
| **PostgreSQL** | 5432 | Shared database (3 DBs) | internal only |

## Data Flow ตัวอย่าง

### 1. IoT → ThingsBoard → Odoo (บันทึก sensor data ลง ERP)

```
Sensor → MQTT :1883 → ThingsBoard Rule Engine
                          │
                          └─ REST API call → Odoo XML-RPC
                             (สร้าง record ใน Odoo)
```

### 2. IoT Alert → แจ้งเตือน

```
Sensor (ค่าเกิน threshold)
  → ThingsBoard Rule Engine
  → Alarm → LINE Notify / Email / Telegram
```

### 3. SSO Login (ทุก service ผ่าน Keycloak)

```
User → Odoo/ThingsBoard/MinIO
  → Redirect to Keycloak
  → Login once → JWT token
  → Access all services
```

### 4. File Storage (MinIO เป็น S3 กลาง)

```
Odoo (เก็บ attachment) ──► MinIO bucket: odoo-files
ThingsBoard (OTA firmware) ──► MinIO bucket: tb-firmware
Backup scripts ──► MinIO bucket: backups
```

## โครงสร้าง

```
nexus/
├── docker-compose.yml       # ทุก service + 6 tunnels
├── docker-compose.prd.yml   # resource limits
├── .env.example
├── .gitignore
├── init-db.sh               # สร้าง 3 databases ใน PostgreSQL
├── odoo.conf                # Odoo config (low RAM mode)
└── realm-export.json        # Keycloak realm: nexus
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. สร้าง 6 Tunnels บน CF Dashboard → ใส่ token ใน .env

# 3. รัน
docker compose up -d

# 4. เข้าใช้งาน
#    Keycloak:    https://auth.dev.example.com     (admin/admin)
#    Odoo:        https://erp.dev.example.com
#    ThingsBoard: https://iot.dev.example.com
#    MinIO:       https://s3-console.dev.example.com
```

## CF Dashboard Setup

สร้าง **6 Tunnels**:

| Tunnel | Public Hostname | Service | Type |
|--------|----------------|---------|------|
| `nexus-keycloak-dev` | `auth.dev.example.com` | `http://keycloak:8080` | HTTP |
| `nexus-odoo-dev` | `erp.dev.example.com` | `http://odoo:8069` | HTTP |
| `nexus-tb-dev` | `iot.dev.example.com` | `http://thingsboard:9090` | HTTP |
| `nexus-mqtt-dev` | `mqtt.dev.example.com` | `tcp://thingsboard:1883` | TCP |
| `nexus-minio-api-dev` | `s3.dev.example.com` | `http://minio:9000` | HTTP |
| `nexus-minio-console-dev` | `s3-console.dev.example.com` | `http://minio:9001` | HTTP |

## SSO Integration (Keycloak)

Keycloak realm `nexus` มี 3 OIDC clients พร้อมใช้:

| Service | Client ID | วิธีตั้งค่า |
|---------|-----------|-----------|
| **Odoo** | `odoo` | ติดตั้ง module `auth_oidc` (OCA) → Settings > OAuth Providers |
| **ThingsBoard** | `thingsboard` | System Admin > OAuth 2.0 clients |
| **MinIO** | `minio` | เพิ่ม env `MINIO_IDENTITY_OPENID_*` |

## Backup ทั้ง Ecosystem

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/${DATE}"
mkdir -p "${BACKUP_DIR}"

# All databases
docker compose exec -T postgres pg_dump -U odoo odoo > "${BACKUP_DIR}/odoo.sql"
docker compose exec -T postgres pg_dump -U keycloak keycloak > "${BACKUP_DIR}/keycloak.sql"
docker compose exec -T postgres pg_dump -U thingsboard thingsboard > "${BACKUP_DIR}/thingsboard.sql"

# MinIO data (via mc cli)
# mc mirror nexus-minio/backups "${BACKUP_DIR}/minio/"

echo "Backup complete: ${BACKUP_DIR}"
```

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```

## เมื่อไหร่ควรแยก Repo?

```
ใช้ nexus repo เดียวตอน:         ใช้แยก repo ตอน:
├── PoC / prototype              ├── production
├── ทีมเล็ก 1-3 คน              ├── หลายทีม
├── deploy พร้อมกันทั้ง stack     ├── deploy แยกอิสระ
└── dev environment              └── service มี custom code เยอะ
```
