import express from "express";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .populate("item", "title type status imageUrl")
    .populate("matchedItem", "title type status location contact imageUrl")
    .sort({ createdAt: -1 }).limit(30);
  res.json({ notifications, unread: notifications.filter((notification) => !notification.read).length });
}));

router.patch("/:id/read", asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json({ notification });
}));

router.patch("/read-all", asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
  res.json({ message: "All notifications marked as read" });
}));

export default router;
