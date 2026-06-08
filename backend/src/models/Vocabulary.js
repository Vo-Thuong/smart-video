const mongoose = require("mongoose");

const vocabularySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    word: { type: String, required: true, trim: true },
    phonetic: { type: String, trim: true, default: "" },
    translation: { type: String, trim: true, default: "" },
    example: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "" },
    videoId: { type: String, trim: true, default: "" },
    videoTitle: { type: String, trim: true, default: "" },
    videoUrl: { type: String, trim: true, default: "" },
    segmentTime: { type: String, trim: true, default: "" },
    learned: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    source: { type: String, enum: ["vocabulary", "collection"], default: "vocabulary" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vocabulary", vocabularySchema);
