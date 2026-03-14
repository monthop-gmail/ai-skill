const express = require("express");
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
const prefix = process.env.BULL_PREFIX || "bull";

// สร้าง queue instances สำหรับ monitoring
const emailQueue = new Queue("email", { connection, prefix });
const reportQueue = new Queue("report", { connection, prefix });
const imageQueue = new Queue("image-resize", { connection, prefix });

// ตั้งค่า Bull Board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/");

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(reportQueue),
    new BullMQAdapter(imageQueue),
  ],
  serverAdapter,
});

const app = express();
app.use("/", serverAdapter.getRouter());

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Bull Board UI on :${port}`));
