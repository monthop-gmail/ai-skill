# Dev Environment System Design

ระบบการออกแบบ Development Environment สำหรับทีม

| เนื้อหา | รายละเอียด |
|---------|-----------|
| [1. Local Dev Architecture](./01-local-dev.md) | 1 Container / 1 งาน / 1 Repo / 1 DNS (CF Tunnel) |
| [2. Local to Production Sync](./02-local-to-prd.md) | Sync local ไป PRD ไม่ต้องปรับอะไร |
| [3. Environment Separation](./03-env-separation.md) | แยก Dev / Test / PRD สำหรับหลายทีม |
| [4. Secret Management](./04-secret-management.md) | จัดการ .env อย่างปลอดภัยด้วย SOPS + age |
| [5. Overall Structure](./05-overall-structure.md) | โครงสร้างทั้งระบบ + Quick Start |
| [Checklist](./CHECKLIST.md) | รวม checklist จาก 01-05 สำหรับ audit |

## Examples — ตัวอย่างพร้อมใช้

> ทุก template มี `docker-compose.yml` + `.env.example` + CF Tunnel + README
> template ที่มี `-modular` ใช้ Docker Compose `include` (v2.20+) แยกไฟล์ต่อ service

### Ecosystem — รวมหลาย service ทำงานร่วมกัน

| ตัวอย่าง | รายละเอียด |
|---------|-----------|
| [pulse](./examples/pulse/) | Odoo ERP + WordPress + EMQX IoT + Node-RED + n8n + Redis — ชีพจรองค์กร 5 tunnels |
| [pulse-modular](./examples/pulse-modular/) | เหมือน pulse — เวอร์ชัน modular (compose include) |
| [nexus](./examples/nexus/) | Odoo ERP + ThingsBoard IoT + Keycloak SSO + MinIO S3 + NAS — ระบบรวมศูนย์ 6 tunnels |
| [nexus-modular](./examples/nexus-modular/) | เหมือน nexus — เวอร์ชัน modular (compose include) |

### Application — service เดี่ยวพร้อมใช้

| ตัวอย่าง | รายละเอียด |
|---------|-----------|
| [basic](./examples/basic/) | Node.js + PostgreSQL + CF Tunnel — template สำหรับ service ทั่วไป |
| [fullstack](./examples/fullstack/) | PWA + API + PostgreSQL + Redis + 2 CF Tunnels — ตัวอย่าง multi-service |
| [pwa](./examples/pwa/) | PWA (Vite + Nginx) + CF Tunnel — multi-stage build, SPA routing, HTTPS auto |
| [odoo](./examples/odoo/) | Odoo ERP + PostgreSQL + CF Tunnel — พร้อม custom addons + backup guide |
| [wordpress](./examples/wordpress/) | WordPress + MariaDB + Redis Object Cache + CF Tunnel — พร้อม custom plugins/themes |
| [keycloak](./examples/keycloak/) | Keycloak SSO/IAM — OIDC, OAuth2, Social Login + เชื่อม Odoo/Nextcloud/n8n |

### Infrastructure & Storage — จัดเก็บข้อมูลและ file sync

| ตัวอย่าง | รายละเอียด |
|---------|-----------|
| [minio](./examples/minio/) | MinIO S3-compatible Object Storage + CF Tunnel — พร้อม SDK examples (Node.js, Python) |
| [nextcloud](./examples/nextcloud/) | Nextcloud NAS เต็มรูปแบบ + PG + Redis + CF Tunnel — file sync, WebDAV, external storage |
| [filebrowser](./examples/filebrowser/) | FileBrowser NAS เบาๆ + CF Tunnel — web file manager น้ำหนักเบา ~15MB RAM |
| [resilio-sync](./examples/resilio-sync/) | Resilio Sync P2P file sync + CF Tunnel — sync data ข้ามเครื่องอัตโนมัติ |

### Workflow & Queue — ระบบ automation และ job queue

| ตัวอย่าง | รายละเอียด |
|---------|-----------|
| [n8n](./examples/n8n/) | n8n Workflow Automation + PostgreSQL + CF Tunnel — พร้อม webhook + queue mode (prd) |
| [airflow](./examples/airflow/) | Apache Airflow DAG scheduling — ETL pipeline, parallel tasks + Python DAG examples |
| [temporal](./examples/temporal/) | Temporal durable workflow — code-first, retry, long-running + Node.js source code |
| [inngest](./examples/inngest/) | Inngest durable workflow ง่ายๆ — step, sleep, cron, fan-out + Node.js source code |
| [bull-queue](./examples/bull-queue/) | Redis + BullMQ + Bull Board UI — API → Queue → Worker พร้อม scale + source code |

### AI/ML — ระบบ AI และ RAG

| ตัวอย่าง | รายละเอียด |
|---------|-----------|
| [rag](./examples/rag/) | Custom RAG: Qdrant + Ollama/OpenAI + Node.js API — code-first, full source code |
| [dify](./examples/dify/) | Dify AI Platform: low-code RAG, Agent, Workflow — ต่อ LLM ทุกเจ้าผ่าน UI |
