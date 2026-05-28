const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  saveVideo,
  getMyVideos,
  toggleFavorite,
  updateCategory,
  deleteVideo,
  recordPractice,
  saveProgress,
  getProgress,
  getHistory,
} = require("../controllers/savedVideoController");

router.post("/", auth, saveVideo);
router.get("/", auth, getMyVideos);
router.get("/history", auth, getHistory);  // ← must be above /:youtubeId/* routes
router.patch("/:id/favorite", auth, toggleFavorite);
router.patch("/:id/category", auth, updateCategory);
router.delete("/:id", auth, deleteVideo);
router.post("/:youtubeId/practice", auth, recordPractice);
router.patch("/:youtubeId/progress", auth, saveProgress);
router.get("/:youtubeId/progress-get", auth, getProgress);

module.exports = router;
