const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Gửi email chào mừng sau khi đăng ký thành công (dùng cho Google OAuth)
 * @param {string} toEmail
 * @param {string} fullname
 */
exports.sendWelcomeEmail = async (toEmail, fullname) => {
  const mailOptions = {
    from: `"SmartVideo" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🎉 Chào mừng bạn đến với SmartVideo!",
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Chào mừng đến SmartVideo</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,0.10);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:40px 40px 32px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 20px;margin-bottom:16px;">
                      <span style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;">Smart<span style="color:#93c5fd;">Video</span></span>
                    </div>
                    <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;line-height:1.3;">
                      Chào mừng bạn đã gia nhập! 🎉
                    </h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px 28px;">
                    <p style="font-size:16px;color:#374151;margin:0 0 16px;">
                      Xin chào <strong style="color:#2563eb;">${fullname}</strong>,
                    </p>
                    <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 20px;">
                      Tài khoản Google của bạn đã được <strong>đăng ký thành công</strong> vào SmartVideo —
                      nền tảng học tiếng Anh thông minh qua video AI.
                    </p>
                    <table cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:14px;padding:20px 24px;margin-bottom:28px;width:100%;">
                      <tr>
                        <td>
                          <p style="margin:0 0 10px;font-weight:700;color:#1e40af;font-size:14px;text-transform:uppercase;letter-spacing:.5px;">
                            Với SmartVideo bạn có thể:
                          </p>
                          <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:2;">
                            <li>🎬 Học từ vựng qua video YouTube yêu thích</li>
                            <li>🧠 Luyện phát âm & nghe hiểu với AI</li>
                            <li>📚 Lưu & ôn tập từ vựng thông minh</li>
                            <li>🏆 Theo dõi tiến trình học tập mỗi ngày</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard"
                             style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 40px;border-radius:50px;letter-spacing:.3px;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
                            Bắt đầu học ngay →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                      Email này được gửi tự động từ <strong>SmartVideo</strong>.<br/>
                      Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Gửi email thông báo đăng nhập thành công
 * @param {string} toEmail
 * @param {string} fullname
 */
exports.sendLoginNotificationEmail = async (toEmail, fullname) => {
  const now = new Date();
  const timeStr = now.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "full",
    timeStyle: "short",
  });

  const mailOptions = {
    from: `"SmartVideo" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🔐 Đăng nhập SmartVideo thành công",
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,0.10);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:36px 40px 28px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:10px 20px;margin-bottom:14px;">
                      <span style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-1px;">Smart<span style="color:#93c5fd;">Video</span></span>
                    </div>
                    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">
                      🔐 Đăng nhập thành công
                    </h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:32px 40px 28px;">
                    <p style="font-size:15px;color:#374151;margin:0 0 14px;">
                      Xin chào <strong style="color:#2563eb;">${fullname}</strong>,
                    </p>
                    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 24px;">
                      Tài khoản Google của bạn vừa được dùng để <strong>đăng nhập vào SmartVideo</strong>.
                    </p>

                    <!-- Info box -->
                    <table cellpadding="0" cellspacing="0" width="100%" style="background:#eff6ff;border-radius:14px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:18px 22px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding:6px 0;border-bottom:1px solid #dbeafe;">
                                <span style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Tài khoản</span><br/>
                                <span style="font-size:14px;color:#1e40af;font-weight:600;">${toEmail}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:6px 0;padding-top:10px;">
                                <span style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Thời gian đăng nhập</span><br/>
                                <span style="font-size:14px;color:#1e40af;font-weight:600;">${timeStr}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size:13px;color:#6b7280;line-height:1.7;margin:0 0 24px;padding:14px 16px;background:#fef9c3;border-radius:10px;border-left:3px solid #eab308;">
                      ⚠️ Nếu bạn <strong>không thực hiện</strong> đăng nhập này, hãy đổi mật khẩu Gmail ngay lập tức và liên hệ với chúng tôi.
                    </p>

                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard"
                             style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 36px;border-radius:50px;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
                            Vào Dashboard →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;padding:18px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;">
                      Email bảo mật tự động từ <strong>SmartVideo</strong>. Vui lòng không trả lời email này.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Gửi email nhắc nhở chuỗi ngày học lúc 9:05 AM hằng ngày
 * @param {string} toEmail
 * @param {string} fullname
 * @param {number} streak - số ngày học liên tiếp hiện tại
 */
exports.sendStreakReminderEmail = async (toEmail, fullname, streak) => {
  const today = new Date().toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const streakBadge =
    streak >= 30 ? "🏆 Huyền thoại"
    : streak >= 14 ? "⭐ Xuất sắc"
    : streak >= 7  ? "🔥 Tuyệt vời"
    : streak >= 3  ? "💪 Đang nóng"
    : "🌱 Khởi đầu";

  const mailOptions = {
    from: `"SmartVideo" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🔥 Đừng bỏ lỡ hôm nay! Chuỗi ${streak} ngày của bạn đang chờ`,
    html: `
      <!DOCTYPE html><html lang="vi">
      <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
      <title>Nhắc nhở học hằng ngày</title></head>
      <body style="margin:0;padding:0;background:#0e0720;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0720;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0"
              style="background:#1a0f2e;border-radius:20px;overflow:hidden;
                     box-shadow:0 4px 40px rgba(124,58,237,0.25);
                     border:1px solid rgba(124,58,237,0.2);">
              <tr>
                <td style="background:linear-gradient(135deg,#7c3aed 0%,#6366f1 100%);
                           padding:40px 40px 32px;text-align:center;">
                  <div style="display:inline-block;background:rgba(255,255,255,0.15);
                              border-radius:16px;padding:12px 22px;margin-bottom:16px;">
                    <span style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px;">
                      Smart<span style="color:#c4b5fd;">Video</span>
                    </span>
                  </div>
                  <div style="font-size:48px;margin:8px 0;">🔥</div>
                  <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Đã đến giờ học rồi!</h1>
                  <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:14px;">${today}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:36px 40px 28px;">
                  <p style="font-size:16px;color:#e2d9f3;margin:0 0 16px;">
                    Xin chào <strong style="color:#c4b5fd;">${fullname}</strong> 👋
                  </p>
                  <p style="font-size:15px;color:#a08cc0;line-height:1.7;margin:0 0 24px;">
                    Bạn đang có <strong style="color:#fff;">chuỗi ${streak} ngày học liên tiếp</strong>.
                    Hôm nay đừng để chuỗi bị gián đoạn nhé!
                  </p>
                  <table cellpadding="0" cellspacing="0" width="100%"
                    style="background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(99,102,241,0.1));
                           border:1px solid rgba(124,58,237,0.35);border-radius:16px;margin-bottom:28px;">
                    <tr><td style="padding:22px 28px;text-align:center;">
                      <p style="margin:0 0 6px;font-size:13px;color:#a78bfa;
                                text-transform:uppercase;letter-spacing:1px;font-weight:600;">
                        Chuỗi ngày học của bạn
                      </p>
                      <p style="margin:0 0 8px;font-size:52px;font-weight:900;color:#fff;line-height:1;">${streak}</p>
                      <p style="margin:0;font-size:14px;color:#a08cc0;">ngày liên tiếp</p>
                      <div style="display:inline-block;margin-top:12px;
                                  background:rgba(124,58,237,0.3);
                                  border:1px solid rgba(167,139,250,0.4);
                                  border-radius:50px;padding:6px 18px;">
                        <span style="font-size:13px;font-weight:700;color:#c4b5fd;">${streakBadge}</span>
                      </div>
                    </td></tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" width="100%"
                    style="background:rgba(255,255,255,0.03);
                           border:1px solid rgba(255,255,255,0.08);
                           border-radius:14px;margin-bottom:28px;">
                    <tr><td style="padding:18px 22px;">
                      <p style="margin:0 0 12px;font-weight:700;color:#c4b5fd;font-size:13px;
                                text-transform:uppercase;letter-spacing:.5px;">Gợi ý học hôm nay:</p>
                      <ul style="margin:0;padding-left:20px;color:#a08cc0;font-size:14px;line-height:2.2;">
                        <li>🎬 Xem 1 video AI gợi ý và học từ vựng mới</li>
                        <li>🃏 Ôn lại từ vựng bằng Flashcard (gói Pro)</li>
                        <li>🎧 Luyện nghe với đoạn video yêu thích</li>
                      </ul>
                    </td></tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr><td align="center">
                      <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard"
                         style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#6366f1);
                                color:#fff;text-decoration:none;font-size:15px;font-weight:700;
                                padding:15px 48px;border-radius:50px;letter-spacing:.3px;
                                box-shadow:0 4px 20px rgba(124,58,237,0.45);">
                        🚀 Học ngay hôm nay
                      </a>
                    </td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="background:rgba(0,0,0,0.3);padding:18px 40px;text-align:center;
                           border-top:1px solid rgba(255,255,255,0.08);">
                  <p style="margin:0 0 6px;color:#6b5f8a;font-size:12px;">
                    Bạn nhận email này vì đã bật
                    <strong>Nhắc nhở chuỗi ngày học</strong> trong cài đặt.
                  </p>
                  <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard/profile"
                     style="color:#7c3aed;font-size:12px;text-decoration:underline;">
                    Tắt thông báo
                  </a>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

