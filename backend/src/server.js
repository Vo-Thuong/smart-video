require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const videoRoutes = require("./routes/videoRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const savedVideoRoutes = require("./routes/savedVideoRoutes");
const dictionaryRoutes = require("./routes/dictionaryRoutes");
const vocabularyRoutes = require("./routes/vocabularyRoutes");
const recommendRoutes = require("./routes/recommendRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const friendRoutes = require("./routes/friendRoutes");
const { startReminderScheduler } = require("./services/reminderScheduler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded videos as static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB"))
  .catch((err) => console.error("❌ Lỗi kết nối DB:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/saved-video", savedVideoRoutes);
app.use("/api/dictionary", dictionaryRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/api/recommendations", recommendRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/friends", friendRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  startReminderScheduler();
});