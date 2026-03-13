# Dev Environment Audit Checklist

Checklist รวมจาก [01-local-dev](./01-local-dev.md) ถึง [05-overall-structure](./05-overall-structure.md)
ใช้ตรวจสอบว่า service/ecosystem ตั้งค่าครบตาม pattern

---

## 1. Local Dev Architecture

> Ref: [01-local-dev.md](./01-local-dev.md)

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 1.1 | 1 service = 1 repo | แต่ละ service อยู่ใน repo แยก มี `docker-compose.yml` ของตัวเอง | | |
| 1.2 | CF Tunnel sidecar | มี container `cloudflare/cloudflared` ใน compose | | |
| 1.3 | `--no-autoupdate` | Tunnel command ใช้ flag `--no-autoupdate` | | |
| 1.4 | Route via Dashboard | Route ตั้งค่าบน Cloudflare Dashboard (ไม่ใช้ config.yml) | | |
| 1.5 | `.env.example` | มี template `.env.example` (commit ได้) | | |
| 1.6 | `.env` gitignored | มี `.env` ค่าจริง อยู่ใน `.gitignore` | | |
| 1.7 | `docker compose up` works | รันแล้วใช้งานได้ทั้ง localhost และ CF Tunnel URL | | |
| 1.8 | Modular compose (ถ้า multi-service) | ใช้ `include:` แยกไฟล์ต่อ service (Docker Compose v2.20+) | | |

## 2. Local to Production Sync

> Ref: [02-local-to-prd.md](./02-local-to-prd.md)

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 2.1 | Compose เหมือนกันทุก env | `docker-compose.yml` ใช้ร่วมกัน dev/test/prd | | |
| 2.2 | ต่างกันแค่ `.env` | DB_HOST, CF_TUNNEL_TOKEN ฯลฯ แยกตาม env | | |
| 2.3 | `docker-compose.prd.yml` | มี production override file | | |
| 2.4 | Resource limits | prd override มี cpu/memory limits | | |
| 2.5 | Replicas | prd override มี replicas (ถ้าต้องการ) | | |
| 2.6 | Healthcheck | prd override มี healthcheck (ถ้าไม่มีใน base) | | |
| 2.7 | วิธีรัน prd | `docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d` | | |
| 2.8 | Deploy script | มี `scripts/deploy.sh` หรือ CI/CD workflow | | |
| 2.9 | ไม่ต้องปรับข้าม env | Dockerfile, docker-compose.yml, source code เหมือนกันทุก env | | |

## 3. Environment Separation

> Ref: [03-env-separation.md](./03-env-separation.md)

### DNS แยกตาม env

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 3.1 | Dev DNS | `svc.dev.example.com` | | |
| 3.2 | Test DNS | `svc.test.example.com` | | |
| 3.3 | Prd DNS | `svc.example.com` | | |

### Git Branching

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 3.4 | Branch flow | `feature/xxx` → `develop` → `main` | | |
| 3.5 | Auto deploy test | Push to `develop` → auto deploy test env | | |
| 3.6 | Auto deploy prd | Push to `main` → auto deploy prd env | | |

### CF Tunnel ต่อ env

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 3.7 | Tunnel per env | แต่ละ service × แต่ละ env = 1 Tunnel | | |
| 3.8 | Token แยก env | Token เก็บใน `.env` แยกต่อ env | | |

### Team Collaboration

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 3.9 | Branch protection (develop) | `develop` → ต้องมี 1 approval | | |
| 3.10 | Branch protection (main) | `main` → ต้องมี 2 approvals + CI pass | | |
| 3.11 | CODEOWNERS | มี `CODEOWNERS` กำหนดว่าใครดูแลไฟล์ไหน | | |

### CI/CD

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 3.12 | Deploy workflow | มี `.github/workflows/deploy.yml` | | |
| 3.13 | Auto set env | ตั้ง env (dev/test/prd) จาก branch อัตโนมัติ | | |
| 3.14 | Deploy steps | `git pull` → `sops decrypt` → `docker compose up -d --build` | | |

## 4. Secret Management

> Ref: [04-secret-management.md](./04-secret-management.md)

### SOPS + age Setup

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 4.1 | ติดตั้ง SOPS + age | `sops` และ `age` ติดตั้งแล้ว | | |
| 4.2 | Key pair | สร้างด้วย `age-keygen -o keys.txt` | | |
| 4.3 | Key location | เก็บที่ `~/.config/sops/age/keys.txt` | | |
| 4.4 | Shell env | `export SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt` ใน shell | | |

### Config

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 4.5 | `.sops.yaml` | มี config file (commit ได้) กำหนด public keys ที่ authorized | | |
| 4.6 | `.env.enc` | มี encrypted env file (commit ได้) | | |

### .gitignore

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 4.7 | `.env` ignored | `.env` อยู่ใน .gitignore | | |
| 4.8 | `*.key` ignored | `*.key` อยู่ใน .gitignore | | |
| 4.9 | `keys.txt` ignored | `keys.txt` อยู่ใน .gitignore | | |
| 4.10 | `.env.enc` tracked | `.env.enc` **ไม่อยู่**ใน .gitignore (commit ได้) | | |

### Encrypt / Decrypt

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 4.11 | Encrypt | `sops --encrypt .env > .env.enc` | | |
| 4.12 | Decrypt | `sops --decrypt .env.enc > .env` | | |
| 4.13 | Edit | `sops .env.enc` | | |

### Key Distribution

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 4.14 | ช่องทางปลอดภัย | ส่ง key ผ่าน 1Password / Bitwarden / Signal / ให้ตรงมือ | | |
| 4.15 | ห้ามช่องทางไม่เข้ารหัส | ห้าม Email, Slack, LINE, ช่องทางไม่เข้ารหัส | | |

### CI/CD Secrets

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 4.16 | GitHub Secrets | เก็บ `SOPS_AGE_KEY` (private key content) ใน GitHub Secrets | | |
| 4.17 | Workflow decrypt | `sops --decrypt .env.enc > .env` ใน workflow | | |

### Key Rotation

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 4.18 | สร้าง key ใหม่ | สร้าง key pair ใหม่เมื่อคนออกจากทีม | | |
| 4.19 | อัปเดต `.sops.yaml` | ลบ public key คนที่ออก | | |
| 4.20 | Re-encrypt | `sops updatekeys .env.enc` | | |
| 4.21 | แจ้งทีม | ส่ง key ใหม่ให้ทีม | | |

## 5. Overall Structure

> Ref: [05-overall-structure.md](./05-overall-structure.md)

### Directory Layout

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 5.1 | Service path | แต่ละ service อยู่ใน `/opt/services/{name}/` | | |
| 5.2 | `docker-compose.yml` | app + tunnel sidecar | | |
| 5.3 | `docker-compose.prd.yml` | production override | | |
| 5.4 | `Dockerfile` | build instructions | | |
| 5.5 | `.env.example` | template env file | | |
| 5.6 | `.env.enc` | encrypted env file | | |
| 5.7 | `.sops.yaml` | SOPS config | | |
| 5.8 | Deploy workflow | `.github/workflows/deploy.yml` | | |

### New Service Checklist

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 5.9 | GitHub repo | สร้าง repo ใหม่ | | |
| 5.10 | Dockerfile + compose | `Dockerfile` + `docker-compose.yml` (app + tunnel) | | |
| 5.11 | `.env.example` | สร้างพร้อม comments | | |
| 5.12 | CF Tunnel per env | สร้าง Tunnel บน Dashboard ต่อ env (dev/test/prd) | | |
| 5.13 | Public Hostname | ตั้งบน Dashboard เช่น `svc.dev.example.com → http://app:3000` | | |
| 5.14 | `CF_TUNNEL_TOKEN` | ใส่ใน `.env` แต่ละ env | | |
| 5.15 | Encrypt `.env` | SOPS encrypt → `.env.enc` | | |
| 5.16 | Deploy workflow | `.github/workflows/deploy.yml` | | |
| 5.17 | Branch protection | ตั้ง rules ตาม section 3 | | |
| 5.18 | แจ้งทีม | แจ้งทีมที่เกี่ยวข้อง | | |

### Modular (Multi-service Ecosystem)

| # | Feature | คำอธิบาย | Status | Notes |
|---|---------|----------|--------|-------|
| 5.19 | Root compose `include:` | ชี้ไปยัง `services/*/compose.yaml` | | |
| 5.20 | Shared network | มี shared network declaration | | |
| 5.21 | Service networks + volumes | ทุก service compose ระบุ `networks:` + `volumes:` | | |
| 5.22 | Tunnels แยกไฟล์ | รวมอยู่ใน `services/tunnels/compose.yaml` | | |

---

## Audit Summary

| Section | หัวข้อ | Total | ✅ | ❌ | ⚠️ | Notes |
|---------|--------|-------|---|---|---|-------|
| 1 | Local Dev Architecture | 8 | | | | |
| 2 | Local to Production Sync | 9 | | | | |
| 3 | Environment Separation | 14 | | | | |
| 4 | Secret Management | 21 | | | | |
| 5 | Overall Structure | 22 | | | | |
| **รวม** | | **74** | | | | |

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

---

> **Audited by:** _______________
> **Date:** _______________
> **Project / Service:** _______________
