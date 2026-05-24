const express = require("express");
const router = express.Router();
const { addVocabulary, getVocabulary, deleteVocabulary, updateVocabulary } = require("../controllers/vocabularyController");

router.get("/", getVocabulary);
router.post("/", addVocabulary);
router.patch("/:id", updateVocabulary);
router.delete("/:id", deleteVocabulary);

module.exports = router;
