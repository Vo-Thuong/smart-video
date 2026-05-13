const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
      },
    });
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
        is_premium: user.is_premium
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};