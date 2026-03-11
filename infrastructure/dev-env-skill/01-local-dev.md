# 1. Local Dev Architecture

> 1 Container = 1 งาน = 1 Repo = 1 DNS

## หลักการ

แต่ละ service จะมี repo ของตัวเอง รันเป็น container เดียว มี CF Tunnel sidecar ของตัวเอง
และมี DNS เฉพาะตัวที่ตั้งค่าบน Cloudflare Dashboard — **ครบจบในตัว ไม่มีไฟล์กลาง**

## โครงสร้าง Repo ต่อ Service

```
project-a/
├── docker-compose.yml      # app + tunnel sidecar (ใช้ทั้ง local + prd)
├── Dockerfile
├── .env.example            # template (commit ได้)
├── .env                    # ค่าจริง (gitignore)
└── src/
```

## DNS ผ่าน Cloudflare DNS + CF Tunnel Sidecar

แต่ละ service รัน `cloudflared` เป็น sidecar container ของตัวเอง
Route ตั้งค่าบน **Cloudflare Dashboard** ไม่ต้องแก้ config file ใดๆ

```
Internet → CF DNS → CF Tunnel (sidecar) → app container
```

### docker-compose.yml ต่อ Service

```yaml
# project-a/docker-compose.yml
services:
  app:
    build: .
    restart: unless-stopped

  tunnel:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token ${CF_TUNNEL_TOKEN}
    depends_on:
      - app
    restart: unless-stopped
```

```bash
# .env
CF_TUNNEL_TOKEN=eyJhIjoixxxxx
```

### ตั้งค่าบน Cloudflare Dashboard

1. ไปที่ **Zero Trust → Networks → Tunnels**
2. สร้าง Tunnel ใหม่ → ได้ **Token**
3. เพิ่ม **Public Hostname**:
   - Subdomain: `project-a` / Domain: `dev.example.com`
   - Service: `http://app:3000`
4. เก็บ Token ไว้ใน `.env` → `CF_TUNNEL_TOKEN=eyJhIjoixxxxx`

> ทุกอย่างจัดการบน Dashboard — ไม่ต้องมี config.yml บน server

### เริ่มต้นใช้งาน

```bash
# 1. Clone repo
git clone git@github.com:team/project-a.git
cd project-a

# 2. ตั้ง CF Tunnel บน Cloudflare Dashboard → ได้ token

# 3. ใส่ token ใน .env
echo "CF_TUNNEL_TOKEN=eyJhIjoixxxxx" > .env

# 4. รัน
docker compose up -d

# 5. เข้าใช้งาน
#    http://localhost:3000              (local)
#    https://project-a.dev.example.com  (ผ่าน CF Tunnel)
```

## ข้อดี

- **ครบจบในตัว** — แต่ละ repo มี app + tunnel ไม่พึ่งพา service กลาง
- **ไม่มีไฟล์กลาง** — เพิ่ม/ลบ service แค่ `docker compose up/down`
- **ง่ายต่อการ debug** — ดู log เฉพาะ container ที่สนใจ
- **เหมือน production** — รันบน Docker เหมือนกันทั้ง local และ prd
- **เข้าถึงง่าย** — ทุก service มี URL จริงผ่าน CF Tunnel
- **ตั้งค่าผ่าน Dashboard** — ไม่ต้องแก้ config file ใดๆ บน server
