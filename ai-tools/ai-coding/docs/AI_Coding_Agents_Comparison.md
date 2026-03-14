# 🤖 AI Coding Agents เปรียบเทียบรูปร่างคน

> สรุปเปรียบเทียบ AI Coding Agent ยอดนิยมในรูปแบบ "มนุษย์" — หัว = AI Model, ลำตัว+แขน+ขา = ความสามารถ

---

## 1. Claude Code 🧠

```
       👤 (หัว)
      ┌─────┐
      │Claude│ ← Anthropic Claude (Sonnet 4.5 / Opus)
      └─────┘
         │
    ┌────┴────┐
   ╱           ╲
  │  ○     ○   │ ← ตา (MCP - เชื่อมต่อ tool ภายนอก)
  │     ▽     │ ← ปาก (Subagents - ส่งงานย่อย)
  ╲           ╱
   │─────────│ ← ลำตัว (Hooks + SDK)
   │  ○   ○  │ ← แขน (Permission System)
   │    ─    │ ← ขา (Files API, Code Execution)
    └───────┘
```

**ความสามารถ:**
- **หัว:** Claude Sonnet 4.5 / Opus (Anthropic)
- **MCP:** เชื่อมต่อ database, GitHub, Sentry, 3000+ integrations
- **Subagents:** ส่งงานย่อยให้ทำหลายอย่างพร้อมกัน
- **Hooks:** รัน script ก่อน-หลัง command
- **SDK:** สร้าง agent ของตัวเองได้
- **Resume:** กลับมาต่อ conversation เก่าได้

---

## 2. OpenCode 🦾

```
       👤 (หัว)
      ┌─────┐
      │Any  │ ← รองรับทุก Model (OpenAI, Claude, Gemini, Ollama)
      └─────┘
         │
    ┌────┴────┐
   ╱           ╲
  │  ●     ●  │ ← ตา (glob, grep - ค้นหาไฟล์)
  │     ◡     │ ← ปาก (Edit + Write tools)
  ╲           ╱
   │─────────│ ← ลำตัว (TUI + SQLite session)
   │  ⚙️  ⚙️  │ ← แขน (MCP servers + Custom tools)
   │    ⚡    │ ← ขา (Bash, LSP, WebFetch)
    └───────┘
```

**ความสามารถ:**
- **หัว:** OpenAI, Anthropic Claude, Google Gemini, Ollama (local)
- **Provider-agnostic:** ใส่ API key อะไรก็ได้
- **TUI:** Terminal UI สวยงาม (Bubble Tea)
- **Session:** บันทึก conversation ใน SQLite
- **LSP:** Code intelligence, definitions, references
- **WebFetch:** ดึงข้อมูลจากเว็บ
- **Plan Mode:** แสดงแผนก่อนทำ

---

## 3. Codex ⚡

```
       👤 (หัว)
      ┌─────┐
      │GPT-5│ ← OpenAI Codex (GPT-5 family)
      └─────┘
         │
    ┌────┴────┐
   ╱           ╲
  │  ◉     ◉  │ ← ตา (Image input + Web search)
  │     ☐     │ ← ปาก (Skills - ชุดคำสั่ง)
  ╲           ╱
   │─────────│ ← ลำตัว (Rust-based, fast)
   │  🔀  🔀  │ ← แขน (Worktrees + Automations)
   │    🚀    │ ← ขา (Git integration + Shell)
    └───────┘
```

**ความสามารถ:**
- **หัว:** GPT-5 Codex (OpenAI)
- **Worktrees:** ทำงานหลาย branch พร้อมกัน
- **Skills:** ห่อชุดคำสั่งใช้ซ้ำได้
- **Automations:** ทำงานอัตโนมัติตาม schedule
- **Approval modes:** Auto / Read Only / Full Access
- **Non-interactive:** `codex exec` สำหรับ script
- **Image support:** วางรูปเข้าไปได้

---

## 4. Gemini CLI 🔍

```
       👤 (หัว)
      ┌─────┐
      │ 🌟   │ ← Gemini 2.5 Pro/Flash (Google)
      └─────┘
         │
    ┌────┴────┐
   ╱           ╲
  │  🔎   🔎  │ ← ตา (Google Search Grounding)
  │     ◈     │ ← ปาก (Todo tracking)
  ╲           ╱
   │─────────│ ← ลำตัว (1M+ token context)
   │  ☁️   ☁️  │ ← แขน (MCP + Cloud integration)
   │    🛡️    │ ← ขา (Sandboxing + Yolo mode)
    └───────┘
```

**ความสามารถ:**
- **หัว:** Gemini 2.5 Pro/Flash (Google) — ฟรี 1M token!
- **Google Search:** ค้นหาข้อมูล real-time ได้
- **Grounding:** ตรวจสอบข้อมูลก่อนตอบ
- **Sandboxing:** รัน command อย่างปลอดภัย
- **Yolo mode:** ข้าม approval ทำเลย
- **1M+ token:** ใส่ codebase ใหญ่ได้หมด
- **Checkpoint:** สแนปชอต session อัตโนมัติ

---

## 5. Windsurf 🌊

```
       👤 (หัว)
      ┌─────┐
      │ 💫   │ ← Cascade (Codeium proprietary)
      └─────┘
         │
    ┌────┴────┐
   ╱           ╲
  │  👁️   👁️  │ ← ตา (Deep Context Engine)
  │     ◈     │ ← ปาก (Flow - ติดตาม step)
  ╲           ╱
   │─────────│ ← ลำตัว (Agentic IDE)
   │  🧠   🧠  │ ← แขน (Memories + Rules)
   │    🎯    │ ← ขา (Supercomplete + MCP)
    └───────┘
```

**ความสามารถ:**
- **หัว:** Cascade (Codeium's model)
- **Context Engine:** เข้าใจ codebase ลึกซึ้ง
- **Memories:** จำ preferences และ project structure
- **Rules:** กำหนด coding patterns
- **Supercomplete:** ทำนาย next action
- **Flow:** ติดตาม progress ของ agent
- **MCP:** เชื่อมต่อ Figma, Stripe, Slack, etc.
- **Windsurf Previews:** Preview เว็บใน IDE

---

## 6. Antigravity 🚀

```
       👤 (หัว)
      ┌─────┐
      │🪐   │ ← Gemini 3 + Claude Sonnet 4.5 + GPT-OSS
      └─────┘
         │
    ┌────┴────┐
   ╱           ╲
  │  🌐   🌐  │ ← ตา (Browser Control - เหมือนคน)
  │     ⬡     │ ← ปาก (Agent Manager)
  ╲           ╱
   │─────────│ ← ลำตัว (3-Surface Architecture)
   │  🤖 🤖  │ ← แขน (Multi-agent orchestration)
   │    ⚡    │ ← ขา (Terminal + Editor + Browser)
    └───────┘
```

**ความสามารถ:**
- **หัว:** Gemini 3, Claude Sonnet 4.5, GPT-OSS (เลือกได้)
- **Agent-First:** สั่งงาน agent แล้วทำเอง
- **3-Surface:** Editor + Agent Manager + Browser
- **Multi-agent:** หลาย agent ทำงานพร้อมกัน
- **Browser Control:** agent ควบคุม browser ได้
- **Vibe Coding:** พูดสิ่งที่ต้องการแล้ว agent ทำ
- **Asynchronous:** ทำงานหลังบ้านได้
- **Agent Manager:** ดู status ทุก agent จากหน้าจอเดียว

---

## 📊 ตารางเปรียบเทียบสรุป

| Agent | หัว (Model) | ฟรี? | ประเภท | จุดเด่น |
|-------|-------------|------|--------|---------|
| **Claude Code** | Claude Sonnet 4.5 | ❌ แพง | CLI | MCP + Subagents + SDK |
| **OpenCode** | ทุก Model | ✅ (Ollama) | CLI | Provider-agnostic + TUI |
| **Codex** | GPT-5 | ✅ (ChatGPT) | CLI | Worktrees + Skills |
| **Gemini CLI** | Gemini 2.5 Pro | ✅ ฟรีมาก | CLI | Search Grounding + Sandbox |
| **Windsurf** | Cascade | ✅ มี free | IDE | Memories + Deep Context |
| **Antigravity** | Gemini 3 | ✅ ฟรี | IDE | Multi-agent + Browser Control |

---

## 🎯 สรุปจุดเด่น

- **ถ้าต้องการ CLI เร็ว + ฟรี:** **Gemini CLI** — ฟรี 1M token, search grounding
- **ถ้าต้องการ local + ควบคุม model เอง:** **OpenCode** — ใช้ Ollama ก็ได้
- **ถ้าใช้ ChatGPT อยู่แล้ว:** **Codex** — มาพร้อม ChatGPT Plus
- **ถ้าต้องการ IDE ที่มี AI ในตัว:** **Windsurf** — memories + rules
- **ถ้าต้องการ agent ทำงานเอง:** **Antigravity** — multi-agent + browser
- **ถ้าต้องการ SDK + extensibility:** **Claude Code** — MCP + hooks + subagents

> 📌 ต้องการติดตั้ง MCP servers? ดู [MCP Setup Checklist](./mcp-setup-checklist.md) — รวม Remote + Local MCP servers ที่ใช้บ่อยพร้อม config

---

*Compare โดยใช้หลัก: หัว = AI Model, ลำตัว/แขน/ขา = Built-in Tools & Features*
