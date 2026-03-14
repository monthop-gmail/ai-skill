# ai-skill

รวมเนื้อหาและคู่มือเกี่ยวกับการนำ AI ไปใช้งานจริงในองค์กร

---

## AI Concepts - แนวคิดและ Framework ของ AI

| เนื้อหา | รายละเอียด |
|---------|-----------|
| [Prompt vs. Skill vs. Workflow](./ai-concepts/ai-working-levels/README.md) | อธิบาย 3 ระดับการทำงานของ AI พร้อมตัวอย่าง CrewAI |
| [RAG Frameworks Guide](./ai-concepts/rag/README.md) | เปรียบเทียบ RAG Frameworks (LangChain, Dify, AnythingLLM, Flowise) พร้อม Docker setup และ MCP support |
| [Thai Legal RAG Guide](./ai-concepts/rag/thai-legal-rag-guide.md) | คู่มือระบบ RAG กฎหมายไทย: Dataset+Claude+ChromaDB, เปรียบเทียบ RAG vs Fine-tuned, MCP Server, Cost estimate |

## AI Tools - เครื่องมือ AI สำหรับนักพัฒนา

| เนื้อหา | รายละเอียด |
|---------|-----------|
| [AI Coding Agents - Free Tier Survey](./ai-tools/coding-agents/README.md) | สำรวจ 15+ Coding Agents พร้อมราคา, Free Tier และคำแนะนำตาม use case |
| [AI Coding Agents - Comparison](./ai-tools/coding-agents/agents-comparison.md) | เปรียบเทียบ 6 agents หลัก (Claude Code, OpenCode, Codex, Gemini CLI, Windsurf, Antigravity) |
| [MCP Setup Checklist](./ai-tools/coding-agents/mcp-setup-checklist.md) | Checklist ติดตั้ง MCP servers ที่ใช้บ่อย (8 Remote + 10 Local) พร้อม CLI commands และ JSON config |
| [Knowledge Work Plugins & Skills](./ai-tools/cowork/README.md) | Anthropic Knowledge Work Plugins + คู่มือ Skills สำหรับ Claude Code และ OpenCode |

## Infrastructure - โครงสร้างพื้นฐานและ Hosting

| เนื้อหา | รายละเอียด |
|---------|-----------|
| [Hosting Platform Guide](./infrastructure/hosting/README.md) | เปรียบเทียบ 13 แพลตฟอร์ม (Render, Fly.io, Vercel, Cloudflare, AWS, GCP) + LiteLLM, Odoo hosting + AI Platform architecture |
| [Debian Server Setup & Cloudflare Tunnel](./infrastructure/debian/README.md) | คู่มือตั้งค่า Debian 13 ตั้งแต่ต้น: Docker, Static IP, Cloudflare Tunnel, SSH hardening |
| [Dev Environment System Design](./infrastructure/dev-env/README.md) | ออกแบบระบบ Dev: 1 Container/1 Repo/1 DNS, Local→PRD sync, แยก env, Secret management (SOPS+age) |
