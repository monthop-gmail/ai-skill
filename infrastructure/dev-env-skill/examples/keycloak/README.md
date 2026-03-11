# Keycloak Example

ตัวอย่าง Keycloak (Identity & Access Management) + PostgreSQL + CF Tunnel

## Architecture

```
                CF Tunnel
                    │
                    ▼
Internet ──► Keycloak (:8080) ──► PostgreSQL
                    │
                    ├── OpenID Connect (OIDC)
                    ├── OAuth 2.0
                    ├── SAML 2.0
                    └── LDAP / Active Directory
```

## Features

- **SSO (Single Sign-On)** — login ครั้งเดียว ใช้ได้ทุก service
- **OIDC / OAuth 2.0** — มาตรฐาน authentication
- **Social Login** — Google, GitHub, Facebook, LINE
- **User Management** — สร้าง user, group, role ผ่าน Admin UI
- **2FA / MFA** — TOTP, WebAuthn
- **LDAP/AD** — เชื่อมกับ Active Directory ที่มีอยู่
- **Themes** — ปรับหน้า login ได้

## โครงสร้าง

```
keycloak/
├── docker-compose.yml      # keycloak + db + tunnel
├── docker-compose.prd.yml  # override สำหรับ prd
├── .env.example
└── .gitignore
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF_TUNNEL_TOKEN + แก้ KC_ADMIN_PASS ใน .env

# 3. รัน
docker compose up -d

# 4. เข้า Admin Console
#    https://auth.dev.example.com
#    login: admin / (password ที่ตั้ง)
```

## CF Dashboard Setup

1. **Zero Trust → Networks → Tunnels** → Create Tunnel
2. ตั้งชื่อ เช่น `keycloak-dev` → Copy Token
3. Add Public Hostname:
   - Subdomain: `auth` / Domain: `dev.example.com`
   - Service: `http://keycloak:8080`
4. ใส่ Token ใน `.env`

## ตั้งค่า Realm + Client

### 1. สร้าง Realm

1. Admin Console → Create Realm
2. ตั้งชื่อ เช่น `my-company`

### 2. สร้าง Client (สำหรับ app ที่จะเชื่อม)

1. Realm → Clients → Create Client
2. Client type: **OpenID Connect**
3. Client ID: เช่น `my-web-app`
4. ตั้งค่า:
   - Valid redirect URIs: `https://web.dev.example.com/*`
   - Web origins: `https://web.dev.example.com`
5. Copy **Client Secret** (tab Credentials)

### 3. สร้าง User

1. Realm → Users → Create User
2. กรอก username, email
3. Credentials → Set Password

## เชื่อม Service อื่น

### Node.js (Express + OIDC)

```javascript
const { Issuer, Strategy } = require("openid-client");
const passport = require("passport");

const keycloakIssuer = await Issuer.discover(
  "https://auth.dev.example.com/realms/my-company"
);

const client = new keycloakIssuer.Client({
  client_id: "my-web-app",
  client_secret: "your-client-secret",
  redirect_uris: ["https://web.dev.example.com/callback"],
  response_types: ["code"],
});

passport.use("oidc", new Strategy({ client }, (tokenSet, userinfo, done) => {
  return done(null, userinfo);
}));
```

### Odoo

Settings → OAuth Providers → Create:
- Provider name: `Keycloak`
- Auth URL: `https://auth.dev.example.com/realms/my-company/protocol/openid-connect/auth`
- Token URL: `https://auth.dev.example.com/realms/my-company/protocol/openid-connect/token`
- Client ID: `odoo`

### Nextcloud

Settings → SSO & SAML → OpenID Connect:
- Identifier: `https://auth.dev.example.com/realms/my-company`
- Client ID: `nextcloud`
- Client Secret: `xxx`

### n8n

```bash
# .env
N8N_AUTH_TYPE=oidc
N8N_OIDC_ISSUER=https://auth.dev.example.com/realms/my-company
N8N_OIDC_CLIENT_ID=n8n
N8N_OIDC_CLIENT_SECRET=xxx
```

### Dify

Settings → SSO → OIDC:
- Issuer: `https://auth.dev.example.com/realms/my-company`
- Client ID / Secret

## SSO Flow ทั้งระบบ

```
User เข้า web.dev.example.com
    │
    ▼ redirect
auth.dev.example.com/realms/my-company/login
    │
    ▼ login สำเร็จ (session cookie)
redirect back → web.dev.example.com (+ token)
    │
    │ ต่อมาเข้า erp.dev.example.com
    │
    ▼ redirect to Keycloak
auth.dev.example.com → เห็น session → skip login
    │
    ▼ redirect back ทันที (ไม่ต้อง login ซ้ำ)
erp.dev.example.com (+ token)
```

## Social Login (Google, GitHub)

### Google

1. Google Cloud Console → OAuth 2.0 Client
2. Redirect URI: `https://auth.dev.example.com/realms/my-company/broker/google/endpoint`
3. Keycloak → Realm → Identity Providers → Google
4. ใส่ Client ID + Secret

### GitHub

1. GitHub → Settings → Developer → OAuth Apps
2. Callback URL: `https://auth.dev.example.com/realms/my-company/broker/github/endpoint`
3. Keycloak → Identity Providers → GitHub
4. ใส่ Client ID + Secret

## Export / Import Realm

```bash
# export realm config (backup)
docker compose exec keycloak \
  /opt/keycloak/bin/kc.sh export --dir /tmp/export --realm my-company

docker compose cp keycloak:/tmp/export ./realm-export

# import (restore)
docker compose cp ./realm-export keycloak:/tmp/import
docker compose exec keycloak \
  /opt/keycloak/bin/kc.sh import --dir /tmp/import
```

## Backup

```bash
# database
docker compose exec -T db pg_dump -U keycloak keycloak > backup.sql

# restore
docker compose exec -T db psql -U keycloak keycloak < backup.sql
```

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```
