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
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

          const prompt = `Bạn là trợ lý gợi ý video học tiếng Anh. Dựa trên hồ sơ người dùng sau, hãy tạo đúng 5 cụm từ tìm kiếm YouTube bằng tiếng Anh để tìm các video học tiếng Anh phù hợp và hấp dẫn.

Hồ sơ người dùng:
- Trình độ: ${level}
- Mục tiêu: ${goals}
- Sở thích: ${interests}
- Phong cách học: ${styles}
- Thời gian học mỗi ngày: ${survey.studyTimeMinutes || 30} phút

Yêu cầu:
- Trả về ĐÚNG định dạng JSON array, không có markdown, không có giải thích
- Mỗi cụm từ tìm kiếm phải bằng tiếng Anh
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
            if (Array.isArray(parsed)) queries = parsed.slice(0, 5);
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
        ];
      }
    } else {
      // No survey: generic popular queries
      queries = [
        "english listening practice everyday",
        "learn english conversation beginner",
        "english pronunciation tips",
        "english vocabulary daily",
        "speak english fluently tips",
      ];
    }

    // Search YouTube for each query (2 videos per query = 10 total)
    const videoResults = await Promise.all(
      queries.slice(0, 5).map(async (q) => {
        try {
          const r = await yts({ query: q, pages: 1 });
          return (r.videos || []).slice(0, 2).map((v) => ({
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
      .slice(0, 10);

    res.json({ success: true, videos, queriesUsed: queries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
