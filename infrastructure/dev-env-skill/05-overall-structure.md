# 5. Overall Structure

> โครงสร้างทั้งระบบ

## Directory Layout บน Server

```
/opt/services/
├── api/                        # repo: github.com/team/api
│   ├── docker-compose.yml      # app + tunnel sidecar
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
│   ├── docker-compose.yml      # app + tunnel sidecar
│   ├── Dockerfile
│   ├── .env.enc
│   └── src/
│
└── worker/                     # repo: github.com/team/worker
    ├── docker-compose.yml      # app + tunnel sidecar
    ├── Dockerfile
    ├── .env.enc
    └── src/
```

> ไม่มี folder กลาง (traefik/tunnel) — แต่ละ service ครบจบในตัว

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
     │ api    ● │ │ api    ● │ │ api    ● │
     │  └tunnel │ │  └tunnel │ │  └tunnel │
     │ web    ● │ │ web    ● │ │ web    ● │
     │  └tunnel │ │  └tunnel │ │  └tunnel │
     │ worker ● │ │ worker ● │ │ worker ● │
     │  └tunnel │ │  └tunnel │ │  └tunnel │
     └────┬─────┘ └────┬─────┘ └────┬─────┘
          │             │             │
          ▼             ▼             ▼
     CF DNS +      CF DNS +      CF DNS +
     Tunnels       Tunnels       Tunnels
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

# 3. Decrypt env (มี CF_TUNNEL_TOKEN อยู่ใน .env แล้ว)
sops --decrypt .env.enc > .env

# 4. รัน (app + tunnel sidecar ขึ้นมาพร้อมกัน)
docker compose up

# 5. เข้าใช้งานผ่าน
#    http://localhost:3000              (local)
#    https://api.dev.example.com        (ผ่าน CF Tunnel)
```

## Checklist เมื่อสร้าง Service ใหม่

- [ ] สร้าง GitHub repo
- [ ] เพิ่ม `Dockerfile` + `docker-compose.yml` (app + tunnel sidecar)
- [ ] สร้าง `.env.example` พร้อม comments
- [ ] สร้าง CF Tunnel บน Dashboard ต่อ env (dev/test/prd) → ได้ token
- [ ] ตั้ง Public Hostname บน Dashboard (เช่น `svc.dev.example.com → http://app:3000`)
- [ ] ใส่ `CF_TUNNEL_TOKEN` ใน `.env` แต่ละ env
- [ ] Encrypt `.env` ด้วย SOPS → `.env.enc`
- [ ] ตั้งค่า `.github/workflows/deploy.yml`
- [ ] ตั้งค่า branch protection rules
- [ ] แจ้งทีมที่เกี่ยวข้อง
