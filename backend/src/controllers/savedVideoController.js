const Video = require("../models/Video");
const User = require("../models/User");
const { fetchAndCacheTranscript } = require("./transcriptController");

exports.saveVideo = async (req, res) => {
  try {
    const { youtubeUrl, youtubeId, title, thumbnail, categoryId, isFavorite } = req.body;

    const existing = await Video.findOne({ userId: req.userId, youtubeId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Video đã được lưu trước đó" });
    }

    const video = await Video.create({
      userId: req.userId,
      youtubeUrl,
      youtubeId,
      title,
      thumbnail,
      categoryId: categoryId || null,
      isFavorite: isFavorite || false,
    });

    const populated = await video.populate("categoryId", "name color");

    // Tự động fetch transcript ở background (không block response)
    fetchAndCacheTranscript(youtubeId).catch(() => {});

    res.status(201).json({ success: true, video: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyVideos = async (req, res) => {
  try {
    const { categoryId, favorite } = req.query;
    const filter = { userId: req.userId };
    if (categoryId) filter.categoryId = categoryId;
    if (favorite === "true") filter.isFavorite = true;

    const videos = await Video.find(filter)
      .populate("categoryId", "name color")
      .sort({ createdAt: -1 });

    res.json({ success: true, videos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, userId: req.userId });
    if (!video) {
      return res.status(404).json({ success: false, message: "Không tìm thấy video" });
    }
    video.isFavorite = !video.isFavorite;
    await video.save();
    res.json({ success: true, isFavorite: video.isFavorite });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    const video = await Video.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { categoryId: categoryId || null },
      { new: true }
    ).populate("categoryId", "name color");

    if (!video) {
      return res.status(404).json({ success: false, message: "Không tìm thấy video" });
    }
    res.json({ success: true, video });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!video) {
      return res.status(404).json({ success: false, message: "Không tìm thấy video" });
    }
    res.json({ success: true, message: "Đã xóa video" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.recordPractice = async (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const yesterday = new Date(now - 86400000).toISOString().slice(0, 10);
    const { title, thumbnail } = req.body;
    const youtubeId = req.params.youtubeId;

    // Upsert: update existing or create a minimal record if the video isn't saved yet
    await Video.findOneAndUpdate(
      { youtubeId, userId: req.userId },
      {
        $set: { lastPracticed: now },
        $setOnInsert: {
          userId: req.userId,
          youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
          youtubeId,
          title: title || "Untitled",
          thumbnail: thumbnail || `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
        },
      },
      { upsert: true, new: true }
    );

    // Calculate new streak
    const user = await User.findById(req.userId);
    let newStreak = user.study_streak || 0;
    if (user.last_study_date === today) {
      // Already practiced today — streak unchanged
    } else if (user.last_study_date === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1; // streak broken or first practice
    }

    await User.findByIdAndUpdate(req.userId, {
      $set: { study_streak: newStreak, last_study_date: today },
    });

    res.status(200).json({ success: true, study_streak: newStreak });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
