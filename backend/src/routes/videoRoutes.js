const express = require("express");
const router = express.Router();
const { streamVideo, downloadVideo, videoUpload, uploadLocalVideo, getLocalVideo, generateLocalThumbnail } = require("../controllers/videoController");
const { getTranscript } = require("../controllers/transcriptController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/stream", streamVideo);
router.post("/download", downloadVideo);
router.get("/transcript/:youtubeId", getTranscript);
router.post("/upload", authMiddleware, videoUpload.single("video"), uploadLocalVideo);
router.get("/local/:id", getLocalVideo);
router.post("/local/:id/thumbnail", authMiddleware, generateLocalThumbnail);

module.exports = router;
