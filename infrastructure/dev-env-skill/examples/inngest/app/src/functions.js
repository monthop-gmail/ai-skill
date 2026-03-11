const { inngest } = require("./inngest");

// ─── 1. Order Processing ─────────────────────────────
// trigger เมื่อ event "order/created" ถูกส่ง
// Inngest จัดการ retry, timeout, logging ให้หมด
const orderWorkflow = inngest.createFunction(
  {
    id: "order-process",
    retries: 3,
  },
  { event: "order/created" },
  async ({ event, step }) => {
    // Step 1: Process payment
    const payment = await step.run("process-payment", async () => {
      console.log(`Processing payment for order ${event.data.orderId}`);
      // แทนที่ด้วย Stripe, payment gateway จริง
      return { txId: `tx_${Date.now()}`, amount: event.data.total };
    });

    // Step 2: Update inventory
    await step.run("update-inventory", async () => {
      console.log(`Updating inventory for ${event.data.items.length} items`);
      return { updated: event.data.items.length };
    });

    // Step 3: Send confirmation email
    await step.run("send-confirmation", async () => {
      console.log(`Sending confirmation to ${event.data.email}`);
      // แทนที่ด้วย nodemailer, SendGrid, etc.
      return { sent: true };
    });

    // Step 4: Notify team
    await step.run("notify-team", async () => {
      console.log(`Notifying team: order ${event.data.orderId} completed`);
      return { notified: true };
    });

    return { orderId: event.data.orderId, paymentTx: payment.txId };
  }
);

// ─── 2. Scheduled Report (cron) ──────────────────────
// รันทุกวัน 06:00 UTC — ไม่ต้อง cron job แยก
const dailyReport = inngest.createFunction(
  { id: "daily-report" },
  { cron: "0 6 * * *" },
  async ({ step }) => {
    const data = await step.run("fetch-data", async () => {
      console.log("Fetching daily sales data...");
      return { totalSales: 42, revenue: 15000 };
    });

    await step.run("send-report", async () => {
      console.log(`Report: ${data.totalSales} sales, $${data.revenue} revenue`);
      // ส่ง email report
      return { sent: true };
    });

    return data;
  }
);

// ─── 3. User Onboarding (delay + parallel) ──────────
// sleep ได้นานเป็นวัน/สัปดาห์ — Inngest จำ state ได้
const onboardingWorkflow = inngest.createFunction(
  { id: "user-onboarding" },
  { event: "user/signed-up" },
  async ({ event, step }) => {
    // Step 1: Send welcome email
    await step.run("welcome-email", async () => {
      console.log(`Welcome email to ${event.data.email}`);
      return { sent: true };
    });

    // Step 2: Wait 1 day
    await step.sleep("wait-1-day", "1 day");

    // Step 3: Send tips email
    await step.run("tips-email", async () => {
      console.log(`Tips email to ${event.data.email}`);
      return { sent: true };
    });

    // Step 4: Wait 3 days
    await step.sleep("wait-3-days", "3 days");

    // Step 5: Send feedback request
    await step.run("feedback-email", async () => {
      console.log(`Feedback request to ${event.data.email}`);
      return { sent: true };
    });

    return { user: event.data.email, onboarded: true };
  }
);

// ─── 4. Fan-out: Process batch items in parallel ─────
// ส่ง event ย่อยหลายตัวพร้อมกัน
const batchProcessor = inngest.createFunction(
  {
    id: "batch-processor",
    concurrency: { limit: 10 },
  },
  { event: "batch/process" },
  async ({ event, step }) => {
    const items = event.data.items;

    // ใช้ step.sendEvent ส่ง event ย่อย → Inngest จัดการ parallel ให้
    await step.sendEvent("fan-out", items.map((item) => ({
      name: "batch/process-item",
      data: { item },
    })));

    return { dispatched: items.length };
  }
);

const batchItemProcessor = inngest.createFunction(
  {
    id: "batch-item-processor",
    retries: 3,
    concurrency: { limit: 5 },
  },
  { event: "batch/process-item" },
  async ({ event, step }) => {
    const result = await step.run("process", async () => {
      console.log(`Processing item: ${JSON.stringify(event.data.item)}`);
      return { processed: true, item: event.data.item };
    });

    return result;
  }
);

module.exports = {
  functions: [
    orderWorkflow,
    dailyReport,
    onboardingWorkflow,
    batchProcessor,
    batchItemProcessor,
  ],
};
