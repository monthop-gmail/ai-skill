const { Worker } = require("@temporalio/worker");
const activities = require("./activities");

async function main() {
  const worker = await Worker.create({
    workflowsPath: require.resolve("./workflows"),
    activities,
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || "main-queue",
    connection: {
      address: process.env.TEMPORAL_ADDRESS || "temporal:7233",
    },
  });

  console.log(`Temporal worker started on queue: ${process.env.TEMPORAL_TASK_QUEUE}`);
  await worker.run();
}

main().catch((err) => {
  console.error("Worker failed:", err);
  process.exit(1);
});
