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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);
