const Comment = require("../models/Comment");
const Post = require("../models/Post");

// POST /api/posts/:postId/comments
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: "Bình luận không được để trống." });
    }
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: "Bài đăng không tồn tại." });

    const comment = await Comment.create({
      postId: req.params.postId,
      userId: req.userId,
      text: text.trim(),
    });

    await Post.findByIdAndUpdate(req.params.postId, { $inc: { commentsCount: 1 } });

    const populated = await Comment.findById(comment._id).populate(
      "userId",
      "username fullname avatar"
    );
    res.status(201).json({ success: true, comment: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/posts/:postId/comments?page=1
exports.getComments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ postId: req.params.postId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username fullname avatar"),
      Comment.countDocuments({ postId: req.params.postId }),
    ]);

    res.json({ success: true, comments, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: "Bình luận không tồn tại." });
    if (comment.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "Không có quyền xóa bình luận này." });
    }
    await Promise.all([
      Comment.findByIdAndDelete(req.params.id),
      Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } }),
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
