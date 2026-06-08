const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postType: {
      type: String,
      enum: ["video", "vocab"],
      default: "video",
    },
    caption: { type: String, default: "", maxlength: 1000 },

    // ── Video post fields ──
    youtubeId: { type: String, default: "" },
    youtubeUrl: { type: String, default: "" },
    title: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    sourceType: {
      type: String,
      enum: ["saved", "favorite", "practiced"],
      default: "saved",
    },

    // ── Vocab post fields ──
    vocabWords: [
      {
        word: { type: String },
        phonetic: { type: String, default: "" },
        translation: { type: String, default: "" },
        example: { type: String, default: "" },
      },
    ],
    // "public" = visible to all on feed; "friends" = visible only to sharedWith + sender
    visibility: {
      type: String,
      enum: ["public", "friends"],
      default: "public",
    },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
