# Dev Environment Checklist

Checklist รวมจาก [01-local-dev](./01-local-dev.md) ถึง [05-overall-structure](./05-overall-structure.md)
ใช้ตรวจสอบว่า service/ecosystem ตั้งค่าครบตาม pattern

---

## 1. Local Dev Architecture

> Ref: [01-local-dev.md](./01-local-dev.md)

- [ ] 1 service = 1 repo = 1 `docker-compose.yml`
- [ ] มี CF Tunnel sidecar ใน compose (`cloudflare/cloudflared`)
- [ ] Tunnel ใช้ `--no-autoupdate`
- [ ] Route ตั้งค่าบน **Cloudflare Dashboard** (ไม่ใช้ config.yml)
- [ ] มี `.env.example` (template, commit ได้)
- [ ] มี `.env` (ค่าจริง, **gitignore**)
- [ ] `docker compose up` แล้วใช้งานได้ทั้ง localhost และ CF Tunnel URL
- [ ] (Multi-service) ใช้ compose `include` แยกไฟล์ต่อ service (v2.20+)

## 2. Local to Production Sync

> Ref: [02-local-to-prd.md](./02-local-to-prd.md)

- [ ] `docker-compose.yml` **เหมือนกัน**ทุก env (dev/test/prd)
- [ ] ต่างกันแค่ `.env` (DB_HOST, CF_TUNNEL_TOKEN, etc.)
- [ ] มี `docker-compose.prd.yml` สำหรับ production override
  - [ ] resource limits (cpu, memory)
  - [ ] replicas (ถ้าต้องการ)
  - [ ] healthcheck (ถ้าไม่มีใน base)
- [ ] วิธีรัน prd: `docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d`
- [ ] มี deploy script (`scripts/deploy.sh`) หรือ CI/CD workflow
- [ ] สิ่งที่ **ไม่ต้องปรับ** ข้าม env:
  - [ ] Dockerfile
  - [ ] docker-compose.yml
  - [ ] Source code

## 3. Environment Separation

> Ref: [03-env-separation.md](./03-env-separation.md)

### DNS แยกตาม env

- [ ] Dev: `svc.dev.example.com`
- [ ] Test: `svc.test.example.com`
- [ ] Prd: `svc.example.com`

### Git Branching

- [ ] `feature/xxx` → `develop` → `main`
- [ ] Push to `develop` → auto deploy test
- [ ] Push to `main` → auto deploy prd

### CF Tunnel ต่อ env

- [ ] แต่ละ service × แต่ละ env = 1 Tunnel
- [ ] Token เก็บใน `.env` แยกต่อ env

### Team Collaboration

- [ ] Branch protection rules:
  - [ ] `develop` → 1 approval
  - [ ] `main` → 2 approvals + CI pass
- [ ] มี `CODEOWNERS` กำหนดว่าใครดูแลไฟล์ไหน

### CI/CD

- [ ] มี `.github/workflows/deploy.yml`
- [ ] Auto set env (dev/test/prd) จาก branch
- [ ] Deploy: `git pull` → `sops decrypt` → `docker compose up -d --build`

## 4. Secret Management

> Ref: [04-secret-management.md](./04-secret-management.md)

### SOPS + age Setup

- [ ] ติดตั้ง `sops` + `age`
- [ ] สร้าง key pair: `age-keygen -o keys.txt`
- [ ] เก็บ key ที่ `~/.config/sops/age/keys.txt`
- [ ] ตั้ง `export SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt` ใน shell

### Config

- [ ] มี `.sops.yaml` (commit ได้) — กำหนด public keys ที่ authorized
- [ ] มี `.env.enc` (commit ได้) — encrypted env file

### .gitignore

- [ ] `.env` อยู่ใน .gitignore
- [ ] `*.key` อยู่ใน .gitignore
- [ ] `keys.txt` อยู่ใน .gitignore
- [ ] `.env.enc` **ไม่อยู่**ใน .gitignore (commit ได้)

### Encrypt / Decrypt

- [ ] Encrypt: `sops --encrypt .env > .env.enc`
- [ ] Decrypt: `sops --decrypt .env.enc > .env`
- [ ] Edit: `sops .env.enc`

### Key Distribution

- [ ] ส่ง key ผ่าน: 1Password / Bitwarden / Signal / ให้ตรงมือ
- [ ] **ห้าม**: Email, Slack, LINE, ช่องทางไม่เข้ารหัส

### CI/CD

- [ ] เก็บ `SOPS_AGE_KEY` (private key content) ใน GitHub Secrets
- [ ] Workflow: `sops --decrypt .env.enc > .env`

### Key Rotation (เมื่อคนออกจากทีม)

- [ ] สร้าง key ใหม่
- [ ] อัปเดต `.sops.yaml` — ลบ public key คนที่ออก
- [ ] Re-encrypt: `sops updatekeys .env.enc`
- [ ] ส่ง key ใหม่ให้ทีม

## 5. Overall Structure

> Ref: [05-overall-structure.md](./05-overall-structure.md)

### Directory Layout

- [ ] แต่ละ service อยู่ใน `/opt/services/{name}/`
- [ ] ทุก service มี:
  - [ ] `docker-compose.yml` (app + tunnel sidecar)
  - [ ] `docker-compose.prd.yml` (override)
  - [ ] `Dockerfile`
  - [ ] `.env.example`
  - [ ] `.env.enc` (encrypted)
  - [ ] `.sops.yaml`
  - [ ] `.github/workflows/deploy.yml`

### Checklist เมื่อสร้าง Service ใหม่

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

### Modular (Multi-service Ecosystem)

- [ ] Root `docker-compose.yml` ใช้ `include:` ชี้ไปยัง `services/*/compose.yaml`
- [ ] มี shared network declaration
- [ ] ทุก service compose ระบุ `networks:` + `volumes:`
- [ ] Tunnels รวมอยู่ใน `services/tunnels/compose.yaml`

---

## Quick Audit Commands

```bash
# ─── ตรวจ .env ไม่ถูก commit ───
git ls-files | grep -E '\.env$' && echo "FAIL" || echo "OK"

# ─── ตรวจ hardcoded password ใน compose ───
grep -rn 'password:' docker-compose*.yml --include='*.yml' | grep -v '\${'

# ─── ตรวจ service ไม่มี restart policy ───
grep -L 'restart:' docker-compose.yml

# ─── ตรวจ tunnel ไม่มี --no-autoupdate ───
grep 'cloudflared' docker-compose.yml | grep -v 'no-autoupdate'

# ─── Validate compose config ───
docker compose config --quiet && echo "OK" || echo "FAIL"

# ─── ตรวจ .sops.yaml มีไหม ───
[ -f .sops.yaml ] && echo "OK" || echo "MISSING .sops.yaml"

# ─── ตรวจ .env.enc มีไหม ───
[ -f .env.enc ] && echo "OK" || echo "MISSING .env.enc"
```
