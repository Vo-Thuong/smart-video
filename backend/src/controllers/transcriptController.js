const { YoutubeTranscript } = require("youtube-transcript");
const Video = require("../models/Video");

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

exports.getTranscript = async (req, res) => {
  const { youtubeId } = req.params;

  try {
    // 1. Kiểm tra cache trong DB trước
    const video = await Video.findOne({ youtubeId });
    if (video?.transcript?.length > 0) {
      return res.json({ success: true, transcript: video.transcript, cached: true });
    }

    // 2. Lấy từ YouTube captions API (ép lấy tiếng Anh)
    let items;
    try {
      items = await YoutubeTranscript.fetchTranscript(youtubeId, { lang: 'en' });
    } catch (e) {
      // Nếu không có tiếng Anh chuẩn, lấy đại cái mặc định
      items = await YoutubeTranscript.fetchTranscript(youtubeId);
    }

    const transcript = items.map((item) => ({
      time: formatTime(item.offset),
      text: item.text.replace(/\n/g, " ").trim(),
    }));

    // 3. Lưu cache vào DB nếu video đã được save
    if (video) {
      await Video.updateOne({ youtubeId }, { transcript });
    }

    res.json({ success: true, transcript });
  } catch (err) {
    console.error("Transcript error:", err.message);
    res.status(500).json({
      success: false,
      message: "Không thể lấy transcript. Video có thể không có phụ đề tự động.",
    });
  }
};

// Được gọi sau khi lưu video — tự động fetch & cache transcript
exports.fetchAndCacheTranscript = async (youtubeId) => {
  try {
    const existing = await Video.findOne({ youtubeId, "transcript.0": { $exists: true } });
    if (existing) return; // đã có, bỏ qua

    let items;
    try {
      items = await YoutubeTranscript.fetchTranscript(youtubeId, { lang: 'en' });
    } catch (e) {
      items = await YoutubeTranscript.fetchTranscript(youtubeId);
    }
    const transcript = items.map((item) => ({
      time: formatTime(item.offset),
      text: item.text.replace(/\n/g, " ").trim(),
    }));

    await Video.updateOne({ youtubeId }, { transcript });
    console.log(`✅ Cached transcript for ${youtubeId} (${transcript.length} segments)`);
  } catch (err) {
    console.warn(`⚠️  Transcript unavailable for ${youtubeId}: ${err.message}`);
  }
};
