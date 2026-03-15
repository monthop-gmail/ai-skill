# คู่มือระบบ RAG กฎหมายไทย

คู่มือการสร้างระบบ RAG (Retrieval-Augmented Generation) สำหรับคำถามกฎหมายไทย โดยใช้ dataset จาก HuggingFace, ChromaDB และ Claude API — พร้อมผลเปรียบเทียบจาก NitiBench (EMNLP 2025)

---

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [Thai Legal Datasets บน HuggingFace](#thai-legal-datasets-บน-huggingface)
3. [ทำไม RAG ถึงชนะ Long-context LLM](#ทำไม-rag-ถึงชนะ-long-context-llm)
4. [RAG+Claude vs Fine-tuned Model](#ragclaude-vs-fine-tuned-model)
5. [Architecture ที่แนะนำ](#architecture-ที่แนะนำ)
6. [Chunking Strategy](#chunking-strategy-สำหรับกฎหมายไทย)
7. [วิธีใช้งานจริง](#วิธีใช้งานจริง)
8. [MCP Integration](#mcp-integration)
9. [Cost Estimate](#cost-estimate)
10. [Evaluation วิธีวัดผล](#evaluation-วิธีวัดผล-rag)

---

## ภาพรวมระบบ

```
┌───────────────────────────────────────────────────┐
│                      User                         │
└───────────────────────┬───────────────────────────┘
                        ↓
┌───────────────────────────────────────────────────┐
│                 Bot (Your Code)                   │
│                                                   │
│  1. รับคำถามจาก user                              │
│  2. Query Vector DB → หา chunk ที่เกี่ยวกับคำถาม  │
│  3. ส่ง prompt ให้ Claude + context               │
│  4. ได้คำตอบจาก Claude → ตอบ user                 │
└──────────┬────────────────────────┬───────────────┘
           ↓                        ↓
┌─────────────────────┐  ┌─────────────────────────┐
│   Vector DB         │  │   Claude API            │
│   (ChromaDB/        │  │   (Anthropic)           │
│    Pinecone)        │  │   - ตอบคำถาม            │
│   - เก็บ chunk      │  │   - อ้างอิงมาตรา        │
│   - semantic search │  │                         │
└────────┬────────────┘  └─────────────────────────┘
         ↑
         │
┌────────┴──────────────────────────────────────────┐
│  Data Source: HuggingFace Datasets                │
│  - airesearch/WangchanX-Legal-ThaiCCL-RAG         │
│  - VISAI-AI/nitibench                             │
└───────────────────────────────────────────────────┘
```

---

## Thai Legal Datasets บน HuggingFace

### 📚 Dataset ที่พร้อมใช้

| Dataset | Organization | Rows | รายละเอียด |
|---------|-------------|------|-----------|
| **[VISAI-AI/nitibench](https://huggingface.co/datasets/VISAI-AI/nitibench)** | VISAI AI | 3,780 | Benchmark Thai Legal QA (CCL + Tax) |
| **[airesearch/WangchanX-Legal-ThaiCCL-RAG](https://huggingface.co/datasets/airesearch/WangchanX-Legal-ThaiCCL-RAG)** | VISTEC-depa | 12,000 | RAG dataset for Corporate & Commercial Law |
| **[airesearch/WangchanX-Legal-ThaiCCL-Retriever](https://huggingface.co/datasets/airesearch/WangchanX-Legal-ThaiCCL-Retriever)** | VISTEC-depa | - | Retrieval-focused dataset |

### 📖 โครงสร้าง Dataset

**VISAI-AI/nitibench:**
```json
{
  "question": "ถ้ามีคนประกอบกิจการในลักษณะเป็นศูนย์ซื้อขายสัญญาซื้อขายล่วงหน้าโดยไม่ได้รับใบอนุญาตต้องระวางโทษอย่างไร",
  "answer": "ต้องระวางโทษจำคุกไม่เกินสามปี หรือปรับไม่เกินสามแสนบาท หรือทั้งจำทั้งปรับ...",
  "relevant_laws": [
    {
      "law_name": "พระราชบัญญัติสัญญาซื้อขายล่วงหน้า พ.ศ. 2546",
      "section_content": "มาตรา 132 ผู้ใดประกอบกิจการ..."
    }
  ],
  "reference_answer": "...",
  "reference_laws": [...]
}
```

**WangchanX-Legal-ThaiCCL-RAG:**
```json
{
  "question": "...",
  "positive_contexts": ["มาตรา 132...", "มาตรา 133..."],
  "hard_negative_contexts": ["มาตรา 100...", "มาตรา 101..."],
  "positive_answer": "...",
  "hard_negative_answer": "..."
}
```

### 📄 กฎหมายที่ครอบคลุม

- พระราชบัญญัติสัญญาซื้อขายล่วงหน้า พ.ศ. 2546
- ประมวลกฎหมายแพ่งและพาณิชย์
- พระราชบัญญัติการบัญชี พ.ศ. 2543
- ประมวลรัษฎากร (ภาษี)
- พระราชบัญญัติธุรกิจสถาบันการเงิน พ.ศ. 2551
- พระราชบัญญัติหลักประกันทางธุรกิจ พ.ศ. 2558

**License:** MIT — ใช้เชิงพาณิชย์ได้ ✅

---

## ทำไม RAG ถึงชนะ Long-context LLM

### 📊 ผลการทดลองจาก NitiBench (EMNLP 2025)

| Approach | NitiBench-CCL | NitiBench-Tax |
|----------|---------------|---------------|
| **RAG (Claude 3.5 + section-based chunking)** | **~65%** 🏆 | **~45%** 🏆 |
| Long-context Claude 3.5 (16K) | ~55% | ~35% |
| Long-context GPT-4 Turbo | ~55% | ~35% |
| RAG (Golden Context) | ~85% | ~70% |

> 📌 ผลลัพธ์ข้างต้นมาจาก paper NitiBench (2025) ซึ่งใช้ Claude 3.5 Sonnet — ปัจจุบัน Claude Sonnet 4.5/4.6 มี reasoning ที่ดีขึ้น คาดว่าจะได้ผลลัพธ์ที่ดีกว่านี้

### 🎯 สาเหตุที่ RAG ชนะ

1. **Needle in a Haystack Problem**
   - เอกสาร 100K tokens → LLM หาข้อมูลไม่เจอ
   - RAG เจาะจง chunk ที่เกี่ยวข้องได้เลย

2. **Section-based Chunking**
   - แยกตาม "มาตรา" → แต่ละ chunk = 1 มาตราสมบูรณ์
   - Retrieval accuracy สูงขึ้น 15-20%

3. **Attention Dilution**
   - Context ยาวมาก → Attention กระจาย
   - RAG ส่งแค่ chunk ที่เกี่ยวข้อง → โฟกัสดีกว่า

### 💡 บทเรียนจาก Paper

| ควรทำ ✅ | ไม่ควรทำ ❌ |
|---------|-----------|
| Section-based chunking (แยกตามมาตรา) | Chunk แบบสุ่ม (ทุก 500 tokens) |
| ใช้ RAG กับ context สั้นๆ | ยัดเอกสารทั้งหมดให้ LLM |
| ใช้ cross-referencing | ค้นหาแบบคำตรงๆ เท่านั้น |
| ใช้หลาย retrievers | ใช้ retriever เดียว |

---

## RAG+Claude vs Fine-tuned Model

### 📊 ตารางเปรียบเทียบ (NitiBench-CCL)

| Approach | Citation F1 | Coverage | Consistency | Joint Score |
|----------|-------------|----------|-------------|-------------|
| **Claude 3.5 Sonnet (RAG)** | 0.595 | 0.897 | 0.960 | **0.817** 🏆 |
| **GPT-4o (RAG)** | 0.714 | 0.852 | 0.945 | **0.837** 🏆 |
| **Fine-tuned 7B (GRPO)** | 0.719 | 0.773 | 0.875 | 0.777 |
| Fine-tuned 7B (SFT) | 0.561 | 0.593 | 0.837 | 0.663 |
| Base Qwen2.5-7B | 0.410 | 0.590 | 0.840 | 0.613 |

> 📌 ผลลัพธ์ข้างต้นมาจาก paper NitiBench (2025) ซึ่งใช้ Claude 3.5 Sonnet — ปัจจุบัน Claude Sonnet 4.5/4.6 มี reasoning ที่ดีขึ้น คาดว่าจะได้ผลลัพธ์ที่ดีกว่านี้

### 📉 ปัญหาของ Fine-tuned Model

**Out-of-Domain ตกหนัก (NitiBench-Tax):**

| Model | Joint Score |
|-------|-------------|
| **Claude 3.5 Sonnet (RAG)** | **0.509** 🏆 |
| GPT-4o (RAG) | 0.493 |
| Fine-tuned 7B (GRPO) | 0.378 (-51%) ❌ |
| Fine-tuned 7B (SFT) | 0.337 (-43%) ❌ |

### 📋 สรุปเปรียบเทียบ

| มิติ | Dataset+RAG+Claude | Fine-tuned Legal Model |
|------|-------------------|----------------------|
| **Accuracy (In-domain)** | 🏆 สูงสุด (0.817-0.837) | สูง (0.777) |
| **Accuracy (Out-of-domain)** | 🏆 ดี (0.509) | ตกหนัก (0.378) |
| **Hallucination** | 🏆 ต่ำมาก | ยังมีการมั่ว |
| **Maintenance** | 🏆 อัปเดต dataset ง่าย | ต้อง train ใหม่ |
| **Cost** | จ่ายตามใช้ (ถูกกว่า) | ต้องเช่า GPU + maintain |
| **Time to Deploy** | 🏆 1-2 สัปดาห์ | 1-2 เดือน |
| **ภาษาไทย** | 🏆 Claude เก่งมาก | ขึ้นกับ base model |
| **Auditability** | 🏆 อ้างอิงมาตราชัดเจน | บางครั้งไม่อ้างอิง |

---

## Architecture ที่แนะนำ

### 🏗️ Hybrid RAG Architecture

```
┌─────────────────────────────────────────────────────┐
│              User ถามคำถามกฎหมาย                     │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│    1. RAG Search (Pinecone/Chroma)                  │
│       - หา chunk ที่เกี่ยวข้อง 3-5 มาตรา             │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│    2. Claude 3.5 Sonnet + RAG Context               │
│       - ส่งคำถาม + มาตราที่เกี่ยวข้อง               │
│       - Claude ตอบพร้อมอ้างอิง                      │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│    3. (Optional) Fine-tuned 7B Verify               │
│       - ใช้ model เล็กตรวจสอบ citation              │
│       - แจ้งเตือนถ้า Claude อ้างอิงผิด              │
└─────────────────────────────────────────────────────┘
```

### ✅ ข้อดี

- **ถูกต้องกว่า** — RAG ช่วยเจาะจงข้อมูล
- **Generalize ดีกว่า** — Claude reasoning เก่ง
- **ถูกกว่า** — ไม่ต้องเช่า GPU
- **Deploy เร็วกว่า** — 1-2 สัปดาห์เสร็จ

---

## Chunking Strategy สำหรับกฎหมายไทย

### 🔪 Section-based Chunking (แนะนำ)

แยก chunk ตาม "มาตรา" แทนการ chunk แบบสุ่มทุก N tokens — ให้ผลดีกว่า 15-20% ตาม paper NitiBench

```python
# file: chunking.py
import re

def chunk_by_section(legal_text: str) -> list[dict]:
    """แยกเอกสารกฎหมายเป็น chunk ตามมาตรา"""
    # Pattern: "มาตรา 123" หรือ "มาตรา ๑๒๓"
    pattern = r'(มาตรา\s+[0-9๐-๙]+)'
    parts = re.split(pattern, legal_text)

    chunks = []
    current_section = None
    current_text = ""

    for part in parts:
        if re.match(pattern, part):
            # บันทึก chunk ก่อนหน้า
            if current_section:
                chunks.append({
                    "section": current_section,
                    "text": current_section + " " + current_text.strip()
                })
            current_section = part
            current_text = ""
        else:
            current_text += part

    # chunk สุดท้าย
    if current_section:
        chunks.append({
            "section": current_section,
            "text": current_section + " " + current_text.strip()
        })

    return chunks

# ตัวอย่างการใช้
legal_doc = """
มาตรา 132 ผู้ใดประกอบกิจการในลักษณะเป็นศูนย์ซื้อขายสัญญาซื้อขายล่วงหน้า
โดยมิได้รับใบอนุญาต ต้องระวางโทษจำคุกไม่เกินสามปี หรือปรับไม่เกินสามแสนบาท
มาตรา 133 ผู้ใดประกอบธุรกิจสัญญาซื้อขายล่วงหน้าโดยมิได้รับใบอนุญาต
ต้องระวางโทษจำคุกไม่เกินสองปี หรือปรับไม่เกินสองแสนบาท
"""

chunks = chunk_by_section(legal_doc)
for c in chunks:
    print(f"{c['section']}: {c['text'][:80]}...")
```

### ⚖️ เปรียบเทียบ Chunking Methods

| วิธี | Retrieval Accuracy | เหมาะกับ |
|------|-------------------|----------|
| **Section-based** (แยกตามมาตรา) | สูงสุด (+15-20%) | กฎหมาย, ระเบียบ |
| Fixed-size (ทุก 500 tokens) | ปานกลาง | เอกสารทั่วไป |
| Sentence-based | ต่ำ | ไม่แนะนำสำหรับกฎหมาย |
| Recursive (LangChain) | ปานกลาง-สูง | เอกสารที่ไม่มีโครงสร้างชัด |

---

## วิธีใช้งานจริง

### 📦 สิ่งที่ต้องติดตั้ง

```bash
# ติดตั้ง dependencies
pip install datasets chromadb sentence-transformers mcp

# หรือ
pip install -r requirements.txt
```

### 1️⃣ Download Dataset จาก HuggingFace

```python
# file: ingest-legal.py
from datasets import load_dataset
import chromadb
from sentence_transformers import SentenceTransformer

# โหลด dataset กฎหมายไทย
dataset = load_dataset("airesearch/WangchanX-Legal-ThaiCCL-RAG", split="train")

# สร้าง embedding model (รองรับภาษาไทย)
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# สร้าง ChromaDB
client = chromadb.PersistentClient(path="./thai-legal-db")
collection = client.get_or_create_collection("thai-legal")

# แปลงเป็น documents
documents = []
for row in dataset:
    documents.append({
        "id": row["question"][:50],
        "text": row["question"] + " " + row["positive_answer"],
        "laws": str(row["positive_contexts"])
    })

# Batch insert (ทีละ 100 records — เร็วกว่า insert ทีละตัว ~50x)
BATCH_SIZE = 100
for i in range(0, len(documents), BATCH_SIZE):
    batch = documents[i:i + BATCH_SIZE]
    texts = [doc["text"] for doc in batch]
    embeddings = model.encode(texts).tolist()

    collection.add(
        ids=[f"doc_{i + j}" for j in range(len(batch))],
        embeddings=embeddings,
        documents=texts,
        metadatas=[{"laws": doc["laws"]} for doc in batch]
    )
    print(f"Processed {min(i + BATCH_SIZE, len(documents))}/{len(documents)}")

print(f"เสร็จสิ้น: {len(documents)} documents")
```

> 💡 **ทางเลือก Embedding Model สำหรับภาษาไทย:**
>
> | Model | Dimension | ข้อดี | ข้อเสีย |
> |-------|-----------|-------|---------|
> | `paraphrase-multilingual-MiniLM-L12-v2` | 384 | เร็ว, ใช้ RAM น้อย | accuracy ปานกลาง |
> | `intfloat/multilingual-e5-large` | 1024 | accuracy สูง, รองรับ 100+ ภาษา | ช้ากว่า, ใช้ RAM มากกว่า |
> | `BAAI/bge-m3` | 1024 | รองรับ dense + sparse + colbert | ขนาดใหญ่ (~2GB) |
>
> แนะนำ: เริ่มจาก `MiniLM` ก่อน ถ้าต้องการ accuracy มากขึ้นค่อยเปลี่ยนเป็น `e5-large` หรือ `bge-m3`

### 2️⃣ สร้าง MCP Server สำหรับ RAG

```python
# file: legal-rag-mcp.py
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import chromadb
from sentence_transformers import SentenceTransformer

server = Server("thai-legal-rag")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
client = chromadb.PersistentClient(path="./thai-legal-db")
collection = client.get_collection("thai-legal")

@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="search_thai_law",
            description="ค้นหาข้อมูลกฎหมายไทยด้วยคำถาม",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "คำถามกฎหมาย"}
                },
                "required": ["query"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name, arguments):
    if name == "search_thai_law":
        query = arguments["query"]
        query_embedding = model.encode(query).tolist()

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=3,
            include=["documents", "metadatas"]
        )

        # Format ผลลัพธ์
        context = ""
        for i, (doc, meta) in enumerate(zip(results['documents'][0], results['metadatas'][0])):
            context += f"[{i+1}] {doc}\nมาตราที่เกี่ยวข้อง: {meta['laws']}\n\n"

        return [TextContent(type="text", text=context)]

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

### 3️⃣ เพิ่ม MCP Config

#### Claude Code (`.mcp.json`)

```json
{
  "mcpServers": {
    "thai-legal-rag": {
      "type": "stdio",
      "command": "python",
      "args": ["legal-rag-mcp.py"],
      "cwd": "/workspace/thai-legal-rag"
    }
  }
}
```

#### OpenCode (`opencode.jsonc`)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    },
    "gh_grep": {
      "type": "remote",
      "url": "https://mcp.grep.app"
    },
    "thai-legal-rag": {
      "type": "local",
      "command": ["python", "legal-rag-mcp.py"],
      "enabled": true,
      "cwd": "/workspace/thai-legal-rag"
    },
    "brave-search": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-brave-search"],
      "enabled": true,
      "environment": {
        "BRAVE_API_KEY": "{env:BRAVE_API_KEY}"
      }
    }
  }
}
```

### 4️⃣ วิธีใช้

เมื่อ user ถามใน Claude Code / OpenCode:

```
User: ถ้าคนประกอบกิจการศูนย์ซื้อขายสัญญาซื้อขายล่วงหน้าโดยไม่ได้รับใบอนุญาต ต้องโทษยังไง?

Claude Code จะเรียก MCP tool: search_thai_law
MCP คืนข้อมูล: มาตรา 132 พรบ.สัญญาซื้อขายล่วงหน้า พ.ศ. 2546

Claude Code ตอบ: ต้องระวางโทษจำคุกไม่เกิน 3 ปี หรือปรับไม่เกิน 3 แสนบาท
               หรือทั้งจำทั้งปรับ และปรับอีกไม่เกินวันละ 1 หมื่นบาท
               ตลอดเวลาที่ฝ่าฝืน (มาตรา 132)
```

---

## MCP Integration

### 🔌 MCP Servers ที่ใช้งาน

| MCP Server | Type | Description |
|------------|------|-------------|
| **context7** | Remote | ค้นหา documentation ของ libraries |
| **gh_grep** | Remote | ค้นหา code ตัวอย่างจาก GitHub |
| **thai-legal-rag** | Local | ค้นหาข้อมูลกฎหมายไทย (RAG) |
| **brave-search** | Local | ค้นหาข้อมูลจากเว็บ |

### 📁 โครงสร้างไฟล์

```
/workspace/thai-legal-rag/
├── opencode.jsonc          # เพิ่ม MCP config
├── ingest-legal.py         # Script ingest ข้อมูล
├── legal-rag-mcp.py        # MCP server
├── thai-legal.jsonl        # Dataset (download จาก HF)
└── thai-legal-db/          # ChromaDB index
```

---

## Cost Estimate

### 💰 ประมาณการค่าใช้จ่าย (ต่อเดือน)

| Service | Free Tier | Paid (ประมาณ) |
|---------|-----------|---------------|
| **Pinecone** | 1 index ฟรี (50MB) | $25-70 |
| **ChromaDB** | ฟรี (local file) | ฟรี |
| **Claude API (Haiku)** | ไม่มีฟรี | $0.25 input / $1.25 output per 1M tokens |
| **Claude API (Sonnet)** | ไม่มีฟรี | $3 input / $15 output per 1M tokens |
| **OpenAI Embedding** | ไม่มีฟรี | $0.02 / 1M tokens |
| **Sentence Transformers** | ฟรี | ฟรี |
| **HuggingFace** | ฟรี (download) | ฟรี |

### 📊 ตัวอย่างการใช้งาน

**Bot ใช้ไม่มาก:** ≈ $5-20/เดือน ก็พอ

**คำนวณ:**
```
สมมติ:
- 1,000 คำถาม/เดือน
- เฉลี่ย 2,000 tokens/คำถาม (input + output)
- รวม: 2M tokens/เดือน

Claude Haiku: 2M × $0.25/1M = $0.50
Claude Sonnet: 2M × $3/1M = $6.00

รวม: $5-20/เดือน (ขึ้นอยู่กับ model ที่ใช้)
```

---

## Evaluation วิธีวัดผล RAG

### 📏 Metrics ที่ใช้วัด

| Metric | วัดอะไร | สูตร |
|--------|---------|------|
| **Retrieval Precision** | chunk ที่ดึงมาเกี่ยวข้องจริงกี่ % | relevant_retrieved / total_retrieved |
| **Retrieval Recall** | ดึงข้อมูลที่ต้องการมาครบกี่ % | relevant_retrieved / total_relevant |
| **Citation F1** | อ้างอิงมาตราถูกต้องกี่ % | harmonic mean of precision & recall |
| **Answer Correctness** | คำตอบถูกต้องกี่ % | ใช้ LLM-as-judge หรือ human eval |

### 🧪 ตัวอย่าง Evaluation Script

```python
# file: evaluate.py
from sentence_transformers import SentenceTransformer
import chromadb
import json

model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
client = chromadb.PersistentClient(path="./thai-legal-db")
collection = client.get_collection("thai-legal")

def evaluate_retrieval(test_data: list[dict], top_k: int = 3) -> dict:
    """วัดผล retrieval ด้วย test dataset"""
    total_precision = 0
    total_recall = 0

    for item in test_data:
        query = item["question"]
        expected_laws = set(item["relevant_laws"])

        # Query
        query_embedding = model.encode(query).tolist()
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["metadatas"]
        )

        # วัดผล
        retrieved_laws = set()
        for meta in results["metadatas"][0]:
            retrieved_laws.update(meta.get("laws", "").split(","))

        if retrieved_laws:
            precision = len(expected_laws & retrieved_laws) / len(retrieved_laws)
            recall = len(expected_laws & retrieved_laws) / len(expected_laws)
        else:
            precision = recall = 0

        total_precision += precision
        total_recall += recall

    n = len(test_data)
    avg_precision = total_precision / n
    avg_recall = total_recall / n
    f1 = 2 * avg_precision * avg_recall / (avg_precision + avg_recall) if (avg_precision + avg_recall) > 0 else 0

    return {
        "precision": round(avg_precision, 3),
        "recall": round(avg_recall, 3),
        "f1": round(f1, 3),
        "samples": n
    }

# ใช้งาน
with open("test_questions.json") as f:
    test_data = json.load(f)

results = evaluate_retrieval(test_data)
print(f"Precision: {results['precision']}")
print(f"Recall:    {results['recall']}")
print(f"F1:        {results['f1']}")
```

> 💡 **Tips:** ใช้ `VISAI-AI/nitibench` เป็น test set ได้เลย เพราะมี `relevant_laws` พร้อม

---

## 📚 อ้างอิง

### 📄 Papers

1. **NitiBench: A Comprehensive Study of LLM Framework Capabilities for Thai Legal Question Answering**
   - EMNLP 2025, ACL Anthology
   - https://arxiv.org/abs/2502.10868
   - https://aclanthology.org/2025.emnlp-main.1739/

2. **Can Group Relative Policy Optimization Improve Thai Legal Reasoning and Question Answering?**
   - https://arxiv.org/abs/2507.09638

### 🔗 ลิงก์สำคัญ

- **HuggingFace Datasets:**
  - https://huggingface.co/datasets/VISAI-AI/nitibench
  - https://huggingface.co/datasets/airesearch/WangchanX-Legal-ThaiCCL-RAG

- **Models:**
  - https://huggingface.co/airesearch/LLaMa3.1-8B-Legal-ThaiCCL-Combine

- **Thai Legal AI Products:**
  - KHORN AI: https://www.khorn-ai.com/
  - Thanoy (ธนอย): https://iapp.co.th/products/thanoy

---

## 🎯 สรุป

> **Dataset+RAG+Claude 3.5 Sonnet ดีที่สุด** — ถูกต้องกว่า, generalize ดีกว่า, ถูกกว่า, deploy เร็วกว่า fine-tuned model! 🏆

**เหตุผล:**
1. RAG ช่วยเจาะจงข้อมูล → ลด hallucination
2. Claude เก่งภาษาไทย + reasoning ดี
3. ไม่ต้อง train model เอง → ประหยัดเวลา + cost
4. อัปเดต dataset ง่าย → ไม่ต้อง retrain

**Fine-tuned model มีประโยชน์เมื่อ:**
- ต้องการลด cost ระยะยาว (volume สูงมาก)
- มี data เฉพาะ domain ที่ Claude ไม่เก่ง
- ต้องการ latency ต่ำมาก (real-time)

---

**เอกสารนี้จัดทำโดย:** AI Skill Team
**อัปเดตล่าสุด:** 2026-03-15
**License:** MIT
