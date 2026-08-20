import cron from "node-cron";

const startDigestScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      console.log("⏰ Digest scheduler running...");

      // Next:
      // 1. Find users whose delivery time has arrived
      // 2. Load their preferences
      // 3. Get matching news
      // 4. Generate digest
      // 5. Send digest
    } catch (error) {
      console.error("Digest Scheduler Error:", error.message);
    }
  });

  console.log("📅 Digest scheduler started");
};

export default startDigestScheduler;
