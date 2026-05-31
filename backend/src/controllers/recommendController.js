const { GoogleGenerativeAI } = require("@google/generative-ai");
const yts = require("yt-search");
const User = require("../models/User");

// Map survey values to readable text for the AI prompt
const LEVEL_MAP = {
  beginner: "người mới bắt đầu (A1)",
  elementary: "cơ bản (A2)",
  intermediate: "trung cấp (B1)",
  "upper-intermediate": "trên trung cấp (B2)",
  advanced: "nâng cao (C1+)",
};

const GOAL_MAP = {
  communication: "giao tiếp hàng ngày",
  ielts: "luyện thi IELTS",
  toeic: "luyện thi TOEIC",
  listening: "nghe hiểu tiếng Anh",
  pronunciation: "cải thiện phát âm",
  travel: "tiếng Anh du lịch",
  job: "phỏng vấn xin việc",
  it: "tiếng Anh IT/công nghệ",
  office: "tiếng Anh văn phòng",
  academic: "tiếng Anh học thuật",
};

const STYLE_MAP = {
  "short-video": "video ngắn YouTube",
  podcast: "podcast tiếng Anh",
  movie: "phim điện ảnh",
  series: "series phim bộ",
  documentary: "phim tài liệu",
  music: "học qua âm nhạc",
  "news-video": "video tin tức",
  "talk-show": "talk show phỏng vấn",
};

const INTEREST_MAP = {
  music: "âm nhạc",
  sports: "thể thao",
  tech: "công nghệ",
  movies: "phim ảnh",
  food: "ẩm thực",
  travel: "du lịch",
  gaming: "game",
  news: "tin tức",
  business: "kinh doanh",
  science: "khoa học",
  fashion: "thời trang",
  health: "sức khoẻ",
};

exports.getRecommendations = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 8, 20);
    // For 8 videos: 4 queries × 3 each = 12 raw (buffer for dedup)
    // For 20 videos: 10 queries × 3 each = 30 raw (buffer for dedup)
    const queryCount = limit <= 8 ? 4 : 10;
    const videosPerQuery = 3;

    const user = await User.findById(req.userId).select("survey onboardingCompleted");

    // Build search queries even without AI if survey is incomplete
    let queries = [];

    if (user?.survey?.goals?.length > 0) {
      const survey = user.survey;
      const level = LEVEL_MAP[survey.englishLevel] || "trung cấp";
      const goals = (survey.goals || []).map((g) => GOAL_MAP[g] || g).join(", ");
      const interests = (survey.interests || []).map((i) => INTEREST_MAP[i] || i).join(", ");
      const styles = (survey.learningStyle || []).map((s) => STYLE_MAP[s] || s).join(", ");

      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        // Use Gemini to generate smart search queries
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

          const prompt = `Bạn là trợ lý gợi ý video học tiếng Anh. Dựa trên hồ sơ người dùng sau, hãy tạo đúng ${queryCount} cụm từ tìm kiếm YouTube bằng tiếng Anh để tìm các video học tiếng Anh phù hợp và hấp dẫn.

Hồ sơ người dùng:
- Trình độ: ${level}
- Mục tiêu: ${goals}
- Sở thích: ${interests}
- Phong cách học: ${styles}
- Thời gian học mỗi ngày: ${survey.studyTimeMinutes || 30} phút

Yêu cầu:
- Trả về ĐÚNG định dạng JSON array, không có markdown, không có giải thích
- Mỗi cụm từ tìm kiếm phải bằng tiếng Anh
- Đa dạng chủ đề, không lặp lại ý
- Ưu tiên kênh học tiếng Anh nổi tiếng
- Phù hợp với trình độ và mục tiêu người dùng

Ví dụ output: ["english listening practice intermediate", "BBC english pronunciation tips", "english for IT professionals tutorial"]

Output:`;

          const result = await model.generateContent(prompt);
          const text = result.response.text().trim();
          // Extract JSON array from response
          const match = text.match(/\[[\s\S]*\]/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed)) queries = parsed.slice(0, queryCount);
          }
        } catch {
          // Fall back to rule-based queries
        }
      }

      // Rule-based fallback queries
      if (queries.length === 0) {
        const levelKey = survey.englishLevel || "intermediate";
        const mainGoal = survey.goals?.[0] || "communication";
        const mainInterest = survey.interests?.[0] || "movies";

        const fallbacks = {
          communication: `english conversation practice ${levelKey}`,
          ielts: `IELTS listening practice ${levelKey}`,
          toeic: `TOEIC english practice test`,
          listening: `english listening comprehension ${levelKey}`,
          pronunciation: `english pronunciation tips ${levelKey}`,
          travel: `english for travel phrases`,
          job: `english job interview tips`,
          it: `english for IT software developers`,
          office: `business english office communication`,
          academic: `academic english writing speaking`,
        };

        queries = [
          fallbacks[mainGoal] || `english learning ${levelKey}`,
          `learn english through ${mainInterest}`,
          `english ${levelKey} listening practice`,
          `everyday english conversation`,
          `english vocabulary ${levelKey} level`,
          `english speaking practice ${levelKey}`,
          `english grammar tips ${levelKey}`,
          `learn english with movies ${levelKey}`,
          `english for beginners daily practice`,
          `english listening skills improvement`,
        ].slice(0, queryCount);
      }
    } else {
      // No survey: generic popular queries
      queries = [
        "english listening practice everyday",
        "learn english conversation beginner",
        "english pronunciation tips",
        "english vocabulary daily",
        "speak english fluently tips",
        "english grammar for beginners",
        "english for daily life conversation",
        "learn english with stories",
        "english listening comprehension practice",
        "american english accent training",
      ].slice(0, queryCount);
    }

    // Search YouTube for each query
    const videoResults = await Promise.all(
      queries.slice(0, queryCount).map(async (q) => {
        try {
          const r = await yts({ query: q, pages: 1 });
          return (r.videos || []).slice(0, videosPerQuery).map((v) => ({
            youtubeId: v.videoId,
            title: v.title,
            thumbnail: v.thumbnail,
            duration: v.timestamp,
            channel: v.author?.name || "",
            views: v.views,
            url: v.url,
            query: q,
          }));
        } catch {
          return [];
        }
      })
    );

    // Flatten, deduplicate by youtubeId
    const seen = new Set();
    const videos = videoResults
      .flat()
      .filter((v) => {
        if (!v.youtubeId || seen.has(v.youtubeId)) return false;
        seen.add(v.youtubeId);
        return true;
      })
      .slice(0, limit);

    res.json({ success: true, videos, queriesUsed: queries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Pro-only: Tìm kiếm video YouTube từ keyword của người dùng
 * Dùng Gemini để viết prompt tìm kiếm chính xác
 * GET /api/recommendations/search?q=keyword
 */
exports.searchByKeyword = async (req, res) => {
  try {
    const keyword = (req.query.q || "").trim();
    if (!keyword) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập từ khoá tìm kiếm." });
    }

    // Lấy thông tin user để personalise prompt
    const user = await User.findById(req.userId).select("survey").lean();
    const level = LEVEL_MAP[user?.survey?.englishLevel] || "trung cấp";

    let queries = [];
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Bạn là chuyên gia tìm kiếm video học tiếng Anh trên YouTube. Người dùng muốn tìm video về chủ đề: "${keyword}".

Trình độ người dùng: ${level}

Hãy tạo ĐÚNG 5 cụm từ tìm kiếm YouTube tiếng Anh khác nhau để tìm được các video chất lượng cao, chính xác nhất về chủ đề này. Các query cần:
- Đa dạng góc độ (tutorial, conversation practice, tips, examples, exercises...)
- Thêm từ khoá chất lượng phù hợp (không quá dài, 3-7 từ)
- Nhắm đến kênh học tiếng Anh uy tín
- Phù hợp với trình độ người dùng

Trả về ĐÚNG JSON array, không giải thích, không markdown.
Ví dụ: ["job interview english tips", "english job interview common questions", "how to answer interview questions english", "professional english phrases workplace", "english for office communication beginners"]

Output:`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) queries = parsed.slice(0, 5);
        }
      } catch {
        // fallback below
      }
    }

    // Fallback nếu Gemini lỗi
    if (queries.length === 0) {
      queries = [
        `${keyword} english`,
        `${keyword} english tutorial`,
        `${keyword} english practice`,
        `learn english ${keyword}`,
        `${keyword} english lesson`,
      ];
    }

    // Tìm kiếm YouTube với tất cả query song song
    const videoResults = await Promise.all(
      queries.map(async (q) => {
        try {
          const r = await yts({ query: q, pages: 1 });
          return (r.videos || []).slice(0, 4).map((v) => ({
            youtubeId: v.videoId,
            title: v.title,
            thumbnail: v.thumbnail,
            duration: v.timestamp,
            channel: v.author?.name || "",
            views: v.views,
            url: v.url,
            query: q,
          }));
        } catch {
          return [];
        }
      })
    );

    // Flatten + deduplicate
    const seen = new Set();
    const videos = videoResults
      .flat()
      .filter((v) => {
        if (!v.youtubeId || seen.has(v.youtubeId)) return false;
        seen.add(v.youtubeId);
        return true;
      })
      .slice(0, 20);

    res.json({ success: true, videos, queriesUsed: queries, keyword });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

