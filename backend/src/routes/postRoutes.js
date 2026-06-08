const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createPost,
  createVocabPost,
  getFeed,
  getLikedPosts,
  getFriendsRecentPosts,
  toggleLike,
  saveVideoFromPost,
  favoriteVideoFromPost,
  saveVocabFromPost,
  deletePost,
} = require("../controllers/postController");
const { addComment, getComments } = require("../controllers/commentController");

router.get("/", auth, getFeed);
router.get("/liked", auth, getLikedPosts);
router.get("/friends-recent", auth, getFriendsRecentPosts);
router.post("/", auth, createPost);
router.post("/vocab", auth, createVocabPost);
router.delete("/:id", auth, deletePost);
router.post("/:id/like", auth, toggleLike);
router.post("/:id/save", auth, saveVideoFromPost);
router.post("/:id/favorite-video", auth, favoriteVideoFromPost);
router.post("/:id/save-vocab", auth, saveVocabFromPost);
router.get("/:postId/comments", auth, getComments);
router.post("/:postId/comments", auth, addComment);

module.exports = router;
