const youtubedl = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");
const Video = require("../models/Video");

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

// Stream video trực tiếp đến trình duyệt — không lưu disk, phát ngay
const streamVideo = async (req, res) => {
  const { url } = req.query;

  if (!url || !YOUTUBE_REGEX.test(url)) {
    return res.status(400).json({ error: "URL YouTube không hợp lệ" });
  }

  try {
    // Lấy title nhanh
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
    });

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("X-Video-Title", encodeURIComponent(info.title));

    const subprocess = youtubedl.exec(url, {
      // best muxed mp4 (audio+video trong 1 file, stream được qua stdout)
      format: "best[ext=mp4]/best",
      output: "-",
      quiet: true,
      noCheckCertificates: true,
    });

    subprocess.stdout.pipe(res);

    subprocess.on("error", (err) => {
      console.error("Stream error:", err.message);
      if (!res.headersSent) res.status(500).end();
    });

    req.on("close", () => subprocess.kill());
  } catch (err) {
    console.error("Stream setup error:", err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
};

// Giữ lại endpoint download để dùng sau (lưu video vào DB)
const downloadVideo = async (req, res) => {
  const { url } = req.body;

  if (!url || !YOUTUBE_REGEX.test(url)) {
    return res.status(400).json({ error: "URL YouTube không hợp lệ" });
  }

  try {
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
    });

    const rawTitle = info.title;
    const safeTitle = rawTitle
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_");
    const filename = `${Date.now()}_${safeTitle}.mp4`;

    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);

    await youtubedl(url, {
      output: filePath,
      format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
      mergeOutputFormat: "mp4",
      noCheckCertificates: true,
      noWarnings: true,
    });

    await Video.create({ youtubeUrl: url, title: rawTitle, filename });

    res.json({ title: rawTitle, videoUrl: `/uploads/${filename}` });
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Không thể tải video: " + err.message });
  }
};

module.exports = { streamVideo, downloadVideo };


