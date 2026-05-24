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
} = require("../controllers/savedVideoController");

router.post("/", auth, saveVideo);
router.get("/", auth, getMyVideos);
router.patch("/:id/favorite", auth, toggleFavorite);
router.patch("/:id/category", auth, updateCategory);
router.delete("/:id", auth, deleteVideo);
router.post("/:youtubeId/practice", auth, recordPractice);

module.exports = router;
