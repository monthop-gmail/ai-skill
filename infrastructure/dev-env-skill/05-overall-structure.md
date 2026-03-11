# 5. Overall Structure

> โครงสร้างทั้งระบบ

## Directory Layout บน Server

```
/opt/services/
├── api/                        # repo: github.com/team/api
│   ├── docker-compose.yml
│   ├── docker-compose.prd.yml  # override สำหรับ prd
│   ├── Dockerfile
│   ├── .env.example            # template (in git)
│   ├── .env.enc                # encrypted (in git)
│   ├── .env                    # decrypted (gitignore)
│   ├── .sops.yaml              # sops config (in git)
│   ├── .github/
│   │   ├── workflows/
│   │   │   └── deploy.yml
│   │   └── CODEOWNERS
│   └── src/
│
├── web/                        # repo: github.com/team/web
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── .env.enc
│   └── src/
│
├── worker/                     # repo: github.com/team/worker
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── .env.enc
│   └── src/
│
└── traefik/
    └── docker-compose.yml      # Traefik + Cloudflared
```

## Traefik + CF Tunnel (ตั้งครั้งเดียวต่อ server)

```yaml
# traefik/docker-compose.yml
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

> แต่ละ service ประกาศ hostname ผ่าน Docker label ใน `docker-compose.yml` ของตัวเอง
> ไม่ต้องแก้ไฟล์กลางเมื่อเพิ่ม/ลบ service

## ภาพรวมทั้งระบบ

```
                    GitHub Repos
                    ┌──────────┐
                    │  api     │
                    │  web     │
                    │  worker  │
                    └────┬─────┘
                         │ git push
                         ▼
                   GitHub Actions
                    ┌──────────┐
                    │ CI/CD    │
                    │ test     │
                    │ deploy   │
                    └────┬─────┘
                         │ ssh + deploy.sh
            ┌────────────┼────────────┐
            ▼            ▼            ▼
     ┌──────────┐ ┌──────────┐ ┌──────────┐
     │dev-server│ │test-server│ │prd-server│
     │          │ │          │ │          │
     │ traefik● │ │ traefik● │ │ traefik● │
     │ api  ●   │ │ api  ●   │ │ api  ●   │
     │ web  ●   │ │ web  ●   │ │ web  ●   │
     │ worker ● │ │ worker ● │ │ worker ● │
     └────┬─────┘ └────┬─────┘ └────┬─────┘
          │             │             │
          ▼             ▼             ▼
     CF Tunnel     CF Tunnel     CF Tunnel
          │             │             │
          ▼             ▼             ▼
  *.dev.example   *.test.example  *.example
     .com            .com           .com
```

## Quick Start สำหรับ Developer ใหม่

```bash
# 1. Clone repo
git clone git@github.com:team/api.git
cd api

# 2. ขอ age key จาก admin → เก็บที่ ~/.config/sops/age/keys.txt

# 3. Decrypt env
sops --decrypt .env.enc > .env

# 4. รัน
docker compose up

# 5. เข้าใช้งานผ่าน
#    http://localhost:3000      (local)
#    https://api.dev.example.com (ผ่าน CF Tunnel)
```

## Checklist เมื่อสร้าง Service ใหม่

- [ ] สร้าง GitHub repo
- [ ] เพิ่ม `Dockerfile` + `docker-compose.yml`
- [ ] สร้าง `.env.example` พร้อม comments
- [ ] Encrypt `.env` ด้วย SOPS → `.env.enc`
- [ ] ตั้งค่า `.github/workflows/deploy.yml`
- [ ] ตั้งค่า branch protection rules
- [ ] ตั้ง `TRAEFIK_HOST` ใน `.env` ทุก environment
- [ ] แจ้งทีมที่เกี่ยวข้อง
