const { proxyActivities, sleep } = require("@temporalio/workflow");

// proxy activities — Temporal จัดการ retry, timeout ให้
const {
  sendEmail,
  generateReport,
  processPayment,
  updateInventory,
  sendNotification,
} = proxyActivities({
  startToCloseTimeout: "30s",
  retry: { maximumAttempts: 3 },
});

// ─── Workflow 1: Order Processing ────────────────────
// สั่งซื้อ → จ่ายเงิน → ตัดสต็อก → ส่ง email → แจ้งเตือน
// ถ้า step ไหน fail → Temporal retry อัตโนมัติ
// ถ้า server ล่มระหว่าง workflow → กลับมาทำต่อจากจุดที่ค้าง
async function orderWorkflow(order) {
  // Step 1: Process payment
  const payment = await processPayment(order.id, order.total);

  // Step 2: Update inventory
  await updateInventory(order.items);

  // Step 3: Send confirmation email
  await sendEmail(
    order.customerEmail,
    `Order #${order.id} confirmed`,
    `Payment: ${payment.txId}`
  );

  // Step 4: Notify team
  await sendNotification("slack", `New order #${order.id} - $${order.total}`);

  return { orderId: order.id, paymentTx: payment.txId, status: "completed" };
}

// ─── Workflow 2: Scheduled Report ────────────────────
// สร้าง report → ส่ง email → รอ 24 ชม. → ทำอีกรอบ (วนซ้ำ)
async function scheduledReportWorkflow(config) {
  while (true) {
    const report = await generateReport(config.type, config.params);
    await sendEmail(
      config.recipient,
      `${config.type} Report Ready`,
      `Download: ${report.url}`
    );
    // รอ interval ก่อนรอบถัดไป (Temporal จำได้แม้ server restart)
    await sleep(config.intervalMs || 24 * 60 * 60 * 1000);
  }
}

// ─── Workflow 3: Onboarding (multi-step, parallel) ───
// สร้าง account → (ส่ง welcome email + แจ้ง team) พร้อมกัน
async function onboardingWorkflow(user) {
  // Step 1: sequential
  await sendNotification("system", `Creating account for ${user.email}`);

  // Step 2: parallel — ทำพร้อมกัน
  const [emailResult, slackResult] = await Promise.all([
    sendEmail(user.email, "Welcome!", `Hi ${user.name}, welcome to the team!`),
    sendNotification("slack", `New team member: ${user.name} (${user.email})`),
  ]);

  // Step 3: wait 3 days then send follow-up
  await sleep(3 * 24 * 60 * 60 * 1000);
  await sendEmail(user.email, "How's it going?", "Let us know if you need help!");

  return { user: user.email, emailSent: emailResult.sent, notified: slackResult.sent };
}

module.exports = {
  orderWorkflow,
  scheduledReportWorkflow,
  onboardingWorkflow,
};
