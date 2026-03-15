# MCP Setup Checklist สำหรับ AI Coding Agent

> Checklist สำหรับติดตั้ง MCP (Model Context Protocol) servers ที่ใช้บ่อย
> ใช้ได้กับ Claude Code, OpenCode และ tools อื่นๆ ที่รองรับ MCP

---

## สารบัญ

- [MCP ตัวไหนจำเป็น? ตัวไหนซ้ำกับ Built-in?](#mcp-ตัวไหนจำเป็น-ตัวไหนซ้ำกับ-built-in)
- [วิธีติดตั้ง](#วิธีติดตั้ง)
- [Remote MCP Servers](#remote-mcp-servers)
- [Local MCP Servers](#local-mcp-servers)
- [ตัวอย่าง Config แบบครบชุด](#ตัวอย่าง-config-แบบครบชุด)
- [การจัดการและตรวจสอบ](#การจัดการและตรวจสอบ)
- [Troubleshooting](#troubleshooting)
- [Tips](#tips)

---

## MCP ตัวไหนจำเป็น? ตัวไหนซ้ำกับ Built-in?

> AI Coding Agents อย่าง Claude Code, OpenCode มี built-in tools อยู่แล้ว (อ่านไฟล์, รัน shell, เรียก git/gh)
> บาง MCP servers จึง **ซ้ำซ้อน** กับสิ่งที่มีอยู่ — ส่วนที่เพิ่มมาคือ MCP ที่ให้ **ความสามารถใหม่** ที่ built-in ทำไม่ได้

### ตารางเปรียบเทียบ: MCP vs Built-in

| MCP Server | Built-in ที่มีอยู่แล้ว | ซ้ำไหม? | ควรลง? |
|---|---|---|---|
| **Filesystem** | `Read`, `Write`, `Edit`, `Glob`, `Grep` | ซ้ำเกือบ 100% | ไม่จำเป็น |
| **Git** | `Bash` → `git log`, `git diff`, `git commit` ฯลฯ | ซ้ำเกือบ 100% | ไม่จำเป็น |
| **Fetch** | `WebFetch`, `WebSearch` (Claude Code) / `Bash` → `curl` | ซ้ำเกือบ 100% | ไม่จำเป็น |
| **GitHub** | `Bash` → `gh pr create`, `gh issue list` ฯลฯ | ซ้ำบางส่วน | ลงก็ได้ (OAuth สะดวกกว่า) |
| **Slack** | ไม่มี built-in | ไม่ซ้ำ | **ควรลง** |
| **Linear** | ไม่มี built-in | ไม่ซ้ำ | **ควรลง** |
| **Sentry** | ไม่มี built-in | ไม่ซ้ำ | **ควรลง** |
| **Figma** | ไม่มี built-in | ไม่ซ้ำ | **ควรลง** |
| **Notion** | ไม่มี built-in | ไม่ซ้ำ | **ควรลง** |
| **Playwright** | ไม่มี built-in | ไม่ซ้ำ | **ควรลง** |
| **Database** | `Bash` → `psql` ได้ แต่ MCP สะดวกกว่ามาก | ซ้ำบางส่วน | **ควรลง** |
| **Brave Search** | `WebSearch` (Claude Code) | ซ้ำบางส่วน | ลงก็ได้ |
| **Sequential Thinking** | ไม่มี built-in | ไม่ซ้ำ | **ควรลง** |
| **Docker** | `Bash` → `docker ps`, `docker build` ฯลฯ | ซ้ำบางส่วน | ไม่จำเป็น |
| **Memory** | ไม่มี built-in (Claude Code มี auto memory แต่คนละแบบ) | ไม่ซ้ำ | ลงก็ได้ |
| **Time** | `Bash` → `date` | ซ้ำ | ไม่จำเป็น |

### แล้ว MCP พวก Filesystem, Git, Fetch มีไว้ทำไม?

MCP servers เหล่านี้ถูกสร้างมาเพื่อ **AI tools ที่ไม่มี built-in tools** เช่น:

```
Claude Code / OpenCode (มี built-in ครบ)
├── Read, Write, Edit        ← ไม่ต้องการ Filesystem MCP
├── Bash → git               ← ไม่ต้องการ Git MCP
├── Bash → gh                ← ไม่ต้องการ GitHub MCP
└── WebFetch / curl          ← ไม่ต้องการ Fetch MCP

Claude Desktop / ChatGPT / Custom AI Apps (ไม่มี built-in)
├── ต้องการ Filesystem MCP   ← ถึงจะอ่านไฟล์ได้
├── ต้องการ Git MCP          ← ถึงจะดู git log ได้
├── ต้องการ GitHub MCP       ← ถึงจะสร้าง PR ได้
└── ต้องการ Fetch MCP        ← ถึงจะดึงเว็บได้
```

### GitHub MCP vs `gh` CLI — มีข้อต่างอะไรบ้าง?

| | `gh` CLI (Built-in) | GitHub MCP |
|---|---|---|
| สร้าง PR / ดู Issues | `gh pr create`, `gh issue list` | มี tools สำเร็จรูป |
| Auth | ต้อง `gh auth login` ก่อน | OAuth ผ่าน `/mcp` — ง่ายกว่า |
| ความยืดหยุ่น | **ได้ทุก gh command** | จำกัดเฉพาะ tools ที่ MCP เปิดให้ |
| Cross-repo | ได้ แต่ต้องระบุ `owner/repo` | browse ได้สะดวกกว่า |

> ถ้าตั้ง `gh` CLI ไว้แล้ว → GitHub MCP ไม่จำเป็น แต่ถ้าไม่อยากตั้ง gh CLI ก็ใช้ MCP แทนได้

### สรุป: ควรลง MCP ตัวไหน?

```
✅ ควรลง (เพิ่มความสามารถใหม่)
   → Slack, Linear, Sentry, Figma, Notion
   → Playwright, Sequential Thinking, Database

🤔 ลงก็ได้ (สะดวกขึ้นนิดหน่อย)
   → GitHub MCP (ถ้าไม่อยากตั้ง gh CLI)
   → Brave Search (ถ้าอยากค้นหาเว็บแบบเจาะลึก)
   → Memory (ถ้าอยาก persistent knowledge graph)

❌ ไม่จำเป็นสำหรับ Claude Code / OpenCode (ซ้ำกับ built-in)
   → Filesystem, Git, Fetch, Docker, Time
```

---

## วิธีติดตั้ง

### Claude Code CLI

```bash
# Remote (HTTP)
claude mcp add --transport http <name> <url>

# Local (stdio)
claude mcp add --transport stdio <name> -- <command> [args]

# พร้อม env variable
claude mcp add --transport stdio <name> --env KEY=value -- npx <package>

# กำหนด scope (local | project | user)
claude mcp add --transport http --scope project <name> <url>
```

### ไฟล์ config `.mcp.json` (วางที่ root ของ project)

```json
{
  "mcpServers": {
    "server-name": {
      "type": "http",
      "url": "https://..."
    }
  }
}
```

### OpenCode (`opencode.jsonc`)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "server-name": {
      "type": "remote",
      "url": "https://..."
    },
    "local-server": {
      "type": "local",
      "command": ["npx", "-y", "package-name"],
      "environment": {
        "KEY": "value"
      }
    }
  }
}
```

> OpenCode ใช้ `type: "remote"` แทน `"http"` และ `type: "local"` แทน `"stdio"`

---

## Remote MCP Servers

MCP servers ที่เชื่อมต่อผ่าน URL ไม่ต้องติดตั้งอะไรเพิ่ม

### 1. GitHub

> เข้าถึง repos, issues, PRs, code search, CI/CD workflows

- [ ] ติดตั้ง GitHub MCP

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

```json
{
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/"
  }
}
```

> ใช้ `/mcp` ใน Claude Code เพื่อ authenticate ผ่าน OAuth

---

### 2. Linear (Issue Tracking)

> จัดการ issues, projects, teams, ติดตามความคืบหน้า

- [ ] ติดตั้ง Linear MCP

```bash
claude mcp add --transport http linear https://mcp.linear.app/mcp
```

```json
{
  "linear": {
    "type": "http",
    "url": "https://mcp.linear.app/mcp"
  }
}
```

---

### 3. Slack

> อ่าน/ส่งข้อความ, จัดการ channels, ค้นหาประวัติแชท

- [ ] ติดตั้ง Slack MCP

```bash
claude mcp add --transport http slack https://mcp.slack.com/mcp
```

```json
{
  "slack": {
    "type": "http",
    "url": "https://mcp.slack.com/mcp"
  }
}
```

---

### 4. Sentry (Error Monitoring)

> ดู errors, stack traces, crash reports, เชื่อมกับ deployments

- [ ] ติดตั้ง Sentry MCP

```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

```json
{
  "sentry": {
    "type": "http",
    "url": "https://mcp.sentry.dev/mcp"
  }
}
```

---

### 5. Figma (Design)

> เข้าถึง design files, components, design tokens

- [ ] ติดตั้ง Figma MCP

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

```json
{
  "figma": {
    "type": "http",
    "url": "https://mcp.figma.com/mcp"
  }
}
```

---

### 6. Notion

> อ่าน/เขียน pages, query databases, จัดการ properties

- [ ] ติดตั้ง Notion MCP

```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

```json
{
  "notion": {
    "type": "http",
    "url": "https://mcp.notion.com/mcp"
  }
}
```

---

### 7. Stripe (Payments)

> ดู payments, customers, invoices, วิเคราะห์ transactions

- [ ] ติดตั้ง Stripe MCP

```bash
claude mcp add --transport http stripe https://mcp.stripe.com
```

```json
{
  "stripe": {
    "type": "http",
    "url": "https://mcp.stripe.com"
  }
}
```

> ใช้ `/mcp` ใน Claude Code เพื่อ authenticate ผ่าน OAuth — ไม่ต้องใส่ API key ใน config

---

### 8. Asana (Project Management)

> จัดการ tasks, projects, teams, ติดตามงาน

- [ ] ติดตั้ง Asana MCP

```bash
claude mcp add --transport sse asana https://mcp.asana.com/sse
```

```json
{
  "asana": {
    "type": "sse",
    "url": "https://mcp.asana.com/sse"
  }
}
```

---

## Local MCP Servers

MCP servers ที่รันบนเครื่อง ต้องมี `npx` (Node.js) หรือ `uvx` (Python)

### ข้อกำหนดเบื้องต้น

- [ ] ติดตั้ง Node.js (>= 18) และ npm
- [ ] ติดตั้ง Python (>= 3.10) และ uv (ถ้าใช้ uvx servers)

---

### 1. Filesystem

> อ่าน/เขียนไฟล์, สร้าง directory, ค้นหาไฟล์

> ⚠️ **ซ้ำกับ built-in** — Claude Code / OpenCode มี tools นี้อยู่แล้ว ดู [เปรียบเทียบ MCP vs Built-in](#mcp-ตัวไหนจำเป็น-ตัวไหนซ้ำกับ-built-in)

- [ ] ติดตั้ง Filesystem MCP

```bash
claude mcp add --transport stdio filesystem -- npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/dir
```

```json
{
  "filesystem": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]
  }
}
```

> เปลี่ยน `/path/to/allowed/dir` เป็น directory ที่ต้องการให้เข้าถึง

---

### 2. Memory / Knowledge Graph

> จำข้อมูลข้าม conversation, สร้าง knowledge graph

- [ ] ติดตั้ง Memory MCP

```bash
claude mcp add --transport stdio memory -- npx -y @modelcontextprotocol/server-memory
```

```json
{
  "memory": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-memory"]
  }
}
```

---

### 3. PostgreSQL / Database

> query databases, ดู schema, จัดการ tables

- [ ] ติดตั้ง Database MCP

```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://user:password@host:5432/database"
```

```json
{
  "db": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@bytebase/dbhub", "--dsn", "postgresql://user:password@host:5432/database"]
  }
}
```

> เปลี่ยน DSN ให้ตรงกับ database ของคุณ (รองรับ PostgreSQL, MySQL, SQLite)

---

### 4. Playwright (Browser Automation)

> ควบคุม browser, กรอกฟอร์ม, ถ่ายภาพหน้าจอ, scrape ข้อมูล

- [ ] ติดตั้ง Playwright MCP

```bash
claude mcp add --transport stdio playwright -- npx -y @playwright/mcp@latest
```

```json
{
  "playwright": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@playwright/mcp@latest"]
  }
}
```

---

### 5. Git

> อ่าน git log, diff, branches, commits

> ⚠️ **ซ้ำกับ built-in** — Claude Code / OpenCode มี tools นี้อยู่แล้ว ดู [เปรียบเทียบ MCP vs Built-in](#mcp-ตัวไหนจำเป็น-ตัวไหนซ้ำกับ-built-in)

- [ ] ติดตั้ง Git MCP

```bash
claude mcp add --transport stdio git -- npx -y @modelcontextprotocol/server-git /path/to/repo
```

```json
{
  "git": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-git", "/path/to/repo"]
  }
}
```

---

### 6. Sequential Thinking

> คิดแบบมีขั้นตอน, วิเคราะห์ปัญหาซับซ้อน, วางแผน

- [ ] ติดตั้ง Sequential Thinking MCP

```bash
claude mcp add --transport stdio sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking
```

```json
{
  "sequential-thinking": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  }
}
```

---

### 7. Docker

> จัดการ containers, images, networks, build & deploy

> ⚠️ **ซ้ำกับ built-in** — Claude Code / OpenCode มี tools นี้อยู่แล้ว ดู [เปรียบเทียบ MCP vs Built-in](#mcp-ตัวไหนจำเป็น-ตัวไหนซ้ำกับ-built-in)

- [ ] ติดตั้ง Docker MCP

```bash
claude mcp add --transport stdio docker -- npx -y @modelcontextprotocol/server-docker
```

```json
{
  "docker": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-docker"]
  }
}
```

---

### 8. Fetch (HTTP Client)

> ดึงเนื้อหาเว็บ, แปลง HTML เป็น markdown

> ⚠️ **ซ้ำกับ built-in** — Claude Code / OpenCode มี tools นี้อยู่แล้ว ดู [เปรียบเทียบ MCP vs Built-in](#mcp-ตัวไหนจำเป็น-ตัวไหนซ้ำกับ-built-in)

- [ ] ติดตั้ง Fetch MCP

```bash
claude mcp add --transport stdio fetch -- npx -y @modelcontextprotocol/server-fetch
```

```json
{
  "fetch": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-fetch"]
  }
}
```

---

### 9. Brave Search

> ค้นหาเว็บ, ข่าว, บทความวิชาการ

- [ ] ติดตั้ง Brave Search MCP
- [ ] ได้ API key จาก Brave Search API แล้ว

```bash
claude mcp add --transport stdio --env BRAVE_API_KEY=YOUR_KEY brave-search \
  -- npx -y @modelcontextprotocol/server-brave-search
```

```json
{
  "brave-search": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-brave-search"],
    "env": {
      "BRAVE_API_KEY": "YOUR_KEY"
    }
  }
}
```

---

### 10. Time / Timezone

> แปลง timezone, ดูเวลาปัจจุบัน

> ⚠️ **ซ้ำกับ built-in** — Claude Code / OpenCode มี tools นี้อยู่แล้ว ดู [เปรียบเทียบ MCP vs Built-in](#mcp-ตัวไหนจำเป็น-ตัวไหนซ้ำกับ-built-in)

- [ ] ติดตั้ง Time MCP

```bash
claude mcp add --transport stdio time -- npx -y @modelcontextprotocol/server-time
```

```json
{
  "time": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-time"]
  }
}
```

---

## ตัวอย่าง Config แบบครบชุด

ตัวอย่างเฉพาะ MCP ที่ **แนะนำ** สำหรับ Claude Code / OpenCode (ไม่รวมตัวที่ซ้ำกับ built-in)

### Claude Code (`.mcp.json`)

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "slack": {
      "type": "http",
      "url": "https://mcp.slack.com/mcp"
    },
    "linear": {
      "type": "http",
      "url": "https://mcp.linear.app/mcp"
    },
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "sequential-thinking": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

### OpenCode (`opencode.jsonc`)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "github": {
      "type": "remote",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "slack": {
      "type": "remote",
      "url": "https://mcp.slack.com/mcp"
    },
    "linear": {
      "type": "remote",
      "url": "https://mcp.linear.app/mcp"
    },
    "sentry": {
      "type": "remote",
      "url": "https://mcp.sentry.dev/mcp"
    },
    "playwright": {
      "type": "local",
      "command": ["npx", "-y", "@playwright/mcp@latest"]
    },
    "sequential-thinking": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

---

## การจัดการและตรวจสอบ

### หลังติดตั้งเสร็จ

- [ ] รัน `claude mcp list` เพื่อดู servers ทั้งหมด
- [ ] รัน `/mcp` ใน Claude Code เพื่อ authenticate remote servers
- [ ] ทดสอบแต่ละ server ว่าทำงานได้ปกติ

### คำสั่งจัดการ

```bash
# ดู servers ทั้งหมด
claude mcp list

# ดูรายละเอียด server
claude mcp get <name>

# ลบ server
claude mcp remove <name>

# Reset OAuth approvals
claude mcp reset-project-choices
```

---

## แหล่งค้นหา MCP Servers เพิ่มเติม

- Official Registry: https://registry.modelcontextprotocol.io
- GitHub Official Servers: https://github.com/modelcontextprotocol/servers
- MCP Servers Directory: https://mcpservers.com
- Awesome MCP Servers: https://github.com/wong2/awesome-mcp-servers

---

## Troubleshooting

### MCP server ไม่ connect

```bash
# ดู status ของทุก server
claude mcp list

# ดู log ของ server ที่มีปัญหา
claude mcp get <name>
```

**สาเหตุที่พบบ่อย:**
- `npx` ยังไม่ได้ติดตั้ง → ติดตั้ง Node.js ก่อน
- Package ยังไม่เคย download → รัน `npx -y <package>` ด้วยตัวเองครั้งแรกเพื่อให้ download เสร็จ
- Port ถูกใช้งาน → ตรวจสอบด้วย `lsof -i :<port>`

### OAuth หมดอายุ (Remote MCP)

```bash
# Re-authenticate ใน Claude Code
/mcp
# เลือก server ที่ต้องการ → Authenticate

# หรือ reset ทั้งหมด
claude mcp reset-project-choices
```

### npx ช้ามาก (Local MCP)

**สาเหตุ:** `npx -y` จะ download package ใหม่ทุกครั้ง

**วิธีแก้:** ติดตั้ง package แบบ global แทน
```bash
npm install -g @playwright/mcp@latest
# แล้วเปลี่ยน config จาก npx เป็น command ตรง
```

```json
{
  "playwright": {
    "type": "stdio",
    "command": "playwright-mcp"
  }
}
```

### Windows: npx ไม่ทำงาน

ใช้ `cmd /c` ครอบ command:

```bash
claude mcp add --transport stdio playwright -- cmd /c npx -y @playwright/mcp@latest
```

```json
{
  "playwright": {
    "type": "stdio",
    "command": "cmd",
    "args": ["/c", "npx", "-y", "@playwright/mcp@latest"]
  }
}
```

---

## Tips

1. **ใช้ project scope** สำหรับ servers ที่ทีมใช้ร่วมกัน (commit `.mcp.json`)
2. **ใช้ local/user scope** สำหรับ servers ส่วนตัว
3. **อย่าใส่ API keys** ใน `.mcp.json` ที่ commit - ใช้ env variables แทน
4. **Windows**: ใช้ `cmd /c npx ...` แทน `npx ...` โดยตรง
