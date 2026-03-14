// ตัวอย่างการเรียก workflow จาก client (API service, script, etc.)
const { Client } = require("@temporalio/client");

async function main() {
  const client = new Client({
    connection: { address: process.env.TEMPORAL_ADDRESS || "temporal:7233" },
  });

  // ─── เรียก Order Workflow ──────────────────────────
  const orderHandle = await client.workflow.start("orderWorkflow", {
    taskQueue: "main-queue",
    workflowId: `order-${Date.now()}`,
    args: [{
      id: "ORD-001",
      total: 1500,
      customerEmail: "customer@example.com",
      items: [
        { sku: "ITEM-A", qty: 2 },
        { sku: "ITEM-B", qty: 1 },
      ],
    }],
  });
  console.log(`Order workflow started: ${orderHandle.workflowId}`);

  // รอผลลัพธ์
  const orderResult = await orderHandle.result();
  console.log("Order result:", orderResult);

  // ─── เรียก Scheduled Report (รันไปเรื่อยๆ) ────────
  const reportHandle = await client.workflow.start("scheduledReportWorkflow", {
    taskQueue: "main-queue",
    workflowId: "daily-sales-report",
    args: [{
      type: "sales",
      params: { region: "TH" },
      recipient: "manager@example.com",
      intervalMs: 24 * 60 * 60 * 1000, // ทุก 24 ชม.
    }],
  });
  console.log(`Report workflow started: ${reportHandle.workflowId}`);

  // ─── เรียก Onboarding ─────────────────────────────
  const onboardHandle = await client.workflow.start("onboardingWorkflow", {
    taskQueue: "main-queue",
    workflowId: `onboard-john`,
    args: [{ name: "John", email: "john@example.com" }],
  });
  console.log(`Onboarding workflow started: ${onboardHandle.workflowId}`);
}

main().catch(console.error);
