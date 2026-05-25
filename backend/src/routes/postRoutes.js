const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createPost,
  getFeed,
  toggleLike,
  saveVideoFromPost,
  deletePost,
} = require("../controllers/postController");
const { addComment, getComments } = require("../controllers/commentController");

router.get("/", auth, getFeed);
router.post("/", auth, createPost);
router.delete("/:id", auth, deletePost);
router.post("/:id/like", auth, toggleLike);
router.post("/:id/save", auth, saveVideoFromPost);
router.get("/:postId/comments", auth, getComments);
router.post("/:postId/comments", auth, addComment);

module.exports = router;
