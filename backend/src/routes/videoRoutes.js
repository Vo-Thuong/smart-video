const express = require("express");
const router = express.Router();
const { streamVideo, downloadVideo } = require("../controllers/videoController");
const { getTranscript } = require("../controllers/transcriptController");

router.get("/stream", streamVideo);
router.post("/download", downloadVideo);
router.get("/transcript/:youtubeId", getTranscript);

module.exports = router;
