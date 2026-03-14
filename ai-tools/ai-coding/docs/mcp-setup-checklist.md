# MCP Setup Checklist สำหรับ AI Coding Agent

> Checklist สำหรับติดตั้ง MCP (Model Context Protocol) servers ที่ใช้บ่อย
> ใช้ได้กับ Claude Code, OpenCode และ tools อื่นๆ ที่รองรับ MCP

---

## สารบัญ

- [วิธีติดตั้ง](#วิธีติดตั้ง)
- [Remote MCP Servers](#remote-mcp-servers)
- [Local MCP Servers](#local-mcp-servers)
- [การจัดการและตรวจสอบ](#การจัดการและตรวจสอบ)

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

---

## Remote MCP Servers

MCP servers ที่เชื่อมต่อผ่าน URL ไม่ต้องติดตั้งอะไรเพิ่ม

### 1. GitHub

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

- [ ] ติดตั้ง Stripe MCP

```bash
claude mcp add --transport http stripe https://mcp.stripe.com
```

```json
{
  "stripe": {
    "type": "http",
    "url": "https://mcp.stripe.com",
    "headers": {
      "Authorization": "Bearer sk_live_YOUR_API_KEY"
    }
  }
}
```

---

### 8. Asana (Project Management)

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

## ตัวอย่าง `.mcp.json` แบบครบชุด

ไฟล์นี้วางที่ root ของ project แล้ว commit เข้า version control ได้เลย

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
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "fetch": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
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

## Tips

1. **ใช้ project scope** สำหรับ servers ที่ทีมใช้ร่วมกัน (commit `.mcp.json`)
2. **ใช้ local/user scope** สำหรับ servers ส่วนตัว
3. **อย่าใส่ API keys** ใน `.mcp.json` ที่ commit - ใช้ env variables แทน
4. **Windows**: ใช้ `cmd /c npx ...` แทน `npx ...` โดยตรง
