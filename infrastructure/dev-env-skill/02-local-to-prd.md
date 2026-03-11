# 2. Local to Production Sync

> Sync local ไป PRD ไม่ต้องปรับอะไร

## หลักการ

`docker-compose.yml` เหมือนกันทุก environment ต่างกันแค่ `.env`

## docker-compose.yml (ใช้ร่วมกัน)

```yaml
services:
  app:
    build: .
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      - NODE_ENV=${ENV}
      - DB_HOST=${DB_HOST}
      - DB_PASS=${DB_PASS}
    restart: unless-stopped
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

## วิธีรัน

```bash
# local (dev)
ENV=development DB_HOST=localhost docker compose up

# production
ENV=production DB_HOST=db.internal docker compose up -d
```

## กรณีที่ PRD ต้องการ config พิเศษ

ใช้ override file สำหรับ config เฉพาะ production เช่น replicas, resources, healthcheck

```yaml
# docker-compose.prd.yml (override เฉพาะ prd)
services:
  app:
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

```bash
# รันบน prd ด้วย override
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```

## Deploy Script

```bash
#!/bin/bash
# scripts/deploy.sh

set -euo pipefail

ENV=${1:-dev}

echo "Deploying for: $ENV"

# decrypt .env
sops --decrypt .env.enc > .env

if [ "$ENV" = "prd" ]; then
  docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d --build
else
  docker compose up -d --build
fi

echo "Deploy complete"
```

## Flow

```
Local Dev                    Production
─────────                    ──────────
docker-compose.yml    ─────► docker-compose.yml (เหมือนกัน)
.env (dev values)            .env (prd values)
                             + docker-compose.prd.yml (override)
```

## สิ่งที่ไม่ต้องปรับ

- **Dockerfile** — เหมือนกันทุก env
- **docker-compose.yml** — เหมือนกันทุก env
- **Source code** — เหมือนกันทุก env
- **เปลี่ยนแค่ .env** — ค่า config ที่ต่างกันอยู่ใน environment variables เท่านั้น
