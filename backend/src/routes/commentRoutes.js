const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { deleteComment } = require("../controllers/commentController");

router.delete("/:id", auth, deleteComment);

module.exports = router;
