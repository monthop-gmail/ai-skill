# WordPress Example

ตัวอย่าง WordPress + MariaDB + Redis Object Cache + CF Tunnel sidecar

## Architecture

```
Internet → CF Tunnel → WordPress (apache:80) → MariaDB
                            │
                            ▼
                        Redis (object cache)
```

## โครงสร้าง

```
wordpress/
├── docker-compose.yml      # wordpress + db + redis + tunnel
├── docker-compose.prd.yml  # override สำหรับ prd
├── .env.example
├── .gitignore
└── wp-content/
    ├── plugins/            # custom plugins (in git)
    └── themes/             # custom themes (in git)
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF_TUNNEL_TOKEN + แก้ password ใน .env

# 3. รัน
docker compose up -d

# 4. เข้าใช้งาน
#    http://localhost:80
#    https://blog.dev.example.com

# 5. ทำ WordPress setup wizard จากหน้าเว็บ
```

## CF Dashboard Setup

1. **Zero Trust → Networks → Tunnels** → Create Tunnel
2. ตั้งชื่อ เช่น `wordpress-dev` → Copy Token
3. Add Public Hostname:
   - Subdomain: `blog` / Domain: `dev.example.com`
   - Service: `http://wordpress:80`
4. ใส่ Token ใน `.env` → `CF_TUNNEL_TOKEN=eyJhIjoixxxxx`

## Redis Object Cache

WP ต่อ Redis ผ่าน `WP_REDIS_HOST` ใน `.env` → ลด DB query ได้มาก

หลังจาก WordPress ขึ้นแล้ว:

1. ติดตั้ง plugin **Redis Object Cache** จาก WP Admin
2. ไปที่ Settings → Redis → Enable Object Cache
3. สถานะจะแสดง "Connected"

## Custom Plugins / Themes

mount เข้า container โดยตรง — แก้ไฟล์บน host แล้วเห็นผลทันที:

```
wp-content/plugins/my-plugin/    → /var/www/html/wp-content/plugins/my-plugin/
wp-content/themes/my-theme/      → /var/www/html/wp-content/themes/my-theme/
```

## Backup

```bash
# dump database
docker compose exec db mariadb-dump -u root -p${DB_ROOT_PASS} ${DB_NAME} > backup.sql

# backup uploads
docker compose cp wordpress:/var/www/html/wp-content/uploads ./uploads-backup

# restore database
docker compose exec -T db mariadb -u root -p${DB_ROOT_PASS} ${DB_NAME} < backup.sql
```

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```
