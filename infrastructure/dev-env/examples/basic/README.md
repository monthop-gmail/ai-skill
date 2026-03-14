# Basic Example

ตัวอย่าง Node.js + PostgreSQL + CF Tunnel sidecar

## โครงสร้าง

```
basic/
├── docker-compose.yml      # app + db + tunnel
├── docker-compose.prd.yml  # override สำหรับ prd
├── Dockerfile
├── .env.example            # template
├── .gitignore
└── src/
    └── index.js
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF_TUNNEL_TOKEN ใน .env

# 3. รัน
docker compose up -d

# 4. เข้าใช้งาน
#    http://localhost:3000
#    https://svc.dev.example.com
```

## CF Dashboard Setup

1. **Zero Trust → Networks → Tunnels** → Create Tunnel
2. ตั้งชื่อ เช่น `basic-dev` → Copy Token
3. Add Public Hostname:
   - Subdomain: `basic` / Domain: `dev.example.com`
   - Service: `http://app:3000`
4. ใส่ Token ใน `.env` → `CF_TUNNEL_TOKEN=eyJhIjoixxxxx`

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```
