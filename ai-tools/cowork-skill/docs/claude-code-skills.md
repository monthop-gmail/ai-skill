# Claude Code - Agent Skills

Skills ขยายความสามารถของ Claude ด้วยการสร้างไฟล์ `SKILL.md` Claude จะโหลดมาใช้อัตโนมัติเมื่อเกี่ยวข้อง หรือเรียกตรงๆ ด้วย `/skill-name`

- Docs: https://docs.anthropic.com/en/docs/claude-code/skills
- GitHub: https://github.com/anthropics/claude-code

> **หมายเหตุ:** `.claude/commands/` และ `.claude/skills/` ทำงานเหมือนกัน แต่ Skills มีฟีเจอร์เพิ่มเติม เช่น supporting files, frontmatter, และ subagent execution

---

## ตำแหน่งที่วางไฟล์

| ระดับ | Path | ใช้ได้กับ |
|-------|------|----------|
| Enterprise | ผ่าน managed settings | ทุก user ในองค์กร |
| Personal | `~/.claude/skills/<name>/SKILL.md` | ทุก project |
| Project | `.claude/skills/<name>/SKILL.md` | เฉพาะ project นี้ |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | ที่ plugin เปิดใช้งาน |

- ถ้าชื่อซ้ำกัน: enterprise > personal > project
- Plugin ใช้ namespace `plugin-name:skill-name` จึงไม่ชนกัน

---

## โครงสร้างไฟล์

```
my-skill/
├── SKILL.md           # Main instructions (required)
├── template.md        # Template สำหรับให้ Claude กรอก
├── examples/
│   └── sample.md      # ตัวอย่าง output
└── scripts/
    └── validate.sh    # Script ที่ Claude รันได้
```

---

## โครงสร้าง SKILL.md

```yaml
---
name: explain-code
description: Explains code with visual diagrams and analogies. Use when explaining how code works or when user asks "how does this work?"
disable-model-invocation: true
allowed-tools: Read, Grep
context: fork
agent: Explore
---

เนื้อหา instructions ที่นี่...
```

---

## Frontmatter Fields

| Field | Required | คำอธิบาย |
|-------|----------|----------|
| `name` | No | ชื่อ skill (ใช้เป็น `/slash-command`) ถ้าไม่ระบุใช้ชื่อโฟลเดอร์ |
| `description` | Recommended | Claude ใช้ตัดสินใจว่าจะโหลดเมื่อไหร่ |
| `argument-hint` | No | hint ใน autocomplete เช่น `[issue-number]` |
| `disable-model-invocation` | No | `true` = เฉพาะ user เรียกด้วย `/name` เท่านั้น |
| `user-invocable` | No | `false` = ซ่อนจากเมนู `/` ให้แค่ Claude เรียก |
| `allowed-tools` | No | tools ที่ใช้ได้โดยไม่ต้องขออนุญาต |
| `model` | No | model ที่ใช้ขณะ skill นี้ active |
| `context` | No | `fork` = รันใน subagent แยก isolated |
| `agent` | No | subagent type เมื่อใช้ `context: fork` |
| `hooks` | No | hooks scoped ไว้กับ skill lifecycle นี้ |

---

## การควบคุม Invocation

| Frontmatter | User เรียกได้ | Claude เรียกได้ | โหลดเข้า context |
|-------------|:---:|:---:|---|
| (default) | Yes | Yes | description อยู่ใน context ตลอด |
| `disable-model-invocation: true` | Yes | No | description ไม่อยู่ใน context |
| `user-invocable: false` | No | Yes | description อยู่ใน context ตลอด |

---

## String Substitutions

| Variable | คำอธิบาย |
|----------|----------|
| `$ARGUMENTS` | argument ทั้งหมดที่ส่งมาตอน invoke |
| `$ARGUMENTS[N]` | argument ตำแหน่งที่ N (0-based) |
| `$N` | shorthand ของ `$ARGUMENTS[N]` |
| `${CLAUDE_SESSION_ID}` | session ID ปัจจุบัน |

### ตัวอย่าง

```yaml
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---

Fix GitHub issue $ARGUMENTS following our coding standards.
```

เรียกด้วย `/fix-issue 123` → Claude ได้รับ "Fix GitHub issue 123..."

---

## Dynamic Context Injection

ใช้ `` !`command` `` เพื่อรัน shell command ก่อนส่งให้ Claude (preprocessing ไม่ใช่ให้ Claude รัน):

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

---

## Run Skills ใน Subagent

เพิ่ม `context: fork` เพื่อรัน skill แบบ isolated (ไม่มี conversation history):

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:
1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

Built-in agents ได้แก่: `Explore`, `Plan`, `general-purpose` หรือ custom agent จาก `.claude/agents/`

---

## Permissions

**ปิดทุก skills:**

```
# ใน /permissions deny rules:
Skill
```

**Allow/Deny เฉพาะ skills:**

```
# Allow เฉพาะ
Skill(commit)
Skill(review-pr *)

# Deny เฉพาะ
Skill(deploy *)
```

Syntax: `Skill(name)` = exact match, `Skill(name *)` = prefix match

---

## Troubleshoot

| ปัญหา | วิธีแก้ |
|-------|---------|
| Skill ไม่ trigger | ตรวจ description ให้มี keywords ที่ user พูด / เรียกตรงด้วย `/skill-name` |
| Skill trigger บ่อยเกินไป | ทำ description ให้เฉพาะขึ้น หรือเพิ่ม `disable-model-invocation: true` |
| Claude มองไม่เห็น skills ทั้งหมด | Skills อาจเกิน character budget (2% ของ context window) ตรวจด้วย `/context` หรือตั้ง `SLASH_COMMAND_TOOL_CHAR_BUDGET` |
