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
