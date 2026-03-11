# Dify Example

ตัวอย่าง Dify AI Platform (Low-code RAG, Agent, Workflow) + Qdrant + CF Tunnel

## Dify vs Custom RAG

| | Dify | Custom RAG (rag example) |
|--|------|------------------------|
| **แนว** | Low-code platform, UI drag & drop | Code-first, full control |
| **RAG** | built-in: upload, chunk, embed, search | เขียนเอง |
| **LLM** | ต่อได้ทุกเจ้าผ่าน UI | เขียน code เชื่อม |
| **Agent** | สร้างผ่าน UI + tools | เขียนเอง |
| **Workflow** | Visual workflow builder | ไม่มี (ใช้ Temporal/n8n) |
| **เหมาะกับ** | Prototype เร็ว, ทีมทั่วไป | Dev ทีม, custom pipeline |

## Architecture

```
                CF Tunnel (web)        CF Tunnel (api)
                     │                      │
                     ▼                      ▼
Internet ──► Dify Web (:3000)       Dify API (:5001)
              (Frontend)              │         │
                                      ▼         ▼
                                 PostgreSQL   Qdrant
                                              (vector DB)
                                      │
                                      ▼
                                    Redis
                                      │
                                      ▼
                                 Dify Worker
                               (background tasks)
```

## Features

- **Knowledge Base** — อัปโหลด PDF/TXT/MD → auto chunk + embed + RAG
- **Chat App** — สร้าง chatbot ต่อ LLM + knowledge base
- **Agent** — LLM + tools (web search, calculator, API call)
- **Workflow** — Visual workflow: LLM → condition → tools → output
- **API** — ทุก app ที่สร้างมี REST API พร้อมใช้
- **Multi-LLM** — ต่อ OpenAI, Claude, Ollama, Gemini, etc. ผ่าน UI

## โครงสร้าง

```
dify/
├── docker-compose.yml       # api + worker + web + db + redis + qdrant + 2 tunnels
├── docker-compose.prd.yml
├── .env.example
└── .gitignore
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF Tunnel tokens + แก้ SECRET_KEY ใน .env

# 3. รัน
docker compose up -d

# 4. เข้าใช้งาน
#    https://dify.dev.example.com
#    สร้าง admin account ตอน login ครั้งแรก
```

## CF Dashboard Setup

สร้าง **2 Tunnels**:

| Tunnel | Public Hostname | Service |
|--------|----------------|---------|
| `dify-web-dev` | `dify.dev.example.com` | `http://web:3000` |
| `dify-api-dev` | `dify-api.dev.example.com` | `http://api:5001` |

## ตั้งค่า LLM Provider

หลังจาก login แล้ว:

1. Settings → Model Provider
2. เพิ่ม LLM:
   - **OpenAI** — ใส่ API key
   - **Claude** — ใส่ API key
   - **Ollama** — URL: `http://ollama:11434` (ถ้ารัน Ollama ใน network เดียวกัน)

## สร้าง RAG Chatbot

1. **Knowledge → Create** → อัปโหลด PDF/docs
2. **Apps → Create → Chat App**
3. ตั้งค่า:
   - เลือก LLM model
   - เชื่อม Knowledge base
   - ตั้ง system prompt
4. **Publish** → ได้ API key + embed code

## ใช้ Dify API

```bash
API=https://dify-api.dev.example.com

# Chat (ใช้ API key จาก app ที่สร้าง)
curl -X POST $API/v1/chat-messages \
  -H "Authorization: Bearer app-xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {},
    "query": "Odoo มี module อะไรบ้าง?",
    "response_mode": "blocking",
    "user": "user-1"
  }'
```

## ใช้ร่วมกับ Ollama (Local LLM)

เพิ่ม Ollama ใน docker-compose:

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama

volumes:
  ollama_data:
```

แล้วใน Dify UI → Model Provider → Ollama:
- URL: `http://ollama:11434`
- Model: `llama3.2`

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```
