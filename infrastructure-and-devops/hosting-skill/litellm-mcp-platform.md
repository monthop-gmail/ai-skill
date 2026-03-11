# Building AI Tools Platform with LiteLLM MCP

สร้าง platform คล้าย **Smithery.ai** ด้วย LiteLLM + MCP (Model Context Protocol)

## MCP (Model Context Protocol) คืออะไร

MCP คือ protocol มาตรฐานสำหรับเชื่อมต่อ AI models กับ:
- **Tools** - Functions ที่ AI เรียกใช้ได้ (API, database, etc.)
- **Resources** - ข้อมูลที่ AI เข้าถึงได้ (files, databases, APIs)
- **Prompts** - Template prompts ที่ใช้ซ้ำได้

## LiteLLM + MCP Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  - MCP Tools Directory                                   │
│  - Tool Search & Discovery                               │
│  - One-click Deploy                                        │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              API Layer (LiteLLM Proxy)                   │
│  - Unified API for all LLM providers                     │
│  - MCP Server Integration                                │
│  - Authentication & Rate Limiting                        │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              MCP Servers (Tool Providers)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ Database │  │  APIs    │  │  Files   │               │
│  │  Server  │  │  Server  │  │  Server  │               │
│  └──────────┘  └──────────┘  └──────────┘               │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              LLM Providers (via LiteLLM)                 │
│  OpenAI │ Anthropic │ Google │ Azure │ Ollama │ etc.    │
└─────────────────────────────────────────────────────────┘
```

## Components ที่ต้องมี

### 1. MCP Tools Registry
```python
# tools/registry.py
MCP_TOOLS = {
    "database": {
        "name": "PostgreSQL Tool",
        "description": "Query PostgreSQL database",
        "server": "mcp-server-postgres",
        "config": {...}
    },
    "filesystem": {
        "name": "File System Tool",
        "description": "Read/write files",
        "server": "mcp-server-filesystem",
        "config": {...}
    },
    "api": {
        "name": "REST API Tool",
        "description": "Call external APIs",
        "server": "mcp-server-http",
        "config": {...}
    }
}
```

### 2. LiteLLM Proxy with MCP
```yaml
# config.yaml
litellm_settings:
  model_list:
    - model_name: gpt-4
      litellm_params:
        model: openai/gpt-4
        api_key: os.environ/OPENAI_KEY

mcp_settings:
  servers:
    postgres:
      command: "npx"
      args: ["-y", "mcp-server-postgres"]
      env:
        DATABASE_URL: "postgresql://..."
    filesystem:
      command: "npx"
      args: ["-y", "mcp-server-filesystem"]
      env:
        ALLOWED_PATHS: "/data"
```

### 3. Tool Discovery API
```python
# app.py (FastAPI)
from fastapi import FastAPI
from mcp import ClientSession

app = FastAPI()

@app.get("/api/tools")
async def list_tools():
    """Get all available MCP tools"""
    return {"tools": list(MCP_TOOLS.keys())}

@app.get("/api/tools/{tool_name}")
async def get_tool(tool_name: str):
    """Get tool details and config"""
    return MCP_TOOLS[tool_name]

@app.post("/api/tools/{tool_name}/deploy")
async def deploy_tool(tool_name: str, config: dict):
    """Deploy tool to user's environment"""
    # Deploy to Fly.io, Render, etc.
    pass
```

## Hosting Architecture

### Option 1: Centralized Platform (แบบ Smithery)

```
┌─────────────────────────────────────┐
│     Platform (Cloudflare Pages)     │
│     - Frontend (Next.js)            │
│     - Tool Registry                 │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  API (Fly.io - LiteLLM + MCP)       │
│  - Proxy Server                     │
│  - MCP Servers                      │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Database (Supabase/Neon)           │
│  - Tool Configs                     │
│  - User Preferences                 │
└─────────────────────────────────────┘
```

### Option 2: Self-Hosted per User

```
User's Environment
┌─────────────────────────────────────┐
│  LiteLLM Proxy (Docker)             │
│  + MCP Servers                      │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Platform (Central)                 │
│  - Tool Discovery                   │
│  - One-click Deploy                 │
└─────────────────────────────────────┘
```

## Recommended Stack

| Component | Technology | Hosting |
|-----------|------------|---------|
| **Frontend** | Next.js | Vercel / Cloudflare Pages |
| **API/Proxy** | LiteLLM + FastAPI | Fly.io |
| **MCP Servers** | Node.js/Python | Fly.io (same as API) |
| **Database** | PostgreSQL | Supabase / Neon |
| **Auth** | NextAuth / Clerk | Built-in |
| **Deploy** | Docker + Fly.io API | Automated |

## Quick Start

### 1. Setup LiteLLM with MCP

```bash
# Install LiteLLM
pip install litellm[proxy]

# Run with MCP config
litellm --config config.yaml
```

### 2. Create MCP Server

```typescript
// mcp-server-example.ts
import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';

const server = new Server({
  name: 'example-tool',
  version: '1.0.0'
});

server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'example_tool',
    description: 'Example tool',
    inputSchema: {...}
  }]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
```

### 3. Deploy to Fly.io

```bash
# Create app
flyctl apps create my-mcp-platform

# Add secrets
flyctl secrets set OPENAI_API_KEY=sk-...

# Deploy
flyctl deploy
```

## Features คล้าย Smithery

| Feature | Implementation |
|---------|----------------|
| **Tool Discovery** | API endpoint + Frontend search |
| **One-click Deploy** | Fly.io API + Docker templates |
| **Tool Ratings** | Database + User reviews |
| **Categories** | Tag system in registry |
| **API Keys** | LiteLLM virtual keys |
| **Usage Analytics** | LiteLLM spending tracking |

## Example: Tool Deployment Flow

```
1. User browses tools on platform
2. User clicks "Deploy" on PostgreSQL Tool
3. Platform creates Fly.io app with:
   - LiteLLM Proxy
   - MCP PostgreSQL Server
   - Database connection
4. Platform returns:
   - API endpoint
   - API key
   - Configuration guide
5. User connects to their AI assistant
```

## Cost Estimate

| Component | Free Tier | Paid (Small) |
|-----------|-----------|--------------|
| **Frontend (Vercel)** | ✅ Free | $20/month |
| **API (Fly.io)** | ~$2 credit | $10/month |
| **Database (Supabase)** | 500MB free | $25/month |
| **Total** | **~$0-2** | **~$35-55/month** |

## Links

- [LiteLLM MCP Docs](https://docs.litellm.ai/docs/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Smithery.ai](https://smithery.ai)
- [MCP Servers List](https://github.com/search?q=mcp-server)
- [Fly.io](https://fly.io)
- [Supabase](https://supabase.com)

---

[← กลับไปหน้าหลัก](./README.md) | [LiteLLM Hosting](./litellm-hosting.md)
