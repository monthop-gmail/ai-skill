const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
const prefix = process.env.BULL_PREFIX || "bull";
const concurrency = parseInt(process.env.CONCURRENCY) || 5;

// ─── Email Worker ────────────────────────────────────
new Worker("email", async (job) => {
  const { to, subject, body } = job.data;
  console.log(`[email] Sending to ${to}: ${subject}`);

  // จำลองส่ง email (แทนที่ด้วย nodemailer, SendGrid, etc.)
  await sleep(1000);

  console.log(`[email] Sent to ${to}`);
  return { sent: true, to };
}, { connection, prefix, concurrency });

// ─── Report Worker ───────────────────────────────────
new Worker("report", async (job) => {
  const { type, params } = job.data;
  console.log(`[report] Generating ${type} report...`);

  // จำลองสร้าง report (ใช้เวลานาน)
  const steps = 5;
  for (let i = 1; i <= steps; i++) {
    await sleep(2000);
    await job.updateProgress(Math.round((i / steps) * 100));
    console.log(`[report] Progress: ${Math.round((i / steps) * 100)}%`);
  }

  const url = `/reports/${type}-${Date.now()}.pdf`;
  console.log(`[report] Done: ${url}`);
  return { url, type };
}, { connection, prefix, concurrency: 2 });

// ─── Image Resize Worker ─────────────────────────────
new Worker("image-resize", async (job) => {
  const { url, sizes } = job.data;
  console.log(`[image] Resizing ${url} to ${sizes.join(", ")}px`);

  const results = [];
  for (const size of sizes) {
    await sleep(500);
    results.push({ size, path: `/images/${size}/${Date.now()}.jpg` });
    await job.updateProgress(Math.round((results.length / sizes.length) * 100));
  }

  console.log(`[image] Done: ${results.length} sizes`);
  return { results };
}, { connection, prefix, concurrency: 3 });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log(`Workers started (concurrency: ${concurrency})`);
