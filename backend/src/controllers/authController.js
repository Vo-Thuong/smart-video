const User = require("../models/User");
const Video = require("../models/Video");
const Vocabulary = require("../models/Vocabulary");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

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
        .select("title thumbnail lastPracticed youtubeId"),
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