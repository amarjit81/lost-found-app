import express from "express";
import mongoose from "mongoose";
import Item from "../models/Item.js";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateMatch } from "../utils/matching.js";

const router = express.Router();
const CATEGORIES = ["ID card", "Wallet", "Electronics", "Keys", "Books", "Clothing", "Other"];
router.use(requireAuth);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateItem(body) {
  const required = ["type", "category", "title", "description", "location", "occurredAt", "contact"];
  if (required.some((key) => !String(body[key] || "").trim())) return "Complete every required field";
  if (!["lost", "found"].includes(body.type)) return "Type must be lost or found";
  if (!CATEGORIES.includes(body.category)) return "Choose a valid category";
  if (Number.isNaN(Date.parse(body.occurredAt))) return "Choose a valid date";
  if (body.imageUrl && !/^https?:\/\//i.test(body.imageUrl)) return "Image must be a valid http(s) URL";
  return null;
}

router.get("/", asyncHandler(async (req, res) => {
  const { type, category, status = "open", search = "", mine } = req.query;
  const filter = {};
  if (["lost", "found"].includes(type)) filter.type = type;
  if (CATEGORIES.includes(category)) filter.category = category;
  if (["open", "resolved"].includes(status)) filter.status = status;
  if (mine === "true") {
    filter.createdBy = req.user.id;
  }
  if (search.trim()) {
    const pattern = new RegExp(escapeRegExp(search.trim()), "i");
    filter.$or = [{ title: pattern }, { description: pattern }, { location: pattern }];
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 12));
  const [items, total, lostOpen, foundOpen, resolved] = await Promise.all([
    Item.find(filter).populate("createdBy", "name avatarUrl").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Item.countDocuments(filter),
    Item.countDocuments({ type: "lost", status: "open" }),
    Item.countDocuments({ type: "found", status: "open" }),
    Item.countDocuments({ status: "resolved" })
  ]);
  res.json({ items, pagination: { page, pages: Math.ceil(total / limit), total }, stats: { lostOpen, foundOpen, resolved } });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Item not found" });
  const item = await Item.findById(req.params.id).populate("createdBy", "name avatarUrl");
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json({ item });
}));

router.post("/", asyncHandler(async (req, res) => {
  const validationError = validateItem(req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  const item = await Item.create({
    type: req.body.type,
    category: req.body.category,
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    location: req.body.location.trim(),
    occurredAt: req.body.occurredAt,
    contact: req.body.contact.trim(),
    imageUrl: req.body.imageUrl?.trim() || "",
    createdBy: req.user.id
  });

  const candidates = await Item.find({ _id: { $ne: item.id }, type: item.type === "lost" ? "found" : "lost", status: "open" });
  const matches = candidates.map((candidate) => ({ candidate, ...calculateMatch(item, candidate) }))
    .filter((match) => match.score >= 50).sort((a, b) => b.score - a.score).slice(0, 3);

  for (const match of matches) {
    const pair = item.type === "lost" ? { lost: item, found: match.candidate } : { lost: match.candidate, found: item };
    const recipients = new Set([String(pair.lost.createdBy), String(pair.found.createdBy)]);
    for (const user of recipients) {
      await Notification.updateOne(
        { user, item: item.id, matchedItem: match.candidate.id },
        { $setOnInsert: { user, item: item.id, matchedItem: match.candidate.id, score: match.score, reasons: match.reasons } },
        { upsert: true }
      );
    }
  }

  await item.populate("createdBy", "name avatarUrl");
  res.status(201).json({ item, matchCount: matches.length });
}));

router.patch("/:id", asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (String(item.createdBy) !== req.user.id && req.user.role !== "admin") return res.status(403).json({ message: "You can only update your own posts" });

  if (req.body.status) {
    if (!["open", "resolved"].includes(req.body.status)) return res.status(400).json({ message: "Invalid status" });
    item.status = req.body.status;
    item.resolvedAt = req.body.status === "resolved" ? new Date() : undefined;
  }
  for (const key of ["title", "description", "location", "contact", "imageUrl"]) {
    if (typeof req.body[key] === "string") item[key] = req.body[key].trim();
  }
  await item.save();
  await item.populate("createdBy", "name avatarUrl");
  res.json({ item });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (String(item.createdBy) !== req.user.id && req.user.role !== "admin") return res.status(403).json({ message: "You can only delete your own posts" });
  await Promise.all([item.deleteOne(), Notification.deleteMany({ $or: [{ item: item.id }, { matchedItem: item.id }] })]);
  res.status(204).end();
}));

export default router;
