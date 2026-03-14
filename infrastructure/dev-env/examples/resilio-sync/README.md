# Resilio Sync Example

ตัวอย่าง Resilio Sync (P2P file sync) + CF Tunnel sidecar

## Architecture

```
                    CF Tunnel
                        │
                        ▼
Internet ──────► Resilio Web UI (:8888)
                        │
                  P2P sync (:55555)
                   ╱    │    ╲
            Server A  Server B  Laptop
              /data     /data     /data
                  (sync กันอัตโนมัติ)
```

- **Web UI** — จัดการ folder, ดูสถานะ sync ผ่าน CF Tunnel
- **P2P Data** — sync ข้อมูลตรงระหว่างเครื่อง (port 55555)

## โครงสร้าง

```
resilio-sync/
├── docker-compose.yml      # resilio + tunnel
├── docker-compose.prd.yml  # override สำหรับ prd
├── .env.example
├── .gitignore
└── data/                   # โฟลเดอร์ที่ sync
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. สร้างโฟลเดอร์ data
mkdir -p data

# 3. ใส่ CF_TUNNEL_TOKEN ใน .env

# 4. รัน
docker compose up -d

# 5. เข้า Web UI
#    http://localhost:8888
#    https://sync.dev.example.com
```

## CF Dashboard Setup

1. **Zero Trust → Networks → Tunnels** → Create Tunnel
2. ตั้งชื่อ เช่น `resilio-dev` → Copy Token
3. Add Public Hostname:
   - Subdomain: `sync` / Domain: `dev.example.com`
   - Service: `http://resilio:8888`
4. ใส่ Token ใน `.env` → `CF_TUNNEL_TOKEN=eyJhIjoixxxxx`

## ตั้งค่า Sync

### เครื่องแรก (สร้าง folder share)

1. เข้า Web UI → Add Folder → เลือก `/mnt/mounted_folders/data`
2. ตั้งค่า permissions (Read & Write / Read Only)
3. Copy **Key** หรือ **Link**

### เครื่องอื่น (เข้าร่วม sync)

1. เข้า Web UI → Add Folder → Enter Key/Link
2. เลือก path ที่จะ sync
3. เริ่ม sync อัตโนมัติ

## Use Cases

| Use Case | รายละเอียด |
|----------|-----------|
| **Sync code/config ระหว่าง server** | dev → test → prd sync config files |
| **Backup ข้ามเครื่อง** | sync data ไป backup server อัตโนมัติ |
| **แชร์ไฟล์ในทีม** | shared folder สำหรับทีม dev |
| **Sync Docker volumes** | sync volume data ระหว่าง host |
| **IoT data collection** | รวบรวมข้อมูลจาก edge devices |

## Sync หลาย Folder

mount เพิ่มใน `docker-compose.yml`:

```yaml
services:
  resilio:
    volumes:
      - resilio_config:/mnt/sync
      - ./data:/mnt/mounted_folders/data
      - ./backups:/mnt/mounted_folders/backups
      - /opt/services:/mnt/mounted_folders/services:ro  # read-only
```

## ร่วมกับ service อื่น

```
MinIO (upload) → data/ → Resilio Sync → เครื่องอื่นได้ไฟล์อัตโนมัติ

Server A                    Server B
/opt/services/              /opt/services/
├── api/.env.enc    ◄────►  ├── api/.env.enc
├── web/.env.enc    (sync)  ├── web/.env.enc
└── configs/                └── configs/
```

## Network & Firewall

P2P sync ใช้ port `55555` — ถ้าอยู่หลัง firewall:

- **เปิด port 55555** (TCP+UDP) ทั้ง 2 ฝั่ง → sync ตรงเร็วสุด
- **ไม่เปิด port** → Resilio จะ relay ผ่าน cloud (ช้ากว่า แต่ยังทำงานได้)

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```
