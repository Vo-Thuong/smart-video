const mongoose = require("mongoose");

const transcriptItemSchema = new mongoose.Schema(
  { time: String, text: String },
  { _id: false }
);

const videoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    youtubeUrl: { type: String, required: true },
    youtubeId: { type: String },
    title: { type: String, default: "Untitled" },
    thumbnail: { type: String },
    filename: { type: String },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    isFavorite: { type: Boolean, default: false },
    transcript: { type: [transcriptItemSchema], default: [] },
    lastPracticed: { type: Date, default: null },
    progressTime: { type: Number, default: 0 },          // seconds into video
    progressSegment: { type: String, default: "" },      // transcript text at that point
    duration: { type: Number, default: 0 },              // total video duration in seconds
    progressPercent: { type: Number, default: 0 },       // 0-100
    isCompleted: { type: Boolean, default: false },      // true when progressPercent >= 95
    lastWatchedAt: { type: Date, default: null },        // last time user watched this video
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);
