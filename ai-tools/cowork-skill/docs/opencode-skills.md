# OpenCode - Agent Skills

Agent skills ให้ OpenCode ค้นหา instructions ที่นำกลับมาใช้ซ้ำได้จาก repo หรือ home directory โดย Skills จะถูกโหลดผ่าน native `skill` tool เมื่อ agent ต้องการ

- Docs: https://opencode.ai/docs/skills/
- GitHub: https://github.com/anomalyco/opencode

---

## ตำแหน่งที่วางไฟล์

สร้างโฟลเดอร์ 1 ชื่อต่อ 1 skill แล้วใส่ `SKILL.md` ไว้ข้างใน:

| ประเภท | Path |
|--------|------|
| Project (opencode) | `.opencode/skills/<name>/SKILL.md` |
| Global (opencode) | `~/.config/opencode/skills/<name>/SKILL.md` |
| Project (claude-compat) | `.claude/skills/<name>/SKILL.md` |
| Global (claude-compat) | `~/.claude/skills/<name>/SKILL.md` |
| Project (agent-compat) | `.agents/skills/<name>/SKILL.md` |
| Global (agent-compat) | `~/.agents/skills/<name>/SKILL.md` |

---

## การค้นหา Skills (Discovery)

- **Project-local**: OpenCode จะ walk up จาก working directory จนถึง git worktree
- **Global**: โหลดจาก `~/.config/opencode/skills/*/SKILL.md` และ paths ที่รองรับ

---

## โครงสร้าง SKILL.md

ต้องมี YAML frontmatter ด้านบนเสมอ:

```yaml
---
name: git-release
description: Create consistent releases and changelogs
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: github
---

## What I do
- Draft release notes from merged PRs
- Propose a version bump
- Provide a copy-pasteable `gh release create` command

## When to use me
Use this when you are preparing a tagged release.
```

---

## Frontmatter Fields

| Field | Required | คำอธิบาย |
|-------|----------|----------|
| `name` | required | ชื่อ skill |
| `description` | required | คำอธิบายสำหรับให้ agent ตัดสินใจโหลด |
| `license` | optional | ประเภท license |
| `compatibility` | optional | เช่น `opencode` |
| `metadata` | optional | string-to-string map |

### กฎสำหรับ `name`

- 1–64 ตัวอักษร, ตัวพิมพ์เล็ก, ตัวเลข, คั่นด้วย `-`
- ไม่ขึ้นต้นหรือลงท้ายด้วย `-`
- ไม่มี `--` ติดกัน
- **ต้องตรงกับชื่อโฟลเดอร์** ที่เก็บ `SKILL.md`

Regex: `^[a-z0-9]+(-[a-z0-9]+)*$`

---

## Tool Description

OpenCode แสดง skills ที่มีอยู่ใน `skill` tool description:

```xml
<available_skills>
  <skill>
    <name>git-release</name>
    <description>Create consistent releases and changelogs</description>
  </skill>
</available_skills>
```

Agent โหลด skill ด้วย:

```
skill({ name: "git-release" })
```

---

## Permissions

ตั้งค่าใน `opencode.json`:

```json
{
  "permission": {
    "skill": {
      "*": "allow",
      "pr-review": "allow",
      "internal-*": "deny",
      "experimental-*": "ask"
    }
  }
}
```

| Permission | พฤติกรรม |
|------------|----------|
| `allow` | โหลดทันที |
| `deny` | ซ่อนจาก agent ไม่สามารถเข้าถึงได้ |
| `ask` | ถามผู้ใช้ก่อนโหลด |

รองรับ wildcard: `internal-*` จะ match กับ `internal-docs`, `internal-tools` ฯลฯ

---

## Override Permissions ต่อ Agent

**สำหรับ custom agents** (ใน agent frontmatter):

```yaml
---
permission:
  skill:
    "documents-*": "allow"
---
```

**สำหรับ built-in agents** (ใน `opencode.json`):

```json
{
  "agent": {
    "plan": {
      "permission": {
        "skill": {
          "internal-*": "allow"
        }
      }
    }
  }
}
```

---

## ปิดการใช้งาน Skill Tool

**สำหรับ custom agents:**

```yaml
---
tools:
  skill: false
---
```

**สำหรับ built-in agents:**

```json
{
  "agent": {
    "plan": {
      "tools": {
        "skill": false
      }
    }
  }
}
```

---

## Troubleshoot

ถ้า skill ไม่ขึ้น ให้ตรวจ:

1. ชื่อไฟล์เป็น `SKILL.md` ตัวพิมพ์ใหญ่ทั้งหมด
2. frontmatter มี `name` และ `description`
3. ชื่อ skill ไม่ซ้ำกันระหว่าง locations
4. เช็ค permissions ว่าไม่ได้ตั้งเป็น `deny`
