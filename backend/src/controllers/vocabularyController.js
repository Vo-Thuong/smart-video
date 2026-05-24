const jwt = require("jsonwebtoken");
const Vocabulary = require("../models/Vocabulary");

function getUserId(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    return decoded.id || decoded._id || decoded.userId;
  } catch {
    return null;
  }
}

exports.addVocabulary = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { word, translation, example, note, phonetic, videoId, videoTitle, videoUrl, segmentTime } = req.body;
    if (!word?.trim()) return res.status(400).json({ success: false, message: "Word is required" });

    const vocab = await Vocabulary.create({ userId, word: word.trim(), phonetic, translation, example, note, videoId, videoTitle, videoUrl, segmentTime });
    return res.status(201).json({ success: true, vocabulary: vocab });
  } catch (err) {
    console.error("addVocabulary error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getVocabulary = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const list = await Vocabulary.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, vocabulary: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateVocabulary = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const allowed = ["word", "phonetic", "translation", "example", "note", "learned"];
    const update = {};
    for (const key of allowed) {
      if (key in req.body) update[key] = req.body[key];
    }

    const vocab = await Vocabulary.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: update },
      { new: true }
    );
    if (!vocab) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, vocabulary: vocab });
  } catch (err) {
    console.error("updateVocabulary error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteVocabulary = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    await Vocabulary.findOneAndDelete({ _id: req.params.id, userId });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
