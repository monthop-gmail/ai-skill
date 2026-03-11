# Knowledge Work Plugins

> ดูเพิ่มเติม: https://github.com/anthropics/knowledge-work-plugins

## สรุปภาษาไทย

**Knowledge Work Plugins** คือชุด plugin โอเพ่นซอร์สจาก Anthropic ที่ออกแบบมาเพื่อเปลี่ยน Claude ให้เป็นผู้เชี่ยวชาญเฉพาะด้านสำหรับแต่ละทีมหรือบทบาทในองค์กร

### ทำงานอย่างไร

แต่ละ plugin ประกอบด้วย:
- **Skills** — ความรู้เฉพาะด้านที่ Claude ดึงมาใช้โดยอัตโนมัติ
- **Commands** — คำสั่ง slash ที่เรียกใช้ได้ตรงๆ เช่น `/sales:call-prep`
- **Connectors** — เชื่อมต่อ Claude กับเครื่องมือภายนอก เช่น Slack, Notion, Jira ผ่าน MCP

### Plugin ที่มีให้ใช้งาน

| Plugin | ใช้งานสำหรับ |
|--------|-------------|
| `productivity` | จัดการงาน ปฏิทิน และ workflow ประจำวัน |
| `sales` | ค้นหาลูกค้า เตรียมการประชุม ร่าง outreach |
| `customer-support` | จัดการ ticket ร่างตอบกลับ สร้าง knowledge base |
| `product-management` | เขียน spec วางแผน roadmap สรุป user research |
| `marketing` | สร้างคอนเทนต์ วางแผนแคมเปญ รายงานผล |
| `legal` | รีวิวสัญญา ประเมินความเสี่ยง จัดการ compliance |
| `finance` | เตรียม journal entries วิเคราะห์ตัวเลขการเงิน |
| `data` | Query ข้อมูล เขียน SQL สร้าง dashboard |
| `enterprise-search` | ค้นหาข้อมูลทั่วทั้งองค์กรในที่เดียว |
| `bio-research` | วิจัยชีววิทยา เชื่อมต่อ PubMed, ChEMBL ฯลฯ |
| `cowork-plugin-management` | สร้างและปรับแต่ง plugin ใหม่สำหรับองค์กร |

### วิธีติดตั้ง (Claude Code)

```bash
# เพิ่ม marketplace
claude plugin marketplace add anthropics/knowledge-work-plugins

# ติดตั้ง plugin ที่ต้องการ
claude plugin install sales@knowledge-work-plugins
```
