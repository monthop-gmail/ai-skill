# LiteLLM Hosting Recommendations

LiteLLM เป็น Python proxy server ที่ต้องรันตลอดเวลา แนะนำ Platform ตามนี้:

## ตารางเปรียบเทียบ

| Platform | เหมาะกับ LiteLLM | เหตุผล | ราคา |
|----------|------------------|--------|------|
| **Fly.io** | ⭐⭐⭐⭐⭐ | รัน Docker, มี free allowance (~$2 credit), ใกล้ user | ~$0-5/เดือน |
| **Render** | ⭐⭐⭐⭐ | Deployง่าย, มี free tier | Free (sleep) / $7/เดือน |
| **Railway** | ⭐⭐⭐⭐ | ง่าย, มี template | ~$5/เดือน |
| **Google Cloud Run** | ⭐⭐⭐⭐ | จ่ายตามใช้, auto-scale | ~$0.0000025/request |
| **DigitalOcean App Platform** | ⭐⭐⭐ | ราคาชัดเจน | $5/เดือน |
| **AWS ECS/Fargate** | ⭐⭐ | Scalable แต่ซับซ้อน | จ่ายตามใช้ |

## แนะนำสำหรับ LiteLLM

### 1. Fly.io (แนะนำสุด)

```bash
# มี LiteLLM Docker image พร้อม
flyctl launch --image ghcr.io/berriai/litellm:main-latest
```

**ข้อดี:**
- Free allowance เพียงพอสำหรับ testing
- รันใกล้ user (เลือก region ได้)
- รัน Docker ได้โดยตรง

**ราคา:** ~$0-5/เดือน (ขึ้นอยู่กับ usage)

### 2. Render

**ข้อดี:**
- Deploy จาก Docker หรือ GitHub
- ใช้งานง่ายมาก

**ข้อจำกัด:**
- Free tier sleep หลัง 15 นาที idle (ไม่เหมาะ production)

**ราคา:** Free (sleep) / $7/เดือน (paid)

### 3. Google Cloud Run

**ข้อดี:**
- จ่ายตาม request จริง
- เหมาะสำหรับ traffic ไม่สม่ำเสมอ
- Auto-scale

**ข้อจำกัด:**
- ต้องมีบัตรเครดิต
- Cold start บางครั้ง

**ราคา:** ~$0.0000025/request

## สรุป

| Use Case | Platform แนะนำ | ราคาประมาณ |
|----------|----------------|-----------|
| **Testing/Development** | Fly.io | Free (~$2 credit) |
| **Production เล็ก** | Fly.io หรือ Render | $5-7/เดือน |
| **Production ใหญ่** | Google Cloud Run หรือ AWS | จ่ายตามใช้ |
| **Traffic ไม่สม่ำเสมอ** | Google Cloud Run | จ่ายตาม request |

## Quick Start: Deploy LiteLLM บน Fly.io

```bash
# 1. ติดตั้ง flyctl
curl -L https://fly.io/install.sh | sh

# 2. Login
flyctl auth login

# 3. Create app
flyctl launch --image ghcr.io/berriai/litellm:main-latest

# 4. ตั้งค่า environment variables
flyctl secrets set DATABASE_URL=your_db_url \
    MASTER_KEY=your_master_key

# 5. Deploy
flyctl deploy
```

## Links

- [LiteLLM Docs](https://docs.litellm.ai)
- [Fly.io](https://fly.io)
- [Render](https://render.com)
- [Google Cloud Run](https://cloud.google.com/run)
- [Railway](https://railway.app)

---

[← กลับไปหน้าหลัก](./README.md) | [ดูตารางเปรียบเทียบทั้งหมด](./hosting-comparison.md)
