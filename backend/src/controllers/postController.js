const Post = require("../models/Post");
const Video = require("../models/Video");
const Comment = require("../models/Comment");

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

    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username fullname avatar"),
      Post.countDocuments(),
    ]);

    // Attach liked flag for the current user
    const currentUserId = req.userId?.toString();
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
      title: post.title,
      thumbnail: post.thumbnail,
      isFavorite: false,
    });

    res.status(201).json({ success: true, video });
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
