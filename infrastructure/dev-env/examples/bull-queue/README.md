# Bull Queue Example

ตัวอย่าง Redis + BullMQ queue system: API → Queue → Worker + Bull Board UI

## Architecture

```
                                    ┌─────────────────────┐
                                    │      Redis           │
                                    │  (queue storage)     │
                                    └──┬──────┬──────┬────┘
                                       │      │      │
               ┌───────────────────────┼──────┼──────┘
               │                       │      │
               ▼                       ▼      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   API (:3000)     │  │  Worker(s)       │  │  Bull Board UI   │
│                   │  │                  │  │  (:3000)         │
│ POST /api/email   │  │  email worker    │  │                  │
│ POST /api/report  │  │  report worker   │  │  ดูสถานะ queue    │
│ POST /api/image   │  │  image worker    │  │  retry/delete job│
│ GET  /api/job/:id │  │                  │  │  real-time stats │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        │                     │                      │
   CF Tunnel             (internal)             CF Tunnel
        │                                           │
        ▼                                           ▼
 api.dev.example.com                      queue.dev.example.com
```

## Services

| Service | หน้าที่ |
|---------|--------|
| **api** | รับ request → สร้าง job ส่งเข้า queue |
| **worker** | หยิบ job จาก queue มาประมวลผล (scale ได้) |
| **redis** | เก็บ queue data (`appendonly` ไม่หายเมื่อ restart) |
| **bull-board** | Web UI ดูสถานะ queue, retry/delete job |

## ตัวอย่าง Queue 3 แบบ

| Queue | ลักษณะงาน | Retry | Priority |
|-------|----------|-------|----------|
| **email** | ส่ง email — เร็ว (~1s) | 3 ครั้ง, exponential backoff | ปกติ |
| **report** | สร้าง report — นาน (~10s), มี progress | 2 ครั้ง, fixed delay | ปกติ |
| **image-resize** | Resize รูป — กลาง (~1.5s), หลาย size | 3 ครั้ง | สูง |

## โครงสร้าง

```
bull-queue/
├── docker-compose.yml
├── docker-compose.prd.yml      # worker replicas: 3
├── .env.example
├── .gitignore
├── api/
│   ├── Dockerfile
│   ├── package.json
│   └── src/index.js            # Express + BullMQ producer
├── worker/
│   ├── Dockerfile
│   ├── package.json
│   └── src/index.js            # BullMQ consumer (3 queues)
└── bull-board/
    ├── Dockerfile
    ├── package.json
    └── src/index.js            # Bull Board Web UI
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF Tunnel tokens ใน .env

# 3. รัน
docker compose up -d

# 4. เข้าใช้งาน
#    API:        https://api.dev.example.com
#    Bull Board: https://queue.dev.example.com
```

## CF Dashboard Setup

สร้าง **2 Tunnels**:

| Tunnel | Public Hostname | Service |
|--------|----------------|---------|
| `bull-api-dev` | `api.dev.example.com` | `http://api:3000` |
| `bull-board-dev` | `queue.dev.example.com` | `http://bull-board:3000` |

## ทดสอบ API

```bash
API=https://api.dev.example.com

# ส่ง email
curl -X POST $API/api/email \
  -H "Content-Type: application/json" \
  -d '{"to":"user@example.com","subject":"Hello","body":"World"}'
# → {"jobId":"1","queue":"email"}

# สร้าง report (มี progress)
curl -X POST $API/api/report \
  -H "Content-Type: application/json" \
  -d '{"type":"sales","params":{"month":"2026-03"}}'
# → {"jobId":"1","queue":"report"}

# Resize image
curl -X POST $API/api/image-resize \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/photo.jpg","sizes":[200,400,800]}'
# → {"jobId":"1","queue":"image-resize"}

# ดูสถานะ job
curl $API/api/job/email/1
# → {"id":"1","state":"completed","data":{...},"result":{"sent":true}}

# ดูสรุปทุก queue
curl $API/api/queues
# → {"email":{"waiting":0,"active":0,"completed":5,"failed":0},...}
```

## Scale Worker

PRD override เพิ่ม worker replicas + concurrency:

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
# worker จะรัน 3 replicas × concurrency 10 = 30 jobs พร้อมกัน
```

scale เพิ่มเฉพาะ worker:
```bash
docker compose up -d --scale worker=5
# 5 replicas × concurrency 5 = 25 jobs พร้อมกัน
```

## Redis Config

| Setting | Dev | PRD | ทำไม |
|---------|-----|-----|------|
| `maxmemory` | 256mb | 1gb | PRD มี job เยอะกว่า |
| `maxmemory-policy` | noeviction | noeviction | **ห้าม evict** — queue data ต้องไม่หาย |
| `appendonly` | yes | yes | persist data ลง disk |
| `appendfsync` | everysec (default) | everysec | flush ทุก 1 วินาที |

> **สำคัญ**: ใช้ `noeviction` เสมอ — ถ้าใช้ `allkeys-lru` job อาจหายเมื่อ memory เต็ม

## เพิ่ม Queue ใหม่

1. **api** — เพิ่ม `new Queue("my-queue", ...)` + endpoint
2. **worker** — เพิ่ม `new Worker("my-queue", async (job) => { ... })`
3. **bull-board** — เพิ่ม `new BullMQAdapter(myQueue)` ใน queues array

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```
