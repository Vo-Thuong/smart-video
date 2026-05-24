const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");

router.get("/", auth, getCategories);
router.post("/", auth, createCategory);
router.patch("/:id", auth, updateCategory);
router.delete("/:id", auth, deleteCategory);

module.exports = router;
