# Hosting Platforms Comparison

## ตารางเปรียบเทียบ Hosting Platforms

| Platform | Free Tier | เหมาะกับ | ข้อดี | ข้อจำกัด |
|----------|-----------|----------|-------|----------|
| **Render** | ✅ มี | Backend, API, DB | ใช้งานง่าย, มี PostgreSQL free | Free tier sleep หลัง 15 นาที idle |
| **Vercel** | ✅ มี | Frontend, Next.js | Deploy เร็วมาก, CI/CD อัตโนมัติ | ไม่เหมาะรัน server ยาวๆ |
| **Netlify** | ✅ มี | Static sites, JAMstack | Forms, Functions встроенные | คล้าย Vercel |
| **Railway** | ❌ ไม่มีแล้ว | Full-stack | ง่าย, มี database | ต้องจ่าย $5+/เดือน |
| **Fly.io** | ✅ มี (~$2 credit) | Docker apps | รันใกล้ user, flexible | ต้องใส่บัตรเครดิต |
| **Cloudflare Pages** | ✅ มี | Static, Serverless Functions | ฟรีดี, CDN เร็ว | Functions จำกัด duration |
| **Cloudflare Workers** | ✅ 100k req/day | Serverless API | เร็วมาก, edge computing | จำกัด CPU time |
| **AWS** | ✅ 12 เดือน free tier | Enterprise | ครบทุกอย่าง | ซับซ้อน, แพงถ้าใช้เยอะ |
| **Google Cloud Run** | ✅ 2M req/month | Containers | Auto-scale, จ่ายตามใช้ | ต้องมีบัตรเครดิต |
| **Heroku** | ❌ ไม่มี | Full-stack | ง่าย, stable | เริ่มต้น $7/เดือน |
| **DigitalOcean** | ❌ ไม่มี | VPS, Apps | ราคาชัดเจน | ต้องจัดการ server เอง |
| **Supabase** | ✅ มี 500MB DB | Backend + DB | มี Auth, Realtime | จำกัดขนาด DB |
| **Replit** | ✅ มี | Prototyping | เขียน code ใน browser | Public project, จำกัด resources |

## แนะนำสำหรับ LINE Bot

| ลำดับ | Platform | เหตุผล |
|-------|----------|--------|
| 1 | **Cloudflare Workers/Pages** | ฟรีที่สุด, เร็ว, มี CDN |
| 2 | **Render** | ง่าย, มี database ในตัว |
| 3 | **Fly.io** | Control มากขึ้น, รัน Docker ได้ |

## Links

- [Render](https://render.com)
- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [Railway](https://railway.app)
- [Fly.io](https://fly.io)
- [Cloudflare Pages](https://pages.cloudflare.com)
- [Cloudflare Workers](https://workers.cloudflare.com)
- [AWS](https://aws.amazon.com)
- [Google Cloud](https://cloud.google.com)
- [Heroku](https://heroku.com)
- [DigitalOcean](https://digitalocean.com)
- [Supabase](https://supabase.com)
- [Replit](https://replit.com)
