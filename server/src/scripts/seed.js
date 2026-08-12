import "../config/env.js";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db.js";
import User from "../models/User.js";
import Item from "../models/Item.js";
import Notification from "../models/Notification.js";

await connectDatabase();
await Promise.all([User.deleteMany({}), Item.deleteMany({}), Notification.deleteMany({})]);

const passwordHash = await bcrypt.hash("Campus@123", 12);
const [amar, riya] = await User.create([
  { name: "Amarjit Laishram", email: "amarjit@thapar.edu", passwordHash, role: "admin" },
  { name: "Riya Sharma", email: "riya@thapar.edu", passwordHash }
]);

await Item.create([
  { type: "lost", category: "Wallet", title: "Black leather wallet", description: "Slim wallet with a student ID and metro card inside.", location: "Near G Block library", occurredAt: new Date(Date.now() - 86400000), contact: "amarjit@thapar.edu", createdBy: amar.id },
  { type: "found", category: "Electronics", title: "Wireless earbuds case", description: "White charging case, no earbuds inside.", location: "COS block lab 204", occurredAt: new Date(Date.now() - 172800000), contact: "riya@thapar.edu", createdBy: riya.id },
  { type: "found", category: "ID card", title: "Student ID card", description: "Found beside the main auditorium after the evening event.", location: "Main auditorium", occurredAt: new Date(Date.now() - 259200000), contact: "riya@thapar.edu", createdBy: riya.id }
]);

console.log("Seeded demo users and items. Login with amarjit@thapar.edu / Campus@123");
process.exit(0);
