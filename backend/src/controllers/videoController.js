const youtubedl = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const Video = require("../models/Video");

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

// ─── Multer config for local video uploads ───────────────────────────────────
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/videos");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Chỉ chấp nhận file video"));
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const extractAudio = (videoPath, audioPath) =>
  new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(audioPath)
      .audioCodec("libmp3lame")
      .audioBitrate("128k")
      .noVideo()
      .on("end", resolve)
      .on("error", reject)
      .run();
  });

const extractThumbnail = (videoPath, thumbnailPath) =>
  new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .seekInput(1) // grab frame at 1 second
      .frames(1)
      .output(thumbnailPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });

const transcribeWithGemini = async (audioPath) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY chưa được cấu hình");

  const fileManager = new GoogleAIFileManager(apiKey);
  const genAI = new GoogleGenerativeAI(apiKey);

  const uploadResult = await fileManager.uploadFile(audioPath, {
    mimeType: "audio/mpeg",
    displayName: "audio_transcript",
  });

  const MODELS = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
  ];
  const PROMPT = `Transcribe this audio. Output ONLY lines in this exact format:\nM:SS sentence text here\nwhere M:SS is the start time (e.g. 0:00, 1:23, 12:05). Split into natural sentences of 5-15 words. No headers, no explanation, just the timestamped lines.`;

  try {
    let lastErr;
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          {
            fileData: {
              mimeType: uploadResult.file.mimeType,
              fileUri: uploadResult.file.uri,
            },
          },
          { text: PROMPT },
        ]);
        const text = result.response.text();
        const transcript = [];
        for (const line of text.trim().split("\n").filter(Boolean)) {
          const match = line.match(/^(\d+:\d{2})\s+(.+)$/);
          if (match) transcript.push({ time: match[1], text: match[2].trim() });
        }
        console.log(
          `✅ Transcript OK — model: ${modelName} (${transcript.length} segments)`,
        );
        return transcript;
      } catch (err) {
        console.warn(`Model ${modelName} failed: ${err.message.slice(0, 120)}`);
        lastErr = err;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    throw lastErr;
  } finally {
    await fileManager.deleteFile(uploadResult.file.name).catch(() => {});
  }
};

// ─── Deepgram fallback (free tier, no billing required) ──────────────────────
const transcribeWithDeepgram = async (audioPath) => {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error("DEEPGRAM_API_KEY chưa được cấu hình");

  const audioData = fs.readFileSync(audioPath);

  const response = await fetch(
    "https://api.deepgram.com/v1/listen?punctuate=true&utterances=true&model=nova-3&language=en",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "audio/mpeg",
      },
      body: audioData,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Deepgram ${response.status}: ${text.slice(0, 120)}`);
  }

  const data = await response.json();
  const utterances = data.results?.utterances || [];
  const transcript = utterances.map((utt) => {
    const s = Math.floor(utt.start);
    return {
      time: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`,
      text: utt.transcript.trim(),
    };
  });

  console.log(`✅ Transcript OK — Deepgram (${transcript.length} segments)`);
  return transcript;
};

// ─── Orchestrator: try Gemini → Deepgram ────────────────────────────────────
const transcribeAudio = async (audioPath) => {
  // 1. Try Gemini
  try {
    return await transcribeWithGemini(audioPath);
  } catch (err) {
    console.warn("Gemini failed, trying Deepgram...", err.message.slice(0, 80));
  }
  // 2. Fallback: Deepgram
  return await transcribeWithDeepgram(audioPath);
};

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

// ─── Upload local video from user's machine ──────────────────────────────────
const uploadLocalVideo = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Không có file video" });
  }

  const { originalname, filename, path: filePath } = req.file;
  const title = path.parse(originalname).name.replace(/[_-]+/g, " ").trim();
  const videoUrl = `/uploads/videos/${filename}`;

  const audioDir = path.join(__dirname, "../../uploads/audio");
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
  const audioPath = path.join(audioDir, `${filename}.mp3`);

  // Extract thumbnail
  const thumbnailDir = path.join(__dirname, "../../uploads/thumbnails");
  if (!fs.existsSync(thumbnailDir))
    fs.mkdirSync(thumbnailDir, { recursive: true });
  const thumbnailFilename = `${path.parse(filename).name}.jpg`;
  const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
  const thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;

  let thumbnail = null;
  try {
    await extractThumbnail(filePath, thumbnailPath);
    thumbnail = thumbnailUrl;
  } catch (err) {
    console.warn("Thumbnail extraction failed:", err.message);
  }

  let transcript = [];
  let transcriptError = null;

  try {
    await extractAudio(filePath, audioPath);
    transcript = await transcribeAudio(audioPath);
  } catch (err) {
    console.error("Transcription failed:", err.message);
    if (!process.env.GEMINI_API_KEY) {
      transcriptError = "GEMINI_API_KEY chưa được cấu hình trong .env";
    } else {
      transcriptError = "Không thể tạo transcript tự động: " + err.message;
    }
  } finally {
    fs.unlink(audioPath, () => {});
  }

  try {
    const video = await Video.create({
      userId: req.userId,
      youtubeUrl: videoUrl,
      isLocal: true,
      localFilename: filename,
      title,
      thumbnail,
      transcript,
    });

    res.json({
      success: true,
      id: video._id,
      title,
      videoUrl,
      thumbnail,
      transcript,
      ...(transcriptError ? { transcriptError } : {}),
    });
  } catch (dbErr) {
    console.error("DB save error:", dbErr);
    res
      .status(500)
      .json({ success: false, message: "Lỗi lưu video: " + dbErr.message });
  }
};

// ─── Get local video info + transcript ──────────────────────────────────────
const getLocalVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video || !video.isLocal) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy video" });
    }
    res.json({
      success: true,
      id: video._id,
      title: video.title,
      videoUrl: `http://${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${video.youtubeUrl}`,
      transcript: video.transcript,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Generate thumbnail for an existing local video ──────────────────────────
const generateLocalThumbnail = async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, isLocal: true });
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy video" });
    }

    // Return existing thumbnail if already generated
    if (video.thumbnail) {
      return res.json({ success: true, thumbnail: video.thumbnail });
    }

    const filename = video.localFilename;
    if (!filename) {
      return res
        .status(400)
        .json({ success: false, message: "Không có thông tin file video" });
    }

    const videoPath = path.join(__dirname, "../../uploads/videos", filename);
    if (!fs.existsSync(videoPath)) {
      return res
        .status(404)
        .json({
          success: false,
          message: "File video không tồn tại trên server",
        });
    }

    const thumbnailDir = path.join(__dirname, "../../uploads/thumbnails");
    if (!fs.existsSync(thumbnailDir))
      fs.mkdirSync(thumbnailDir, { recursive: true });
    const thumbnailFilename = `${path.parse(filename).name}.jpg`;
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
    const thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;

    await extractThumbnail(videoPath, thumbnailPath);

    video.thumbnail = thumbnailUrl;
    await video.save();

    res.json({ success: true, thumbnail: thumbnailUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  streamVideo,
  downloadVideo,
  videoUpload,
  uploadLocalVideo,
  getLocalVideo,
  generateLocalThumbnail,
};
