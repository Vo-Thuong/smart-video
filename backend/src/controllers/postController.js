const Post = require("../models/Post");
const Video = require("../models/Video");
const Comment = require("../models/Comment");
const FriendRequest = require("../models/FriendRequest");
const Vocabulary = require("../models/Vocabulary");

// POST /api/posts  — create a new post
exports.createPost = async (req, res) => {
  try {
    const { caption, youtubeId, youtubeUrl, title, thumbnail, sourceType } = req.body;
    if (!youtubeId || !youtubeUrl || !title) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin video." });
    }
    const post = await Post.create({
      userId: req.userId,
      caption: caption?.trim() ?? "",
      youtubeId,
      youtubeUrl,
      title,
      thumbnail: thumbnail ?? "",
      sourceType: sourceType ?? "saved",
      visibility: "public",
    });
    const populated = await Post.findById(post._id).populate(
      "userId",
      "username fullname avatar"
    );
    res.status(201).json({ success: true, post: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/posts  — paginated feed (newest first)
exports.getFeed = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const me = req.userId;

    // Resolve accepted friends of current user — fail gracefully if this errors
    let friendIds = [];
    try {
      const friendRelations = await FriendRequest.find({
        $or: [{ sender: me }, { receiver: me }],
        status: "accepted",
      }).lean();

      friendIds = friendRelations.map((r) =>
        r.sender.toString() === me.toString() ? r.receiver : r.sender
      );
    } catch (_) {
      // If friend lookup fails, continue — public posts will still show
    }

    // Include:
    //   1. Posts that are explicitly public OR have no visibility set (legacy)
    //   2. Posts shared directly with current user (sharedWith)
    //   3. Current user's own posts
    //   4. Friends-only posts from accepted friends
    const query = {
      $or: [
        { visibility: { $in: ["public", null] } },
        { visibility: { $exists: false } },
        { sharedWith: me },
        { userId: me },
        { visibility: "friends", userId: { $in: friendIds } },
      ],
    };

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username fullname avatar"),
      Post.countDocuments(query),
    ]);

    const currentUserId = me?.toString();
    const enriched = posts.map((p) => {
      const obj = p.toObject();
      obj.likedByMe = currentUserId
        ? p.likes.some((id) => id.toString() === currentUserId)
        : false;
      obj.likesCount = p.likes.length;
      return obj;
    });

    res.json({ success: true, posts: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/posts/:id/like  — toggle like
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Bài đăng không tồn tại." });

    const uid = req.userId.toString();
    const alreadyLiked = post.likes.some((l) => l.toString() === uid);

    if (alreadyLiked) {
      post.likes = post.likes.filter((l) => l.toString() !== uid);
    } else {
      post.likes.push(req.userId);
    }
    await post.save();

    res.json({ success: true, liked: !alreadyLiked, likesCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/posts/:id/save  — save the video to the current user's library
exports.saveVideoFromPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Bài đăng không tồn tại." });

    const existing = await Video.findOne({ userId: req.userId, youtubeId: post.youtubeId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Video đã có trong thư viện của bạn." });
    }

    const video = await Video.create({
      userId: req.userId,
      youtubeUrl: post.youtubeUrl,
      youtubeId: post.youtubeId,
      title: post.title?.trim() || "Untitled",
      thumbnail: post.thumbnail,
      isFavorite: false,
    });

    res.status(201).json({ success: true, video });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/posts/:id/favorite-video  — save the video to favorites (isFavorite: true)
exports.favoriteVideoFromPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Bài đăng không tồn tại." });

    const existing = await Video.findOne({ userId: req.userId, youtubeId: post.youtubeId });
    if (existing) {
      // Already saved — just mark as favorite
      existing.isFavorite = true;
      await existing.save();
      return res.json({ success: true, video: existing, alreadyExisted: true });
    }

    const video = await Video.create({
      userId: req.userId,
      youtubeUrl: post.youtubeUrl,
      youtubeId: post.youtubeId,
      title: post.title?.trim() || "Untitled",
      thumbnail: post.thumbnail,
      isFavorite: true,
    });

    res.status(201).json({ success: true, video });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/posts/:id/save-vocab  — import all vocab words from a post into current user's vocabulary
exports.saveVocabFromPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("userId", "fullname username");
    if (!post) return res.status(404).json({ success: false, message: "Bài đăng không tồn tại." });
    if (post.postType !== "vocab" || !post.vocabWords?.length) {
      return res.status(400).json({ success: false, message: "Bài đăng không có từ vựng." });
    }

    const userId = req.userId;
    const isFavorite = req.body?.isFavorite === true;
    const authorName = post.userId?.fullname || post.userId?.username || "Bạn bè";
    const sourceTitle = post.caption?.trim()
      ? `${authorName}: ${post.caption.slice(0, 60)}`
      : `Chia sẻ từ ${authorName}`;

    // Avoid duplicates: find words already in user's vocabulary
    const existingWords = await Vocabulary.find({ userId }).select("word").lean();
    const existingSet = new Set(existingWords.map((v) => v.word.toLowerCase().trim()));

    const toInsert = post.vocabWords
      .filter((w) => w.word && !existingSet.has(w.word.toLowerCase().trim()))
      .map((w) => ({
        userId,
        word: w.word.trim(),
        phonetic: w.phonetic || "",
        translation: w.translation || "",
        example: w.example || "",
        videoTitle: sourceTitle,
        isFavorite,
        source: "vocabulary",
      }));

    if (toInsert.length === 0) {
      // If isFavorite=true, mark existing words as favorite too
      if (isFavorite) {
        await Vocabulary.updateMany(
          { userId, word: { $in: post.vocabWords.map((w) => w.word?.trim()).filter(Boolean) } },
          { $set: { isFavorite: true } }
        );
      }
      return res.status(400).json({ success: false, message: "Tất cả từ đã có trong từ điển của bạn." });
    }

    const inserted = await Vocabulary.insertMany(toInsert);
    res.status(201).json({ success: true, count: inserted.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/posts/vocab  — share a vocab set to feed or friend
exports.createVocabPost = async (req, res) => {
  try {
    const { caption, vocabWords, visibility, sharedWith } = req.body;
    if (!vocabWords || vocabWords.length === 0) {
      return res.status(400).json({ success: false, message: "Chọn ít nhất 1 từ để chia sẻ." });
    }
    const post = await Post.create({
      userId: req.userId,
      postType: "vocab",
      caption: caption?.trim() ?? "",
      vocabWords,
      visibility: visibility ?? "public",
      sharedWith: visibility === "friends" ? (sharedWith ?? []) : [],
    });
    const populated = await Post.findById(post._id).populate("userId", "username fullname avatar");
    res.status(201).json({ success: true, post: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/posts/liked  — posts the current user has liked
exports.getLikedPosts = async (req, res) => {
  try {
    const me = req.userId;
    const posts = await Post.find({ likes: me })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "username fullname avatar")
      .lean();
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/posts/friends-recent  — recent posts from accepted friends
exports.getFriendsRecentPosts = async (req, res) => {
  try {
    const me = req.userId;
    const friendRelations = await FriendRequest.find({
      $or: [{ sender: me }, { receiver: me }],
      status: "accepted",
    }).lean();
    const friendIds = friendRelations.map((r) =>
      r.sender.toString() === me.toString() ? r.receiver : r.sender
    );
    if (friendIds.length === 0) {
      return res.json({ success: true, posts: [] });
    }
    const posts = await Post.find({ userId: { $in: friendIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "username fullname avatar")
      .lean();
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/posts/:id  — delete own post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Bài đăng không tồn tại." });
    if (post.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "Không có quyền xóa bài đăng này." });
    }
    await Promise.all([
      Post.findByIdAndDelete(req.params.id),
      Comment.deleteMany({ postId: req.params.id }),
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
