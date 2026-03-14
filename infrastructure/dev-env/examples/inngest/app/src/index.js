const express = require("express");
const { serve } = require("inngest/express");
const { inngest } = require("./inngest");
const { functions } = require("./functions");

const app = express();
app.use(express.json());

// ─── Inngest endpoint (serve functions) ──────────────
app.use("/api/inngest", serve({ client: inngest, functions }));

// ─── Health ──────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ─── API: trigger events ─────────────────────────────

// สร้าง order → trigger order workflow
app.post("/api/order", async (req, res) => {
  const { orderId, email, total, items } = req.body;
  await inngest.send({
    name: "order/created",
    data: { orderId, email, total, items },
  });
  res.json({ status: "queued", orderId });
});

// สมัครสมาชิก → trigger onboarding
app.post("/api/signup", async (req, res) => {
  const { email, name } = req.body;
  await inngest.send({
    name: "user/signed-up",
    data: { email, name },
  });
  res.json({ status: "queued", email });
});

// ส่ง batch → trigger fan-out
app.post("/api/batch", async (req, res) => {
  const { items } = req.body;
  await inngest.send({
    name: "batch/process",
    data: { items },
  });
  res.json({ status: "queued", count: items.length });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App on :${port}`));
