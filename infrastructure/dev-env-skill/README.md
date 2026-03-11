# Dev Environment System Design

ระบบการออกแบบ Development Environment สำหรับทีม

| เนื้อหา | รายละเอียด |
|---------|-----------|
| [1. Local Dev Architecture](./01-local-dev.md) | 1 Container / 1 งาน / 1 Repo / 1 DNS (CF Tunnel) |
| [2. Local to Production Sync](./02-local-to-prd.md) | Sync local ไป PRD ไม่ต้องปรับอะไร |
| [3. Environment Separation](./03-env-separation.md) | แยก Dev / Test / PRD สำหรับหลายทีม |
| [4. Secret Management](./04-secret-management.md) | จัดการ .env อย่างปลอดภัยด้วย SOPS + age |
| [5. Overall Structure](./05-overall-structure.md) | โครงสร้างทั้งระบบ + Quick Start |

## Examples — ตัวอย่างพร้อมใช้

| ตัวอย่าง | รายละเอียด |
|---------|-----------|
| [basic](./examples/basic/) | Node.js + PostgreSQL + CF Tunnel — template สำหรับ service ทั่วไป |
| [odoo](./examples/odoo/) | Odoo ERP + PostgreSQL + CF Tunnel — พร้อม custom addons + backup guide |
| [pwa](./examples/pwa/) | PWA (Vite + Nginx) + CF Tunnel — multi-stage build, SPA routing, HTTPS auto |
| [fullstack](./examples/fullstack/) | PWA + API + PostgreSQL + Redis + 2 CF Tunnels — ตัวอย่าง multi-service |
| [n8n](./examples/n8n/) | n8n Workflow Automation + PostgreSQL + CF Tunnel — พร้อม webhook + queue mode (prd) |
| [wordpress](./examples/wordpress/) | WordPress + MariaDB + Redis Object Cache + CF Tunnel — พร้อม custom plugins/themes |
| [minio](./examples/minio/) | MinIO S3-compatible Object Storage + CF Tunnel — พร้อม SDK examples (Node.js, Python) |
| [resilio-sync](./examples/resilio-sync/) | Resilio Sync P2P file sync + CF Tunnel — sync data ข้ามเครื่องอัตโนมัติ |
| [nextcloud](./examples/nextcloud/) | Nextcloud NAS เต็มรูปแบบ + PG + Redis + CF Tunnel — file sync, WebDAV, external storage |
| [filebrowser](./examples/filebrowser/) | FileBrowser NAS เบาๆ + CF Tunnel — web file manager น้ำหนักเบา ~15MB RAM |
| [bull-queue](./examples/bull-queue/) | Redis + BullMQ + Bull Board UI — API → Queue → Worker พร้อม scale + source code |
| [temporal](./examples/temporal/) | Temporal durable workflow — code-first, retry, long-running + Node.js source code |
| [airflow](./examples/airflow/) | Apache Airflow DAG scheduling — ETL pipeline, parallel tasks + Python DAG examples |
| [rag](./examples/rag/) | Custom RAG: Qdrant + Ollama/OpenAI + Node.js API — code-first, full source code |
| [dify](./examples/dify/) | Dify AI Platform: low-code RAG, Agent, Workflow — ต่อ LLM ทุกเจ้าผ่าน UI |
| [keycloak](./examples/keycloak/) | Keycloak SSO/IAM — OIDC, OAuth2, Social Login + เชื่อม Odoo/Nextcloud/n8n |
| [ecosystem](./examples/ecosystem/) | Odoo + WordPress + IoT (EMQX + Node-RED) + n8n — รวมทั้งองค์กร 5 tunnels |
