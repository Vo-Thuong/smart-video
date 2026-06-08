const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");

// GET /api/friends/suggestions
// Returns recently registered users who are not yet friends / pending with current user
exports.getSuggestions = async (req, res) => {
  try {
    const me = req.userId;

    // All request IDs involving me
    const existing = await FriendRequest.find({
      $or: [{ sender: me }, { receiver: me }],
    }).lean();

    const excludedIds = new Set([me.toString()]);
    existing.forEach((r) => {
      excludedIds.add(r.sender.toString());
      excludedIds.add(r.receiver.toString());
    });

    const suggestions = await User.find({ _id: { $nin: [...excludedIds] } })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("_id fullname username avatar createdAt");

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/friends/requests
// Returns incoming pending friend requests
exports.getRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.userId,
      status: "pending",
    })
      .populate("sender", "_id fullname username avatar")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/friends/list
// Returns accepted friends
exports.getFriends = async (req, res) => {
  try {
    const me = req.userId;
    const accepted = await FriendRequest.find({
      $or: [{ sender: me }, { receiver: me }],
      status: "accepted",
    })
      .populate("sender", "_id fullname username avatar")
      .populate("receiver", "_id fullname username avatar")
      .sort({ updatedAt: -1 });

    const friends = accepted.map((r) => {
      const isSender = r.sender._id.toString() === me;
      return isSender ? r.receiver : r.sender;
    });

    res.json(friends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/friends/request/:userId
// Send friend request
exports.sendRequest = async (req, res) => {
  try {
    const me = req.userId;
    const { userId } = req.params;

    if (me === userId) return res.status(400).json({ message: "Cannot add yourself" });

    const exists = await FriendRequest.findOne({
      $or: [
        { sender: me, receiver: userId },
        { sender: userId, receiver: me },
      ],
    });
    if (exists) return res.status(409).json({ message: "Request already exists" });

    const request = await FriendRequest.create({ sender: me, receiver: userId });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/friends/request/:requestId/accept
exports.acceptRequest = async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.receiver.toString() !== req.userId.toString())
      return res.status(403).json({ message: "Forbidden" });

    request.status = "accepted";
    await request.save();

    const friend = await User.findById(request.sender).select("_id fullname username avatar");
    res.json({ message: "Accepted", friend });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/friends/request/:requestId/decline
exports.declineRequest = async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.receiver.toString() !== req.userId.toString())
      return res.status(403).json({ message: "Forbidden" });

    await request.deleteOne();
    res.json({ message: "Declined" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/friends/:userId
// Unfriend
exports.unfriend = async (req, res) => {
  try {
    const me = req.userId;
    const { userId } = req.params;
    await FriendRequest.deleteOne({
      $or: [
        { sender: me, receiver: userId },
        { sender: userId, receiver: me },
      ],
      status: "accepted",
    });
    res.json({ message: "Unfriended" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
