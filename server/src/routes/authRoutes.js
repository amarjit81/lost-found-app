import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function cleanEmail(email = "") {
  return email.trim().toLowerCase();
}

function isAllowedEmail(email) {
  const domain = process.env.ALLOWED_EMAIL_DOMAIN?.trim().toLowerCase();
  return !domain || email.endsWith(`@${domain}`);
}

router.post("/register", asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const email = cleanEmail(req.body.email);
  const password = req.body.password || "";

  if (!name || !email || password.length < 8) {
    return res.status(400).json({ message: "Name, email and a password of at least 8 characters are required" });
  }
  if (!isAllowedEmail(email)) {
    return res.status(400).json({ message: `Use your @${process.env.ALLOWED_EMAIL_DOMAIN} campus email` });
  }
  if (await User.exists({ email })) return res.status(409).json({ message: "An account with this email already exists" });

  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
  res.status(201).json({ token: createToken(user), user: user.toSafeObject() });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const email = cleanEmail(req.body.email);
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(req.body.password || "", user.passwordHash))) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }
  res.json({ token: createToken(user), user: user.toSafeObject() });
}));

router.get("/me", requireAuth, (req, res) => res.json({ user: req.user.toSafeObject() }));

export default router;
