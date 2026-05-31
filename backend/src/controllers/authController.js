const User = require("../models/User");
const Video = require("../models/Video");
const Vocabulary = require("../models/Vocabulary");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { OAuth2Client } = require("google-auth-library");
const { sendWelcomeEmail, sendLoginNotificationEmail } = require("../services/emailService");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  try {
    const { credential, userInfo } = req.body;
    if (!credential && !userInfo) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin xác thực Google." });
    }

    let googleId, email, fullname, picture;

    if (userInfo && userInfo.sub) {
      // Implicit flow: frontend gửi userInfo từ googleapis
      googleId = userInfo.sub;
      email = userInfo.email;
      fullname = userInfo.name;
      picture = userInfo.picture;
    } else {
      // ID token flow: xác minh bằng google-auth-library
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      fullname = payload.name;
      picture = payload.picture;
    }

    if (!email || !googleId) {
      return res.status(400).json({ success: false, message: "Không lấy được thông tin từ Google." });
    }

    // Kiểm tra user đã tồn tại chưa
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Tạo username duy nhất từ email
      const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter++}`;
      }

      user = await User.create({
        username,
        email,
        fullname,
        googleId,
        authProvider: "google",
        avatar: picture || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      });

      // Gửi email chào mừng (không block response nếu lỗi)
      sendWelcomeEmail(email, fullname).catch((err) =>
        console.error("❌ Lỗi gửi email chào mừng:", err.message)
      );
    } else if (!user.googleId) {
      // User đã đăng ký bằng email thường, liên kết thêm Google
      user.googleId = googleId;
      user.authProvider = "google";
      // Gán avatar từ Google nếu chưa có hoặc đang dùng avatar mặc định
      if (picture && (!user.avatar || user.avatar.includes("dicebear"))) {
        user.avatar = picture;
      }
      await user.save();
      // Gửi thông báo đăng nhập
      sendLoginNotificationEmail(email, fullname).catch((err) =>
        console.error("❌ Lỗi gửi email đăng nhập:", err.message)
      );
    } else {
      // User cũ đăng nhập lại bằng Google — đồng bộ avatar mới nhất
      if (picture && !user.avatar?.startsWith("/uploads")) {
        user.avatar = picture;
        await user.save();
      }
      sendLoginNotificationEmail(email, user.fullname).catch((err) =>
        console.error("❌ Lỗi gửi email đăng nhập:", err.message)
      );
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: isNewUser ? "Đăng ký Google thành công!" : "Đăng nhập Google thành công!",
      token,
      isNewUser,
      user: {
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar || null,
        is_premium: user.is_premium,
        onboardingCompleted: user.onboardingCompleted ?? false,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error.message);
    res.status(401).json({ success: false, message: "Xác thực Google thất bại." });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, fullname } = req.body;

    // 1. Kiểm tra username hoặc email đã tồn tại chưa
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Username hoặc Email đã được sử dụng.",
      });
    }

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Lưu người dùng mới
    const newUser = await User.create({
      username,
      email,
      fullname,
      password_hash: hashedPassword,
    });

    // 4. Tạo JWT Token để đăng nhập ngay sau khi đăng ký
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công!",
      token,
      user: {
        id: newUser._id,
        username: newUser.username, 
        fullname: newUser.fullname,
        is_premium: newUser.is_premium,
        onboardingCompleted: false,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const [user, videosCount, vocabTotal, posts] = await Promise.all([
      User.findById(userId).select("username fullname avatar study_streak total_points createdAt is_premium"),
      Video.countDocuments({ userId }),
      Vocabulary.countDocuments({ userId }),
      require("../models/Post").find({ userId, visibility: "public" })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
    res.json({ success: true, user, stats: { videosCount, vocabTotal }, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [user, videosCount, vocabTotal, vocabLearned, recentVideos] = await Promise.all([
      User.findById(req.userId).select("study_streak"),
      Video.countDocuments({ userId: req.userId }),
      Vocabulary.countDocuments({ userId: req.userId }),
      Vocabulary.countDocuments({ userId: req.userId, learned: true }),
      Video.find({ userId: req.userId, lastPracticed: { $ne: null } })
        .sort({ lastPracticed: -1 })
        .limit(5)
        .select("title thumbnail lastPracticed youtubeId isLocal"),
    ]);
    res.status(200).json({
      success: true,
      stats: {
        videosCount,
        vocabTotal,
        vocabLearned,
        study_streak: user?.study_streak ?? 0,
      },
      recentVideos,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password_hash");
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Email hoặc mật khẩu không đúng." });
    }

    // 2. Kiểm tra mật khẩu (so sánh password nhập vào với password_hash trong DB)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Email hoặc mật khẩu không đúng." });
    }

    // 3. Tạo JWT Token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar || null,
        is_premium: user.is_premium,
        onboardingCompleted: user.onboardingCompleted ?? false,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullname, email } = req.body;
    if (!fullname || !email) {
      return res.status(400).json({ success: false, message: "Tên và email không được để trống." });
    }
    // Check email not taken by another user
    const existing = await User.findOne({ email, _id: { $ne: req.userId } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email này đã được sử dụng bởi tài khoản khác." });
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { fullname: fullname.trim(), email: email.trim() } },
      { new: true }
    ).select("-password_hash");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Mật khẩu mới phải có ít nhất 8 ký tự." });
    }
    const user = await User.findById(req.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Mật khẩu hiện tại không đúng." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(req.userId, { $set: { password_hash: hashed } });
    res.json({ success: true, message: "Đã cập nhật mật khẩu thành công." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Không có file ảnh." });
    }
    const user = await User.findById(req.userId);
    // Delete old avatar file if it was a local upload
    if (user.avatar && user.avatar.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(__dirname, "../../", user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select("-password_hash");
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveSurvey = async (req, res) => {
  try {
    const { age, englishLevel, goals, interests, learningStyle, studyTimeMinutes } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          onboardingCompleted: true,
          survey: { age, englishLevel, goals, interests, learningStyle, studyTimeMinutes },
        },
      },
      { new: true }
    ).select("-password_hash");
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateNotificationSettings = async (req, res) => {
  try {
    const { streakReminderEnabled } = req.body;
    if (typeof streakReminderEnabled !== "boolean") {
      return res.status(400).json({ success: false, message: "streakReminderEnabled phải là boolean." });
    }
    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: { streakReminderEnabled } },
      { new: true }
    ).select("-password_hash");
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/test-reminder — gửi ngay email nhắc nhở để test
exports.testStreakReminder = async (req, res) => {
  try {
    const { sendStreakReminderEmail } = require("../services/emailService");
    const user = await User.findById(req.userId).select("email fullname study_streak streakReminderEnabled");
    if (!user) return res.status(404).json({ success: false, message: "User không tồn tại." });
    if (!user.streakReminderEnabled) {
      return res.status(400).json({ success: false, message: "Bạn chưa bật nhắc nhở chuỗi ngày học. Hãy bật trong trang Profile trước." });
    }
    await sendStreakReminderEmail(user.email, user.fullname, user.study_streak || 0);
    res.json({ success: true, message: `Đã gửi email test tới ${user.email}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/upgrade — kích hoạt gói Pro sau khi thanh toán
exports.upgradeToPremium = async (req, res) => {
  try {
    const { planId, label, price, unit } = req.body;
    if (!planId || !label || !price || !unit) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin gói." });
    }
    const updated = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          is_premium: true,
          premiumPlan: {
            planId,
            label,
            price,
            unit,
            activatedAt: new Date().toISOString(),
          },
        },
      },
      { new: true }
    ).select("-password_hash");
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/downgrade — hủy gói Pro
exports.downgradePremium = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          is_premium: false,
          premiumPlan: { planId: null, label: null, price: null, unit: null, activatedAt: null },
        },
      },
      { new: true }
    ).select("-password_hash");
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
