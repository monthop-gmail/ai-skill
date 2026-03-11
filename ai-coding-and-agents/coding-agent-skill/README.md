# Coding Agent Skill 🤖

รวบรวมข้อมูล AI Coding Agents จากค่ายต่างๆ พร้อมข้อมูล Free Tier

> ⚠️ **หมายเหตุ:** ข้อมูลด้านราคา/สิทธิ์ Free Tier เปลี่ยนแปลงได้บ่อย ควรเช็กหน้า pricing อย่างเป็นทางการของแต่ละบริการทุกครั้ง

> 📌 **BYOK (Bring Your Own Key)** = ตัว tool ฟรี แต่ต้องเอา API key ของตัวเองมาใส่ (เช่น Anthropic, OpenAI, Google) ค่าใช้จ่ายจะจ่ายตรงกับค่ายโมเดลที่เลือกใช้แบบ pay-per-use

---

## 📑 สารบัญ

- [ภาพรวม](#-ภาพรวม)
- [ตารางเปรียบเทียบ](#-ตารางเปรียบเทียบ)
- [แนะนำตามการใช้งาน](#-แนะนำตามการใช้งาน)
- [การติดตั้ง](#-การติดตั้ง)
- [ตัวอย่างการใช้งาน](#-ตัวอย่างการใช้งาน)
- [FAQ](#-faq)
- [แหล่งข้อมูล](#-แหล่งข้อมูล)

---

## 📊 ภาพรวม

| ประเภท | จำนวน | รายละเอียด |
|--------|-------|------------|
| ✅ **ฟรี 100%** | 5 ตัว | Gemini CLI, Qwen Code, OpenCode, Goose, Aider (BYOK) |
| 🆓 **Free Tier** | 5 ตัว | GitHub Copilot, Cursor, Windsurf, Codex, Continue |
| 💰 **ต้องจ่าย** | 2 ตัว | Claude Code, Cursor Pro |
| 🔧 **BYOK** | 6 ตัว | Cline, Roo Code, Kilo Code, Aider, Continue, Groq Code CLI |

---

## 🤖 ตารางเปรียบเทียบ

| ค่าย | Coding Agent | Free Tier | ราคา | หมายเหตุ |
|------|-------------|-----------|------|----------|
| **Google** | [Gemini CLI](https://github.com/google-gemini/gemini-cli) | ✅ **ใช้ได้ฟรี!** | ฟรี (60 req/min, 1,000 req/day) | ใช้ Google Account — รองรับ Gemini 2.5 Pro ขึ้นไป, 1M context |
| **OpenAI** | [Codex](https://openai.com/codex/) | ✅ มี (ชั่วคราว) | Plus $20/เดือน / API pay-per-use | GA แล้ว มี Desktop App, CLI, IDE — Free tier เป็นโปรโมชั่นชั่วคราว |
| **Anthropic** | [Claude Code](https://github.com/anthropics/claude-code) | ❌ **ไม่ได้** | Pro $20/เดือน / Max $100–$200/เดือน | Free tier ไม่รองรับ — รองรับ BYOK (API key) ด้วย |
| **GitHub (Microsoft)** | [GitHub Copilot](https://github.com/features/copilot) | ✅ มี | Free: 2,000 completions/เดือน | Student ได้ Pro ฟรี |
| **Cursor** | [Cursor](https://www.cursor.com/) | ✅ มี | Free tier จำกัด / Pro $20/เดือน | AI-first IDE |
| **Cognition AI** | [Windsurf](https://windsurf.com/) | ✅ มี | Free ~25 prompts/เดือน / Pro $15/เดือน | เดิมชื่อ Codeium — ถูก Cognition AI ซื้อกิจการ |
| **Alibaba** | [Qwen Code](https://github.com/QwenLM/qwen-code) | ✅ มี | ฟรี | Open Source — โมเดลเฉพาะทาง coding agent |
| **Open Source** | [Cline](https://github.com/cline/cline) | ✅ ฟรี | BYOK | VS Code Extension |
| **Open Source** | [Roo Code](https://github.com/RooCodeInc/Roo-Code) | ✅ ฟรี | BYOK | VS Code Extension (fork จาก Cline) |
| **Open Source** | [Kilo Code](https://github.com/Kilo-Org/kilocode) | ✅ ฟรี | BYOK | Fork จาก Cline + Roo Code |
| **Open Source** | [OpenCode](https://github.com/anomalyco/opencode) | ✅ ฟรี | ฟรี | Open Source CLI |
| **Open Source** | [Aider](https://github.com/Aider-AI/aider) | ✅ ฟรี | BYOK | CLI Tool |
| **Open Source** | [Continue](https://github.com/continuedev/continue) | ✅ ฟรี | BYOK | CLI/CI Tool (เดิมเป็น IDE Extension) |
| **Open Source** | [Goose](https://github.com/block/goose) | ✅ ฟรี | ฟรี | Open Source Agent |
| **Groq** | [Groq Code CLI](https://github.com/build-with-groq/groq-code-cli) | ✅ ฟรี | BYOK (Groq API Key) | Open Source CLI — ใช้ Groq LLM inference ที่เร็วมาก, hackable, React+Ink TUI |

---

## 💡 แนะนำตามการใช้งาน

### 🥇 สำหรับผู้เริ่มต้น (ฟรี 100%)

| ลำดับ | Tool | เหตุผลที่แนะนำ |
|-------|------|---------------|
| 1️⃣ | **Gemini CLI** | ฟรีสุด! แค่มี Google Account, ใช้ Gemini 2.5 Pro, Context 1M tokens |
| 2️⃣ | **GitHub Copilot Free** | 2,000 completions/เดือน เพียงพอสำหรับใช้เล่นๆ, Student ได้ Pro ฟรี! |
| 3️⃣ | **Qwen Code** | ฟรีจาก Alibaba, Open Source, โมเดลเฉพาะทาง coding |

### 🥈 สำหรับผู้ใช้ขั้นสูง (BYOK)

| Tool | เหมาะสำหรับ | แนะนำคู่กับ |
|------|-----------|------------|
| **Cline / Roo Code / Kilo Code** | VS Code users | GitHub Copilot API ($10/เดือน) |
| **Aider** | CLI lovers | GPT-4, Claude API |
| **Groq Code CLI** | CLI lovers ที่ต้องการความเร็ว | Groq API (Kimi K2, Llama, Mixtral) |
| **Continue** | CI/CD integration | โมเดลที่หลากหลาย |

### 🥉 สำหรับทีม/องค์กร

| Tool | ราคา | จุดเด่น |
|------|------|--------|
| **GitHub Copilot Business** | $19/user/เดือน | จัดการกลาง, Security |
| **Cursor Pro** | $20/เดือน | AI-first IDE, UX ดี |
| **Windsurf Pro** | $15/เดือน | เดิมชื่อ Codeium, ราคาประหยัด |

---

## 🚀 การติดตั้ง

### 🐧 Linux / macOS

#### Step 1: ติดตั้ง Node.js ผ่าน NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 22
nvm alias default 22
node -v
npm -v
```

#### Step 2: ติดตั้ง CLI Coding Agents

```bash
# Google Gemini CLI
npm install -g @google/gemini-cli

# OpenAI Codex
npm install -g @openai/codex

# Anthropic Claude Code
npm install -g @anthropic-ai/claude-code

# OpenCode AI
npm install -g opencode-ai

# Alibaba Qwen Code
npm install -g @qwen-code/qwen-code

# Groq Code CLI
npm install -g groq-code-cli
```

### 🪟 Windows

```powershell
# ติดตั้ง Node.js จาก https://nodejs.org/

# จากนั้นติดตั้ง CLI ต่างๆ
npm install -g @google/gemini-cli
npm install -g @openai/codex
npm install -g @anthropic-ai/claude-code
npm install -g groq-code-cli
```

### 📦 ติดตั้งแต่ละตัว

#### Gemini CLI
```bash
npm install -g @google/gemini-cli
gemini auth login
```

#### GitHub Copilot
1. ติดตั้ง Extension ใน VS Code
2. Login ด้วย GitHub Account
3. Student? สมัคร [GitHub Student Developer Pack](https://education.github.com/pack)

#### Cline
1. เปิด VS Code → Extensions
2. ค้นหา "Cline"
3. ติดตั้งและใส่ API Key (Anthropic, OpenAI, หรือ GitHub Copilot)

#### Roo Code
1. เปิด VS Code → Extensions
2. ค้นหา "Roo Code"
3. ติดตั้งและใส่ API Key

#### Aider
```bash
pip install aider-chat
aider --model gpt-4
```

#### Groq Code CLI
```bash
npm install -g groq-code-cli
groq /login          # ใส่ Groq API Key
groq /model          # เลือกโมเดล
```

---

## 💻 ตัวอย่างการใช้งาน

### Gemini CLI
```bash
# เริ่มใช้งาน
gemini

# ถามคำถาม
gemini "อธิบายเรื่อง React Hooks ให้หน่อย"

# ทำงานกับไฟล์
gemini " refactor this code" ./src/app.js
```

### GitHub Copilot (ใน VS Code)
```
1. พิมพ์โค้ด → Copilot จะแนะนำอัตโนมัติ (กด Tab เพื่อรับ)
2. กด Ctrl+Enter → เปิด Copilot Chat
3. พิมพ์ /test → สร้าง test อัตโนมัติ
```

### Cline (ใน VS Code)
```
1. เปิด Cline จาก Sidebar
2. พิมพ์คำสั่ง เช่น "สร้างไฟล์ Python สำหรับ web scraping"
3. Cline จะเขียนโค้ดและรันให้
```

### Aider (CLI)
```bash
# สร้างโปรเจกต์ใหม่
aider --model gpt-4 --git-init

# เพิ่มไฟล์และแก้ไข
aider src/main.py --model gpt-4

# สั่งงาน
> "เพิ่มฟังก์ชัน login ให้หน่อย"
```

### Groq Code CLI
```bash
# เริ่มใช้งาน
groq

# ใช้งานกับ proxy
groq --proxy http://your-proxy:8080

# เปิด debug mode
groq --debug

# ตั้ง system prompt เอง
groq --system "You are a Python expert"

# คำสั่งในแชท
/help              # ดูคำสั่งทั้งหมด
/model             # เปลี่ยนโมเดล
/stats             # ดูสถิติ token usage
/reasoning         # เปิด/ปิดแสดง reasoning
/clear             # เคลียร์ประวัติแชท
/init              # สร้าง context ให้โปรเจกต์
```

---

## 🤔 FAQ

### Q: ตัวไหนฟรีจริงๆ?
**A:** Gemini CLI, Qwen Code, OpenCode, Goose ฟรี 100% ส่วน Cline/Roo Code/Kilo Code ฟรีแต่ต้องใส่ API Key เอง (BYOK)

### Q: Student ได้สิทธิ์พิเศษอะไรบ้าง?
**A:** GitHub Student Developer Pack ได้ GitHub Copilot Pro ฟรี! สมัครที่ [education.github.com/pack](https://education.github.com/pack)

### Q: BYOK คืออะไร?
**A:** Bring Your Own Key = ตัว tool ฟรี แต่ต้องเอา API key ของตัวเองมาใส่ เช่น ใช้ Cline ฟรี แต่ต้องใส่ Anthropic API Key (จ่ายตามการใช้งาน)

### Q: ตัวไหนดีที่สุด?
**A:** ขึ้นกับความต้องการ:
- **ฟรี + ง่าย:** Gemini CLI
- **VS Code + ฟีเจอร์ครบ:** Cline / Roo Code
- **CLI + เร็ว:** Aider
- **CLI + Groq (เร็วมาก):** Groq Code CLI
- **IDE ใหม่ทั้งตัว:** Cursor

### Q: Claude Code ไม่มี Free Tier จริงหรือ?
**A:** ใช่ Claude Code ไม่มี Free Tier แต่ใช้ผ่าน Cline/Roo Code ด้วย API Key ได้ (pay-per-use)

### Q: โมเดลไหนเหมาะกับเขียนโค้ด?
**A:** 
- **GPT-4 / GPT-4o:** ทั่วไปดีสุด
- **Claude 3.5 Sonnet:** เขียนโค้ดเก่ง เข้าใจบริบทดี
- **Gemini 2.5 Pro:** Context กว้าง (1M tokens)
- **Qwen 2.5 Coder:** ฟรี! เฉพาะทางเขียนโค้ด
- **Kimi K2 (via Groq):** เร็วมาก! ใช้ผ่าน Groq Code CLI

---

## 🔗 แหล่งข้อมูล

### เอกสารทางการ
- [Gemini CLI](https://geminicli.com/)
- [OpenAI Codex](https://openai.com/codex/)
- [Claude Code](https://github.com/anthropics/claude-code)
- [GitHub Copilot](https://github.com/features/copilot)
- [Cursor](https://www.cursor.com/)
- [Windsurf](https://windsurf.com/)
- [Qwen Code](https://github.com/QwenLM/qwen-code)

### Open Source Tools
- [Cline](https://github.com/cline/cline)
- [Roo Code](https://github.com/RooCodeInc/Roo-Code)
- [Kilo Code](https://github.com/Kilo-Org/kilocode)
- [OpenCode](https://github.com/anomalyco/opencode)
- [Aider](https://github.com/Aider-AI/aider)
- [Continue](https://github.com/continuedev/continue)
- [Goose](https://github.com/block/goose)
- [Groq Code CLI](https://github.com/build-with-groq/groq-code-cli)

### บทความอ้างอิง
- [Best AI Coding Agents for 2026 - Faros AI](https://www.faros.ai/blog/best-ai-coding-agents-2026)
- [Coding Agents Comparison - Artificial Analysis](https://artificialanalysis.ai/insights/coding-agents-comparison)
- [Best AI Coding Tools 2026 - Local AI Master](https://localaimaster.com/tools/best-ai-coding-tools)

---

## 📄 License

MIT License — อนุญาตให้นำไปใช้และแก้ไขได้

---

**Last updated:** 2026-03-10
