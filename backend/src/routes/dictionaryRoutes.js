const express = require("express");
const router = express.Router();
const { lookupWord } = require("../controllers/dictionaryController");

router.get("/lookup", lookupWord);

module.exports = router;
