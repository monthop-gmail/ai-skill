# 3. Environment Separation

> แยก Dev / Test / PRD สำหรับหลายทีม

## แยกด้วย 3 ชั้น

| ชั้น | Dev | Test | Production |
|------|-----|------|------------|
| **DNS** | `svc.dev.example.com` | `svc.test.example.com` | `svc.example.com` |
| **Branch** | feature branch | `develop` | `main` |
| **Env file** | `.env.dev` | `.env.test` | `.env.prd` |
| **Server** | dev-server | test-server | prd-server |
| **CF Tunnel** | tunnel ต่อ service (dev) | tunnel ต่อ service (test) | tunnel ต่อ service (prd) |

## Git Branching Strategy

```
feature/xxx ──► develop ──► main
    │              │          │
    ▼              ▼          ▼
  dev env      test env    prd env
```

### Flow

1. Developer สร้าง feature branch จาก `develop`
2. ทำงานเสร็จ → PR merge เข้า `develop`
3. Auto deploy ไป test environment
4. ทดสอบผ่าน → PR merge เข้า `main`
5. Auto deploy ไป production

## Server / Host แยก

```
Host: dev-server   → แต่ละ service รัน CF Tunnel sidecar → *.dev.example.com
Host: test-server  → แต่ละ service รัน CF Tunnel sidecar → *.test.example.com
Host: prd-server   → แต่ละ service รัน CF Tunnel sidecar → *.example.com
```

### CF Tunnel ต่อ Environment

แต่ละ service × แต่ละ env = 1 Tunnel บน Cloudflare Dashboard

```
Cloudflare Dashboard:
├── Tunnel: api-dev   → route: api.dev.example.com   → http://app:3000
├── Tunnel: api-test  → route: api.test.example.com  → http://app:3000
├── Tunnel: api-prd   → route: api.example.com       → http://app:3000
├── Tunnel: web-dev   → route: web.dev.example.com   → http://app:3001
├── Tunnel: web-test  → route: web.test.example.com  → http://app:3001
└── Tunnel: web-prd   → route: web.example.com       → http://app:3001
```

แต่ละ service ต่าง env กันแค่ `.env`:

```bash
# .env (dev)
CF_TUNNEL_TOKEN=eyJhIjoixxxxx_dev
DB_HOST=localhost

# .env (prd)
CF_TUNNEL_TOKEN=eyJhIjoixxxxx_prd
DB_HOST=db.internal
```

```yaml
# docker-compose.yml (ใช้ร่วมกันทุก env — ไม่ต้องแก้)
services:
  app:
    build: .
    environment:
      - DB_HOST=${DB_HOST}

  tunnel:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token ${CF_TUNNEL_TOKEN}
    depends_on:
      - app
    restart: unless-stopped
```

> เพิ่ม service ใหม่ → สร้าง Tunnel บน Dashboard + `docker compose up` จบ

## หลายทีมทำงานร่วมกัน

### แต่ละทีม

```
Team A: ดูแล api service
Team B: ดูแล web service
Team C: ดูแล worker service
```

### กฎ

- แต่ละทีม clone repo ของ service ที่ตัวเองดูแล
- ทำงานบน feature branch ของตัวเอง
- PR ต้องมี review จากทีม ก่อน merge เข้า `develop`
- merge เข้า `main` ต้องผ่าน test บน test environment ก่อน

### ป้องกัน Conflict

- ใช้ **branch protection rules** บน GitHub
  - `develop` → ต้องมี 1 approval
  - `main` → ต้องมี 2 approvals + CI pass
- ใช้ **CODEOWNERS** กำหนดว่าใครดูแลไฟล์ไหน

```
# .github/CODEOWNERS
* @team-lead
src/api/ @team-a
src/web/ @team-b
```

## CI/CD Pipeline (GitHub Actions ตัวอย่าง)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [develop, main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set environment
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            echo "ENV=prd" >> $GITHUB_ENV
            echo "HOST=prd-server" >> $GITHUB_ENV
          else
            echo "ENV=test" >> $GITHUB_ENV
            echo "HOST=test-server" >> $GITHUB_ENV
          fi

      - name: Deploy
        run: |
          ssh ${{ env.HOST }} "cd /opt/services/${{ github.event.repository.name }} && \
            git pull && \
            sops --decrypt .env.enc > .env && \
            docker compose up -d --build"
```
