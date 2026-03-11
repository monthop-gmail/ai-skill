# 1. Local Dev Architecture

> 1 Container = 1 งาน = 1 Repo = 1 DNS

## หลักการ

แต่ละ service จะมี repo ของตัวเอง รันเป็น container เดียว และมี DNS เฉพาะตัวผ่าน Cloudflare Tunnel

## โครงสร้าง Repo ต่อ Service

```
project-a/
├── docker-compose.yml      # รันได้ทั้ง local + prd
├── Dockerfile
├── .env.example            # template (commit ได้)
├── .env                    # ค่าจริง (gitignore)
└── src/
```

## DNS ผ่าน Traefik + Cloudflare Tunnel

ใช้ **Traefik** เป็น reverse proxy ที่ auto-discover service จาก Docker labels
แต่ละ service ประกาศ hostname ของตัวเองใน `docker-compose.yml` — **ไม่ต้องแก้ไฟล์กลาง**

CF Tunnel ชี้มาที่ Traefik ตัวเดียว → Traefik route ไปยัง service ที่ถูกต้องตาม hostname

```
Internet → CF Tunnel → Traefik (:80) → auto route ตาม hostname
                                        ├── api.dev.example.com  → api:3000
                                        ├── web.dev.example.com  → web:3001
                                        └── xxx.dev.example.com  → xxx:N
```

### Shared Network + Traefik (ตั้งครั้งเดียว)

```bash
# สร้าง shared network ที่ทุก service ใช้ร่วมกัน
docker network create traefik-net
```

```yaml
# traefik/docker-compose.yml (รันครั้งเดียวบน host)
services:
  traefik:
    image: traefik:v3
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedByDefault=false"
      - "--providers.docker.network=traefik-net"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: unless-stopped
    networks:
      - traefik-net

  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token ${CF_TUNNEL_TOKEN}
    restart: unless-stopped
    network_mode: host

networks:
  traefik-net:
    external: true
```

CF Tunnel ตั้งค่าบน Cloudflare Dashboard:
- `*.dev.example.com` → `http://localhost:80` (ชี้ไป Traefik)

### แต่ละ Service ประกาศ hostname เอง

```yaml
# project-a/docker-compose.yml
services:
  app:
    build: .
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.project-a.rule=Host(`project-a.dev.example.com`)"
      - "traefik.http.services.project-a.loadbalancer.server.port=3000"
    networks:
      - traefik-net

networks:
  traefik-net:
    external: true
```

> เพิ่ม service ใหม่ → แค่ `docker compose up` ไม่ต้องแก้ไฟล์กลางใดๆ
> ลบ service → แค่ `docker compose down` Traefik หยุด route ให้อัตโนมัติ

### เริ่มต้นใช้งาน

```bash
# 1. สร้าง network
docker network create traefik-net

# 2. ตั้ง CF Tunnel (ทำครั้งเดียวบน Cloudflare Dashboard)
#    สร้าง tunnel → ได้ token
#    route: *.dev.example.com → http://localhost:80

# 3. รัน Traefik + Cloudflared
cd traefik && CF_TUNNEL_TOKEN=xxxx docker compose up -d

# 4. รัน service
cd ../project-a && docker compose up -d
# เข้าได้ทันที: https://project-a.dev.example.com
```

## ข้อดี

- **แยกชัดเจน** — แต่ละ service มี lifecycle ของตัวเอง
- **ง่ายต่อการ debug** — ดู log เฉพาะ container ที่สนใจ
- **เหมือน production** — รันบน Docker เหมือนกันทั้ง local และ prd
- **เข้าถึงง่าย** — ทุก service มี URL จริงผ่าน CF Tunnel
- **ไม่ต้องแก้ไฟล์กลาง** — เพิ่ม/ลบ service แค่ `docker compose up/down`
