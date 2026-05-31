const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password_hash: {
      type: String,
      required: false,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    fullname: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", // Ảnh mặc định cho đồ án
    },
    total_points: {
      type: Number,
      default: 0,
    },
    total_study_time: {
      type: Number,
      default: 0,
    },
    is_premium: {
      type: Boolean,
      default: false,
    },
    study_streak: {
      type: Number,
      default: 0,
    },
    last_study_date: {
      type: String,   // "YYYY-MM-DD"
      default: null,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    streakReminderEnabled: {
      type: Boolean,
      default: false,
    },
    premiumPlan: {
      planId:      { type: String, default: null },
      label:       { type: String, default: null },
      price:       { type: Number, default: null },
      unit:        { type: String, default: null },
      activatedAt: { type: String, default: null },
    },
    survey: {
      age: { type: Number, default: null },
      englishLevel: { type: String, default: null }, // beginner/elementary/intermediate/upper-intermediate/advanced
      goals: [{ type: String }],          // communication, ielts, toeic, listening, pronunciation, travel, job, it, office
      interests: [{ type: String }],      // music, sports, tech, movies, food, travel, gaming, news
      learningStyle: [{ type: String }],  // short-video, podcast, movie, series, documentary, music
      studyTimeMinutes: { type: Number, default: null }, // minutes per day
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

module.exports = mongoose.model("User", userSchema);
