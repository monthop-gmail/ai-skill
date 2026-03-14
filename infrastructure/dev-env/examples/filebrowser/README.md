# FileBrowser Example

ตัวอย่าง FileBrowser (NAS เบาๆ) + CF Tunnel — Web File Manager น้ำหนักเบา

## Architecture

```
Internet → CF Tunnel → FileBrowser (:80) → /srv (mounted files)
```

## เทียบกับ Nextcloud

| | FileBrowser | Nextcloud |
|--|-------------|-----------|
| **น้ำหนัก** | เบามาก (~15MB RAM) | หนัก (~512MB+ RAM) |
| **Features** | จัดการไฟล์, แชร์ link, preview | ไฟล์ + Calendar + Contacts + Office + Talk |
| **Database** | SQLite (built-in) | PostgreSQL / MySQL |
| **Desktop sync** | ไม่มี | มี client ทุก platform |
| **เหมาะกับ** | file manager ง่ายๆ, browse files บน server | NAS เต็มรูปแบบ, ทดแทน Google Drive |

## โครงสร้าง

```
filebrowser/
├── docker-compose.yml      # filebrowser + tunnel
├── docker-compose.prd.yml  # override สำหรับ prd
├── filebrowser.json        # config
├── .env.example
├── .gitignore
└── data/                   # ไฟล์ที่เปิดให้เข้าถึง
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. สร้าง data folder
mkdir -p data

# 3. ใส่ CF_TUNNEL_TOKEN ใน .env

# 4. รัน
docker compose up -d

# 5. เข้าใช้งาน
#    https://files.dev.example.com
#    login: admin / admin (เปลี่ยนทันทีหลัง login ครั้งแรก!)
```

## CF Dashboard Setup

1. **Zero Trust → Networks → Tunnels** → Create Tunnel
2. ตั้งชื่อ เช่น `filebrowser-dev` → Copy Token
3. Add Public Hostname:
   - Subdomain: `files` / Domain: `dev.example.com`
   - Service: `http://filebrowser:80`
4. ใส่ Token ใน `.env`

## Mount หลาย Folder

แก้ `docker-compose.yml` เพื่อเปิดหลาย path:

```yaml
services:
  filebrowser:
    volumes:
      - /home/pi/projects:/srv/projects:ro     # read-only
      - /mnt/disk1/media:/srv/media
      - /opt/services:/srv/services:ro
      - /var/log:/srv/logs:ro
      - fb_db:/database
      - ./filebrowser.json:/.filebrowser.json:ro
```

เข้า Web UI จะเห็น:
```
/
├── projects/    (read-only)
├── media/
├── services/    (read-only)
└── logs/        (read-only)
```

## Use Cases

| Use Case | รายละเอียด |
|----------|-----------|
| **Browse server files** | ดูไฟล์บน server ผ่าน web ไม่ต้อง SSH |
| **Share files** | สร้าง share link ส่งให้คนอื่น |
| **Download logs** | mount /var/log แล้ว download ผ่าน browser |
| **Media server** | preview รูป/วิดีโอ บน browser |
| **Quick NAS** | NAS สำหรับทีมเล็กที่ไม่ต้องการ feature เยอะ |

## User Management

หลัง login ครั้งแรก:
1. Settings → เปลี่ยน admin password ทันที
2. User Management → สร้าง user ให้ทีม
3. ตั้ง scope (จำกัด folder) ต่อ user ได้

## API

FileBrowser มี REST API:

```bash
# login → ได้ token
TOKEN=$(curl -s -X POST https://files.dev.example.com/api/login \
  -d '{"username":"admin","password":"admin"}' | tr -d '"')

# list files
curl -H "X-Auth: $TOKEN" https://files.dev.example.com/api/resources/

# download file
curl -H "X-Auth: $TOKEN" https://files.dev.example.com/api/raw/myfile.txt -o myfile.txt
```

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```
