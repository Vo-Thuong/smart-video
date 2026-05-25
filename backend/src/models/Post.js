const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    caption: { type: String, default: "", maxlength: 1000 },
    youtubeId: { type: String, required: true },
    youtubeUrl: { type: String, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    sourceType: {
      type: String,
      enum: ["saved", "favorite", "practiced"],
      default: "saved",
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
