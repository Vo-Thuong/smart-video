const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { register, login, getMe, getStats, updateProfile, changePassword, uploadAvatar, saveSurvey } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Multer setup for avatar uploads
const avatarDir = path.join(__dirname, "../../uploads/avatars");
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Chỉ chấp nhận file ảnh."));
  },
});

// Route: POST /api/auth/register
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.get("/stats", authMiddleware, getStats);
router.patch("/profile", authMiddleware, updateProfile);
router.patch("/password", authMiddleware, changePassword);
router.post("/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);
router.post("/survey", authMiddleware, saveSurvey);

module.exports = router;
