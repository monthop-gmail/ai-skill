const express = require("express");
const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
const prefix = process.env.BULL_PREFIX || "bull";

// สร้าง queues
const emailQueue = new Queue("email", { connection, prefix });
const reportQueue = new Queue("report", { connection, prefix });
const imageQueue = new Queue("image-resize", { connection, prefix });

const app = express();
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ส่ง email job เข้า queue
app.post("/api/email", async (req, res) => {
  const { to, subject, body } = req.body;
  const job = await emailQueue.add("send", { to, subject, body }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  });
  res.json({ jobId: job.id, queue: "email" });
});

// สร้าง report job (ใช้เวลานาน)
app.post("/api/report", async (req, res) => {
  const { type, params } = req.body;
  const job = await reportQueue.add("generate", { type, params }, {
    attempts: 2,
    backoff: { type: "fixed", delay: 5000 },
    removeOnComplete: { age: 3600, count: 100 },
    removeOnFail: { age: 86400 },
  });
  res.json({ jobId: job.id, queue: "report" });
});

// Resize image job
app.post("/api/image-resize", async (req, res) => {
  const { url, sizes } = req.body;
  const job = await imageQueue.add("resize", { url, sizes: sizes || [200, 400, 800] }, {
    priority: 1,
    attempts: 3,
  });
  res.json({ jobId: job.id, queue: "image-resize" });
});

// ดูสถานะ job
app.get("/api/job/:queue/:id", async (req, res) => {
  const queues = { email: emailQueue, report: reportQueue, "image-resize": imageQueue };
  const queue = queues[req.params.queue];
  if (!queue) return res.status(404).json({ error: "Queue not found" });

  const job = await queue.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });

  const state = await job.getState();
  res.json({ id: job.id, state, data: job.data, progress: job.progress, result: job.returnvalue });
});

// ดูสรุปทุก queue
app.get("/api/queues", async (req, res) => {
  const stats = {};
  for (const [name, queue] of Object.entries({ email: emailQueue, report: reportQueue, "image-resize": imageQueue })) {
    const counts = await queue.getJobCounts();
    stats[name] = counts;
  }
  res.json(stats);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on :${port}`));
