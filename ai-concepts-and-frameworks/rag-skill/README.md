# RAG Frameworks Guide 2026

คู่มือ RAG (Retrieval-Augmented Generation) Frameworks พร้อมใช้งาน

## 📌 RAG คืออะไร

RAG คือเทคนิคที่ช่วยให้ AI ตอบคำถามโดยใช้ข้อมูลจากเอกสารหรือฐานความรู้ของเรา แทนที่จะพึ่งพาความรู้ที่ฝึกมาเท่านั้น

**องค์ประกอบหลัก:**
- **Embedding Model** - แปลงข้อความเป็น vector สำหรับค้นหา
- **Vector Database** - เก็บและค้นหา embeddings
- **LLM (Generator)** - สร้างคำตอบจากข้อมูลที่เจอ

---

## 🔥 Popular RAG Frameworks

### 1. LangChain / LangGraph ⭐⭐⭐
- **จุดเด่น:** ยอดนิยมที่สุด รองรับ workflow ซับซ้อน
- **เหมาะสำหรับ:** Custom pipelines, complex workflows
- **GitHub:** https://github.com/langchain-ai/langchain

### 2. LlamaIndex ⭐⭐⭐
- **จุดเด่น:** เก่งเรื่อง document indexing & retrieval
- **เหมาะสำหรับ:** Document-heavy applications
- **GitHub:** https://github.com/run-llama/llama_index

### 3. Dify ⭐⭐⭐
- **จุดเด่น:** No-code AI Agent Builder, มี RAG ในตัว
- **เหมาะสำหรับ:** Enterprise, production
- **MCP Support:** ✅ มี Dify MCP Server
- **GitHub:** https://github.com/langgenius/dify
- **MCP Server:** https://github.com/YanxingLiu/dify-mcp-server

### 4. AnythingLLM ⭐⭐⭐
- **จุดเด่น:** All-in-one, multi-user, private RAG
- **เหมาะสำหรับ:** Local use, single/multi-user
- **MCP Support:** ✅ มี MCP Compatibility
- **GitHub:** https://github.com/Mintplex-Labs/anything-llm
- **Docs:** https://docs.anythingllm.com/mcp-compatibility/overview

### 5. Flowise ⭐⭐
- **จุดเด่น:** Visual drag & drop (LangChain UI)
- **เหมาะสำหรับ:** Non-technical users, quick setup
- **GitHub:** https://github.com/FlowiseAI/Flowise

### 6. Haystack
- **จุดเด่น:** Production-ready จาก deepset
- **GitHub:** https://github.com/deepset-ai/haystack

### 7. NVIDIA RAG Blueprint
- **จุดเด่น:** Reference solution จาก NVIDIA
- **เหมาะสำหรับ:** Enterprise deployment
- **Docs:** https://docs.nvidia.com/rag

---

## 🐳 Docker Compose Ready-to-Use

### AnythingLLM
```bash
docker pull mintplexlabs/anythingllm
docker run -d -p 3001:3001 mintplexlabs/anythingllm
```

### Dify
```bash
git clone https://github.com/langgenius/dify.git
cd dify/docker
docker compose up -d
```

### Flowise
```bash
docker run -d -p 3000:3000 flowiseai/flowise
```

### Local LLM Stack (ครบชุด)
รวม: AnythingLLM + Flowise + Open WebUI + n8n + Qdrant
- **GitHub:** https://github.com/dalekurt/local-llm-stack

---

## 🔌 MCP (Model Context Protocol) Support

### RAG ที่ใช้ผ่าน MCP ได้

| Framework | MCP Support | Notes |
|-----------|-------------|-------|
| **Dify** | ✅ | [dify-mcp-server](https://github.com/YanxingLiu/dify-mcp-server) |
| **AnythingLLM** | ✅ | Built-in MCP Compatibility |
| **Custom RAG** | ✅ | สร้าง MCP Server เองได้ |

### ตัวอย่าง MCP Config สำหรับ Dify
```json
{
  "mcpServers": {
    "dify-mcp-server": {
      "command": "uv",
      "args": [
        "--directory",
        "${DIFY_MCP_SERVER_PATH}",
        "run",
        "dify_mcp_server"
      ],
      "env": {
        "CONFIG_PATH": "$CONFIG_PATH"
      }
    }
  }
}
```

---

## 📊 เปรียบเทียบ

| Use Case | แนะนำ |
|----------|--------|
| ง่ายสุด | AnythingLLM, Flowise |
| ครบสุด | Dify |
| Custom มาก | LangChain, LlamaIndex |
| Enterprise | Dify, NVIDIA RAG |
| Local/Privacy | AnythingLLM + Ollama |
| MCP Support | Dify, AnythingLLM |

---

## 🚀 Quick Start

### 1. ลอง AnythingLLM (ง่ายสุด)
```bash
docker run -d -p 3001:3001 -v anythingllm:/app/server/storage mintplexlabs/anythingllm
```
แล้วเปิด http://localhost:3001

### 2. ลอง Dify (ครบสุด)
```bash
git clone https://github.com/langgenius/dify.git
cd dify/docker
docker compose up -d
```
แล้วเปิด http://localhost:3000

### 3. ลอง Flowise (Visual)
```bash
docker run -d -p 3000:3000 flowiseai/flowise
```
แล้วเปิด http://localhost:3000

---

## 📚 Resources

- **เปรียบเทียบ RAG Frameworks:** https://www.firecrawl.dev/blog/best-open-source-rag-frameworks
- **Top RAG Tools 2026:** https://www.meilisearch.com/blog/rag-tools
- **Self-hosted RAG:** https://github.com/mylonasc/self-hosted-rag
- **RAG + MCP Tutorial:** https://medium.com/data-science-in-your-pocket/rag-mcp-server-tutorial-89badff90c00

---

## 📝 License

MIT License - Feel free to use and share!
