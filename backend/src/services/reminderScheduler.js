const cron = require("node-cron");
const User = require("../models/User");
const { sendStreakReminderEmail } = require("./emailService");

/**
 * Chạy cron job gửi email nhắc nhở chuỗi ngày học lúc 10:00 sáng
 * mỗi ngày theo giờ Việt Nam (UTC+7)
 */
function startReminderScheduler() {
  // "0 10 * * *" với timezone "Asia/Ho_Chi_Minh" = 10:00 AM ICT
  cron.schedule(
    "0 10 * * *",
    async () => {
      console.log(`[Reminder] Bắt đầu gửi email nhắc nhở lúc ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`);

      try {
        // Lấy tất cả user đã bật nhắc nhở
        const users = await User.find(
          { streakReminderEnabled: true },
          { email: 1, fullname: 1, study_streak: 1 }
        ).lean();

        if (users.length === 0) {
          console.log("[Reminder] Không có user nào bật nhắc nhở.");
          return;
        }

        let sent = 0;
        let failed = 0;

        // Gửi tuần tự để tránh rate limit của email provider
        for (const user of users) {
          try {
            await sendStreakReminderEmail(
              user.email,
              user.fullname,
              user.study_streak || 0
            );
            sent++;
          } catch (err) {
            failed++;
            console.error(`[Reminder] Lỗi gửi email cho ${user.email}:`, err.message);
          }
        }

        console.log(`[Reminder] Hoàn thành: ${sent} thành công, ${failed} thất bại.`);
      } catch (err) {
        console.error("[Reminder] Lỗi khi chạy scheduler:", err.message);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    }
  );

}

module.exports = { startReminderScheduler };
