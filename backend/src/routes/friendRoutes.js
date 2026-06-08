const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getSuggestions,
  getRequests,
  getFriends,
  sendRequest,
  acceptRequest,
  declineRequest,
  unfriend,
} = require("../controllers/friendController");

router.get("/suggestions", auth, getSuggestions);
router.get("/requests", auth, getRequests);
router.get("/list", auth, getFriends);
router.post("/request/:userId", auth, sendRequest);
router.patch("/request/:requestId/accept", auth, acceptRequest);
router.patch("/request/:requestId/decline", auth, declineRequest);
router.delete("/:userId", auth, unfriend);

module.exports = router;
