# 3. Environment Separation

> แยก Dev / Test / PRD สำหรับหลายทีม

## แยกด้วย 3 ชั้น

| ชั้น | Dev | Test | Production |
|------|-----|------|------------|
| **DNS** | `svc.dev.example.com` | `svc.test.example.com` | `svc.example.com` |
| **Branch** | feature branch | `develop` | `main` |
| **Env file** | `.env.dev` | `.env.test` | `.env.prd` |
| **Server** | dev-server | test-server | prd-server |

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
Host: dev-server   → CF Tunnel → *.dev.example.com
Host: test-server  → CF Tunnel → *.test.example.com
Host: prd-server   → CF Tunnel → *.example.com
```

### CF Tunnel Config ต่อ Environment

```yaml
# dev-server: tunnel/config.yml
ingress:
  - hostname: api.dev.example.com
    service: http://localhost:3000
  - hostname: web.dev.example.com
    service: http://localhost:3001
  - service: http_status:404
```

```yaml
# prd-server: tunnel/config.yml
ingress:
  - hostname: api.example.com
    service: http://localhost:3000
  - hostname: web.example.com
    service: http://localhost:3001
  - service: http_status:404
```

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
