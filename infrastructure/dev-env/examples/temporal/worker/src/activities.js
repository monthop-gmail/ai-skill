// Activities = ฟังก์ชันที่ทำงานจริง (เรียก API, DB, ส่ง email ฯลฯ)
// ถ้า fail → Temporal retry ให้อัตโนมัติ

async function sendEmail(to, subject, body) {
  console.log(`[activity] Sending email to ${to}: ${subject}`);
  // แทนที่ด้วย nodemailer, SendGrid, etc.
  await sleep(1000);
  return { sent: true, to, timestamp: new Date().toISOString() };
}

async function generateReport(type, params) {
  console.log(`[activity] Generating ${type} report...`);
  await sleep(5000);
  return { url: `/reports/${type}-${Date.now()}.pdf`, type };
}

async function processPayment(orderId, amount) {
  console.log(`[activity] Processing payment for order ${orderId}: $${amount}`);
  await sleep(2000);
  // จำลอง 10% chance fail (Temporal จะ retry ให้)
  if (Math.random() < 0.1) throw new Error("Payment gateway timeout");
  return { orderId, amount, status: "paid", txId: `tx_${Date.now()}` };
}

async function updateInventory(items) {
  console.log(`[activity] Updating inventory for ${items.length} items`);
  await sleep(1000);
  return { updated: items.length };
}

async function sendNotification(channel, message) {
  console.log(`[activity] Notify ${channel}: ${message}`);
  await sleep(500);
  return { channel, sent: true };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  sendEmail,
  generateReport,
  processPayment,
  updateInventory,
  sendNotification,
};
