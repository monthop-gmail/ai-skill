# MinIO Example

ตัวอย่าง MinIO Object Storage (S3-compatible) + CF Tunnel sidecar

## Architecture

```
Internet → CF Tunnel (api)     → MinIO S3 API     (:9000)
         → CF Tunnel (console) → MinIO Console UI  (:9001)
```

- **S3 API** — upload/download ไฟล์ผ่าน S3-compatible API
- **Console** — Web UI จัดการ bucket, user, policy

## โครงสร้าง

```
minio/
├── docker-compose.yml      # minio + init + 2 tunnels
├── docker-compose.prd.yml  # override สำหรับ prd
├── .env.example
└── .gitignore
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF_TUNNEL_TOKEN_API + CF_TUNNEL_TOKEN_CONSOLE ใน .env

# 3. รัน
docker compose up -d

# 4. เข้าใช้งาน
#    Console: https://minio-console.dev.example.com
#    S3 API:  https://s3.dev.example.com
```

## CF Dashboard Setup

สร้าง **2 Tunnels**:

| Tunnel | Public Hostname | Service |
|--------|----------------|---------|
| `minio-api-dev` | `s3.dev.example.com` | `http://minio:9000` |
| `minio-console-dev` | `minio-console.dev.example.com` | `http://minio:9001` |

## ใช้งาน S3 API

### mc (MinIO Client)

```bash
# ตั้ง alias
mc alias set mystore https://s3.dev.example.com admin changeme123

# upload
mc cp myfile.txt mystore/uploads/

# list
mc ls mystore/uploads/

# download
mc cp mystore/uploads/myfile.txt ./
```

### AWS SDK (Node.js)

```javascript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  endpoint: "https://s3.dev.example.com",
  region: "us-east-1",
  credentials: {
    accessKeyId: "admin",
    secretAccessKey: "changeme123",
  },
  forcePathStyle: true,
});

await s3.send(new PutObjectCommand({
  Bucket: "uploads",
  Key: "hello.txt",
  Body: "Hello from MinIO!",
}));
```

### Python (boto3)

```python
import boto3

s3 = boto3.client(
    "s3",
    endpoint_url="https://s3.dev.example.com",
    aws_access_key_id="admin",
    aws_secret_access_key="changeme123",
)

s3.upload_file("myfile.txt", "uploads", "myfile.txt")
```

## ใช้ร่วมกับ service อื่น

MinIO เป็น S3-compatible storage ที่ service อื่นเชื่อมต่อได้ง่าย:

| Service | ใช้ MinIO เก็บ |
|---------|---------------|
| **Odoo** | Attachments, Reports |
| **WordPress** | Media uploads (ผ่าน WP Offload Media plugin) |
| **n8n** | Workflow files, binary data |
| **Node-RED** | IoT data logs, images |

## Backup

```bash
# mirror ทั้ง bucket ลง local
mc mirror mystore/uploads ./backup-uploads

# หรือ sync ไป S3-compatible อื่น (เช่น Cloudflare R2)
mc mirror mystore/uploads r2store/uploads-backup
```

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```
