# Nextcloud Example

ตัวอย่าง Nextcloud (NAS เต็มรูปแบบ) + PostgreSQL + Redis + CF Tunnel

## Architecture

```
Internet → CF Tunnel → Nextcloud (apache:80) → PostgreSQL
                            │                → Redis (cache)
                            │
                            ├── /data          (user files)
                            └── /mnt/external  (external storage)
```

## Features

- **File Sync** — sync ไฟล์ผ่าน desktop/mobile client
- **Web UI** — จัดการไฟล์, แชร์ link, preview
- **Collaboration** — Calendar, Contacts, Talk (video call), Office
- **External Storage** — mount disk/SMB/S3 เพิ่มได้
- **WebDAV** — เข้าถึงไฟล์ผ่าน WebDAV protocol

## โครงสร้าง

```
nextcloud/
├── docker-compose.yml      # nextcloud + db + redis + cron + tunnel
├── docker-compose.prd.yml  # override: mount external disk
├── .env.example
├── .gitignore
└── external/               # external storage mount
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. สร้าง external folder
mkdir -p external

# 3. ใส่ CF_TUNNEL_TOKEN + แก้ ADMIN_PASS ใน .env

# 4. รัน
docker compose up -d

# 5. เข้าใช้งาน
#    https://cloud.dev.example.com
#    login: admin / (password ที่ตั้ง)
```

## CF Dashboard Setup

1. **Zero Trust → Networks → Tunnels** → Create Tunnel
2. ตั้งชื่อ เช่น `nextcloud-dev` → Copy Token
3. Add Public Hostname:
   - Subdomain: `cloud` / Domain: `dev.example.com`
   - Service: `http://nextcloud:80`
4. **HTTP Settings** (สำคัญ):
   - HTTP/2 Origin: **enabled**
   - No TLS Verify: **enabled**
5. ใส่ Token ใน `.env`

## Desktop / Mobile Sync

ติดตั้ง Nextcloud client:
- **Desktop**: https://nextcloud.com/install/#install-clients
- **Android**: Google Play → Nextcloud
- **iOS**: App Store → Nextcloud

ตั้งค่า:
- Server: `https://cloud.dev.example.com`
- Login ด้วย user/password

## WebDAV Access

```
URL: https://cloud.dev.example.com/remote.php/dav/files/USERNAME/
```

mount บน Linux:
```bash
sudo mount -t davfs https://cloud.dev.example.com/remote.php/dav/files/admin/ /mnt/nextcloud
```

## External Storage (mount disk เพิ่ม)

### Local disk

แก้ `docker-compose.yml` เพิ่ม volume:
```yaml
volumes:
  - /mnt/disk2:/mnt/external/disk2
```

จากนั้นใน Nextcloud → Settings → External Storage → เพิ่ม Local path `/mnt/external/disk2`

### S3 (MinIO)

Nextcloud → Settings → External Storage:
- Type: **Amazon S3**
- Bucket: `uploads`
- Hostname: `s3.dev.example.com`
- Port: 443, SSL: enabled
- Access Key + Secret Key

## Backup

```bash
# database
docker compose exec -T db pg_dump -U nextcloud nextcloud > backup.sql

# files (ระวัง — อาจใหญ่มาก)
docker compose cp nextcloud:/var/www/html/data ./backup-data

# restore
docker compose exec -T db psql -U nextcloud nextcloud < backup.sql
```

## Nextcloud occ CLI

```bash
# รัน occ command
docker compose exec -u www-data nextcloud php occ

# scan files
docker compose exec -u www-data nextcloud php occ files:scan --all

# maintenance mode
docker compose exec -u www-data nextcloud php occ maintenance:mode --on
docker compose exec -u www-data nextcloud php occ maintenance:mode --off
```

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```

PRD override mount data ไปที่ external disk `/mnt/disk1/` แทน Docker volume
