# RAG Example

ตัวอย่าง RAG (Retrieval-Augmented Generation): Qdrant + Ollama/OpenAI + Node.js API + CF Tunnel

## Architecture

```
                    ┌──────────────────────────────────────────┐
                    │              RAG Pipeline                 │
                    │                                          │
  Upload doc ──────►│ 1. Chunk text                            │
                    │ 2. Embed chunks → Qdrant (vector DB)     │
                    │                                          │
  Ask question ────►│ 1. Embed question                        │
                    │ 2. Search similar chunks ← Qdrant        │
                    │ 3. Send chunks + question → LLM          │
                    │ 4. Return answer with sources             │
                    └──────────────────────────────────────────┘

  ┌─────────┐     ┌─────────┐     ┌──────────────┐
  │ API     │────►│ Qdrant  │     │ Ollama       │
  │ (:3000) │     │ (vector)│     │ (local LLM)  │
  │         │────►│         │     │              │
  │         │─────────────────────►│              │
  └─────────┘     └─────────┘     └──────────────┘
       │               │
   CF Tunnel       CF Tunnel
       │               │
       ▼               ▼
 rag.dev.example  qdrant.dev.example
     .com              .com
```

## LLM Provider

| Provider | ข้อดี | ข้อเสีย |
|----------|------|--------|
| **Ollama** (default) | ฟรี, local, data ไม่ออก | ต้องมี RAM เยอะ (8GB+), ช้ากว่า |
| **OpenAI** | เร็ว, คุณภาพสูง | เสียเงิน, data ออกนอก |

เปลี่ยนใน `.env`:
```bash
LLM_PROVIDER=ollama   # หรือ openai
```

## โครงสร้าง

```
rag/
├── docker-compose.yml
├── docker-compose.prd.yml      # GPU support
├── .env.example
├── .gitignore
└── api/
    ├── Dockerfile
    ├── package.json
    └── src/
        └── index.js            # RAG API (ingest + ask + search)
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. ใส่ CF Tunnel tokens ใน .env

# 3. รัน (ครั้งแรกจะ pull Ollama models ~2-5GB)
docker compose up -d

# 4. รอ models พร้อม (ดู log)
docker compose logs -f ollama-init

# 5. เข้าใช้งาน
#    RAG API:         https://rag.dev.example.com
#    Qdrant Dashboard: https://qdrant.dev.example.com/dashboard
```

## API Endpoints

### 1. Ingest — อัปโหลดเอกสาร

```bash
API=https://rag.dev.example.com

# อัปโหลด PDF
curl -X POST $API/api/ingest \
  -F "file=@document.pdf"

# อัปโหลด text file
curl -X POST $API/api/ingest \
  -F "file=@notes.txt"

# ส่ง text ตรงๆ
curl -X POST $API/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"text":"Odoo is an open source ERP...","source":"wiki"}'
```

### 2. Ask — ถาม (RAG: search + LLM)

```bash
curl -X POST $API/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Odoo มี module อะไรบ้าง?","topK":5}'

# Response:
# {
#   "answer": "จากเอกสาร Odoo มี module หลักๆ ได้แก่...",
#   "sources": [
#     {"text":"Odoo modules include...", "source":"wiki", "score":0.89},
#     ...
#   ]
# }
```

### 3. Search — ค้นหา (vector similarity เฉยๆ ไม่ผ่าน LLM)

```bash
curl -X POST $API/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"ERP inventory","topK":3}'
```

## RAG Pipeline อธิบาย

### Ingest (เก็บเอกสาร)

```
Document → Extract text → Chunk (500 chars, 50 overlap)
                              │
                              ▼
                    Embed each chunk (Ollama/OpenAI)
                              │
                              ▼
                    Store vectors → Qdrant
```

### Ask (ถามคำถาม)

```
Question → Embed question → Search Qdrant (top 5 similar chunks)
                                │
                                ▼
                    Combine chunks as context
                                │
                                ▼
               "Answer based on context: {chunks}"
                    + "Question: {question}"
                                │
                                ▼
                         LLM → Answer
```

## Ollama Models

```bash
# ดู models ที่มี
docker compose exec ollama ollama list

# pull model เพิ่ม
docker compose exec ollama ollama pull mistral
docker compose exec ollama ollama pull phi3

# ใช้ model ใหม่ → แก้ .env
OLLAMA_MODEL=mistral
```

| Model | RAM | ความเร็ว | คุณภาพ |
|-------|-----|---------|--------|
| `llama3.2` (default) | ~4GB | กลาง | ดี |
| `mistral` | ~4GB | เร็ว | ดี |
| `phi3` | ~2GB | เร็วมาก | พอใช้ |
| `llama3.1:70b` | ~40GB | ช้า | ดีมาก |

## GPU Support (Production)

Uncomment ใน `docker-compose.prd.yml`:

```yaml
ollama:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

```bash
# ต้องติดตั้ง NVIDIA Container Toolkit ก่อน
# https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```
