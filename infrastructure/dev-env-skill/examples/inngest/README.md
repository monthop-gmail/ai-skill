# Inngest Example

ตัวอย่าง Inngest (Durable Workflow ง่ายๆ) + Dev Server + CF Tunnel

## Inngest vs Temporal vs Bull Queue

| | Inngest | Temporal | Bull Queue |
|--|---------|---------|-----------|
| **ความง่าย** | ง่ายมาก — แค่เขียน function | ซับซ้อน — ต้องตั้ง server + worker | กลาง |
| **Infrastructure** | Dev: 1 container / PRD: ใช้ Cloud | server + DB + worker | Redis + worker |
| **Durable** | ใช่ — sleep เป็นวัน/เดือนได้ | ใช่ | ไม่ (job อยู่ใน Redis) |
| **Cron** | built-in `{ cron: "0 6 * * *" }` | ผ่าน code | ต้องตั้ง cron แยก |
| **Fan-out** | `step.sendEvent()` | manual | manual |
| **Concurrency** | config ง่าย `{ limit: 10 }` | ผ่าน worker config | ผ่าน worker config |
| **Dev UI** | มี — ดู functions, events, logs | มี | Bull Board |
| **เหมาะกับ** | ทีมเล็ก-กลาง, ง่าย-เร็ว | ทีมใหญ่, ซับซ้อนมาก | background job ง่ายๆ |

## Architecture

```
                CF Tunnel                CF Tunnel
                    │                        │
                    ▼                        ▼
Internet ──► App (:3000)           Inngest Dev UI (:8288)
              │                          │
              ├── POST /api/order         │
              ├── POST /api/signup        │
              └── /api/inngest ◄──────────┘
                    │                 (poll functions)
                    ▼
              Inngest Server
              จัดการ: queue, retry,
              sleep, concurrency, cron
```

**Dev:** Inngest Dev Server รันเป็น container — self-contained
**PRD:** ใช้ Inngest Cloud (free tier มี) — ไม่ต้องรัน server เอง

## ตัวอย่าง Function 4 แบบ

### 1. Order Processing (step-by-step + retry)

```
event: "order/created"
  → process-payment (retry 3x)
  → update-inventory
  → send-confirmation
  → notify-team
```

### 2. Daily Report (cron schedule)

```
cron: "0 6 * * *"  (ทุกวัน 06:00 UTC)
  → fetch-data
  → send-report
```

### 3. User Onboarding (sleep days)

```
event: "user/signed-up"
  → welcome-email
  → sleep 1 day
  → tips-email
  → sleep 3 days
  → feedback-email
```

### 4. Batch Fan-out (parallel processing)

```
event: "batch/process"
  → fan-out → N × "batch/process-item" (concurrency: 5)
```

## โครงสร้าง

```
inngest/
├── docker-compose.yml
├── docker-compose.prd.yml       # PRD ใช้ Inngest Cloud
├── .env.example
├── .gitignore
└── app/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── index.js             # Express + API endpoints
        ├── inngest.js           # Inngest client
        └── functions.js         # Inngest functions (4 workflows)
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF Tunnel tokens ใน .env

# 3. รัน
docker compose up -d

# 4. เข้าใช้งาน
#    App:        https://app.dev.example.com
#    Inngest UI: https://inngest.dev.example.com
```

## CF Dashboard Setup

สร้าง **2 Tunnels**:

| Tunnel | Public Hostname | Service |
|--------|----------------|---------|
| `inngest-app-dev` | `app.dev.example.com` | `http://app:3000` |
| `inngest-ui-dev` | `inngest.dev.example.com` | `http://inngest-server:8288` |

## ทดสอบ

```bash
API=https://app.dev.example.com

# สร้าง order → trigger order workflow
curl -X POST $API/api/order \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-001",
    "email": "customer@example.com",
    "total": 1500,
    "items": [{"sku":"A","qty":2}]
  }'

# สมัครสมาชิก → trigger onboarding (sleep 1 day + 3 days)
curl -X POST $API/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","name":"John"}'

# Batch processing → fan-out
curl -X POST $API/api/batch \
  -H "Content-Type: application/json" \
  -d '{"items":["item-1","item-2","item-3","item-4","item-5"]}'
```

ดูผลลัพธ์ได้ที่ **Inngest Dev UI** → Functions / Events

## ทำไม Inngest ถึงง่าย?

```javascript
// Temporal — ต้องแยก activity, workflow, worker, client
// ไฟล์ 4+ ไฟล์, ตั้ง server แยก

// Inngest — แค่เขียน function เดียว
const myWorkflow = inngest.createFunction(
  { id: "my-workflow" },
  { event: "my/event" },
  async ({ event, step }) => {
    await step.run("step-1", async () => doSomething());
    await step.sleep("wait", "1 day");
    await step.run("step-2", async () => doMore());
  }
);

// แค่นี้จบ — Inngest จัดการ queue, retry, sleep, logging ให้หมด
```

## Dev → PRD

| | Dev | PRD |
|--|-----|-----|
| **Server** | Inngest Dev Server (container) | Inngest Cloud (managed) |
| **Keys** | `INNGEST_EVENT_KEY=local` | จาก https://inngest.com |
| **UI** | self-hosted `:8288` | https://app.inngest.com |
| **Cost** | ฟรี | Free tier: 5K runs/month |

```bash
# PRD: prd override ปิด dev server, ใช้ Inngest Cloud
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```
