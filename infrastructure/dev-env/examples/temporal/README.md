# Temporal Example

ตัวอย่าง Temporal (Durable Workflow Engine) + PostgreSQL + Web UI + CF Tunnel

## Temporal vs n8n vs Bull Queue

| | Temporal | n8n | Bull Queue |
|--|---------|-----|-----------|
| **แนว** | Code-first | Low-code drag & drop | Simple job queue |
| **Durability** | workflow ไม่หายแม้ server ล่ม | จำ state ได้บางส่วน | job อยู่ใน Redis |
| **Long-running** | รันได้เป็นวัน/เดือน/ปี | เหมาะกับ short tasks | เหมาะกับ short tasks |
| **Parallel** | Promise.all ใน code | parallel node | manual |
| **Timer** | `sleep(30 days)` ใน code | schedule node | cron/delayed job |
| **เหมาะกับ** | Dev ทีม, business logic ซับซ้อน | ทีม non-dev, เชื่อม SaaS | background job ง่ายๆ |

## Architecture

```
                               ┌─────────────┐
                               │ Temporal     │
  Client/API ──── gRPC ──────►│ Server       │──── PostgreSQL
  (start workflow)             │ (:7233)      │
                               └──────┬──────┘
                                      │ dispatch
                                      ▼
                               ┌─────────────┐
                               │ Worker(s)    │
                               │              │
                               │ activities   │← ฟังก์ชันทำงานจริง
                               │ workflows    │← orchestration logic
                               └─────────────┘

  Temporal UI (:8080) ── ดูสถานะ workflow, history, replay
```

## ตัวอย่าง Workflow 3 แบบ

### 1. Order Processing (sequential + retry)

```
สั่งซื้อ → จ่ายเงิน → ตัดสต็อก → ส่ง email → แจ้ง Slack
             │
             └─ ถ้า fail → Temporal retry อัตโนมัติ 3 ครั้ง
                ถ้า server ล่มตรงนี้ → กลับมาทำต่อจากจุดที่ค้าง
```

### 2. Scheduled Report (long-running + timer)

```
สร้าง report → ส่ง email → sleep 24 ชม. → วนรอบใหม่
                                │
                                └─ Temporal จำ timer ได้แม้ restart
```

### 3. Onboarding (parallel + delayed follow-up)

```
สร้าง account → ┬─ ส่ง welcome email  ─┐
                 └─ แจ้ง Slack          ─┘→ sleep 3 วัน → ส่ง follow-up
```

## โครงสร้าง

```
temporal/
├── docker-compose.yml
├── docker-compose.prd.yml
├── .env.example
├── .gitignore
├── dynamicconfig/
│   └── development-sql.yaml
└── worker/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── index.js             # Worker startup
        ├── activities.js        # ฟังก์ชันทำงานจริง
        ├── workflows.js         # Workflow orchestration
        └── client-example.js    # ตัวอย่างเรียก workflow
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF Tunnel tokens ใน .env

# 3. รัน
docker compose up -d

# 4. เข้าใช้งาน
#    Temporal UI: https://temporal.dev.example.com
#    ทดสอบ:      docker compose exec worker node src/client-example.js
```

## CF Dashboard Setup

สร้าง **2 Tunnels**:

| Tunnel | Public Hostname | Service |
|--------|----------------|---------|
| `temporal-ui-dev` | `temporal.dev.example.com` | `http://temporal-ui:8080` |
| `temporal-api-dev` | `temporal-api.dev.example.com` | `tcp://temporal:7233` |

## ทำไม Temporal ถึง Durable?

```javascript
// workflow นี้ใช้เวลา 3 วัน แต่ไม่มีปัญหา
async function onboardingWorkflow(user) {
  await sendEmail(user.email, "Welcome!");

  // sleep 3 วัน — ถ้า server restart ระหว่างนี้
  // Temporal จำได้ว่า sleep เหลืออีกกี่วินาที แล้วกลับมาทำต่อ
  await sleep(3 * 24 * 60 * 60 * 1000);

  await sendEmail(user.email, "Follow up!");
}
```

Temporal เก็บ **event history** ทุก step ใน DB:
- Server ล่ม → restart → replay events → ทำต่อจากจุดที่ค้าง
- Activity fail → retry ตาม policy อัตโนมัติ
- ดู history ย้อนหลังได้ทุก step ใน Web UI

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
# worker 3 replicas สำหรับ high throughput
```
