# 4. Secret Management

> จัดการ .env อย่างปลอดภัย ไม่เก็บ plaintext บน GitHub

## เปรียบเทียบวิธี

| วิธี | ความง่าย | เหมาะกับ | หมายเหตุ |
|------|---------|---------|----------|
| **git-crypt** | ง่ายมาก | ทีมเล็ก 2-3 คน | encrypt ทั้งไฟล์ใน git |
| **SOPS + age** | ง่าย | ทีมเล็ก-กลาง | encrypt per-file, ดี diff ได้ |
| **Vault / Doppler** | ซับซ้อน | ทีมใหญ่ | centralized, audit log |

## แนะนำ: SOPS + age

เหมาะกับเคสนี้เพราะ:
- ไม่ต้องตั้ง server เพิ่ม
- encrypt/decrypt ง่าย
- commit `.env.enc` ขึ้น git ได้ปลอดภัย
- ใช้กับ CI/CD ได้

### ติดตั้ง

```bash
# ติดตั้ง sops
curl -LO https://github.com/getsops/sops/releases/latest/download/sops-v3-linux-amd64
mv sops-v3-linux-amd64 /usr/local/bin/sops
chmod +x /usr/local/bin/sops

# ติดตั้ง age
apt install age
# หรือ
brew install age
```

### สร้าง Key

```bash
# สร้าง key pair
age-keygen -o keys.txt

# จะได้ output:
# Public key: age1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# เก็บ keys.txt ไว้ที่ปลอดภัย ห้าม commit
```

### ตั้งค่า SOPS

```yaml
# .sops.yaml (commit ได้)
creation_rules:
  - path_regex: \.env\.enc$
    age: >-
      age1xxxx_dev_key,
      age1xxxx_ci_key,
      age1xxxx_admin_key
```

### ใช้งาน

```bash
# encrypt .env → .env.enc
sops --encrypt .env > .env.enc

# decrypt .env.enc → .env
sops --decrypt .env.enc > .env

# แก้ไข encrypted file โดยตรง
sops .env.enc
```

### .gitignore

```gitignore
# Secret files - ห้าม commit
.env
*.key
keys.txt

# Encrypted files - commit ได้
# .env.enc  ← อันนี้ commit ได้
```

## Flow การส่ง Key ให้ทีม

```
┌─────────────┐
│  Admin สร้าง │
│  age key     │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────┐
│  ส่ง key ผ่านช่องทางปลอดภัย    │
│                              │
│  • 1Password / Bitwarden     │
│  • Signal (disappearing msg) │
│  • ให้ตรงมือ (USB / QR code)  │
│                              │
│  ห้าม: Email, Slack, LINE    │
└──────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Developer เก็บ key ไว้ที่:    │
│  ~/.config/sops/age/keys.txt │
└──────────────────────────────┘
```

### ตั้งค่า key location

```bash
# เพิ่มใน ~/.bashrc หรือ ~/.zshrc
export SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt
```

## CI/CD ใช้ SOPS

```yaml
# GitHub Actions
jobs:
  deploy:
    steps:
      - name: Decrypt env
        env:
          SOPS_AGE_KEY: ${{ secrets.SOPS_AGE_KEY }}
        run: sops --decrypt .env.enc > .env
```

เก็บ `SOPS_AGE_KEY` (private key content) ไว้ใน **GitHub Secrets**

## Key Rotation

เมื่อต้องเปลี่ยน key (เช่น คนออกจากทีม):

```bash
# 1. สร้าง key ใหม่
age-keygen -o new-keys.txt

# 2. อัปเดต .sops.yaml ด้วย public key ใหม่
#    ลบ public key ของคนที่ออก

# 3. Re-encrypt ทุกไฟล์
sops updatekeys .env.enc

# 4. ส่ง key ใหม่ให้ทีม
```
