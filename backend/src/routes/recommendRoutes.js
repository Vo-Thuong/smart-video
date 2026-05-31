const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getRecommendations, searchByKeyword } = require("../controllers/recommendController");

router.get("/", auth, getRecommendations);
router.get("/search", auth, searchByKeyword);

module.exports = router;
