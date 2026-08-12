import test from "node:test";
import assert from "node:assert/strict";
import { calculateMatch, extractKeywords } from "./matching.js";

test("extractKeywords normalizes and removes filler words", () => {
  assert.deepEqual(extractKeywords("Lost the BLUE wallet near campus!"), ["blue", "wallet"]);
});

test("opposite posts receive a strong score for category, location and details", () => {
  const lost = { type: "lost", category: "Wallet", location: "Library first floor", title: "Blue wallet", description: "Brown leather with college ID" };
  const found = { type: "found", category: "Wallet", location: "Near the library", title: "Leather wallet", description: "Blue wallet containing an ID" };
  const result = calculateMatch(lost, found);
  assert.ok(result.score >= 80);
  assert.ok(result.reasons.includes("Same category"));
});

test("posts of the same type never match", () => {
  assert.equal(calculateMatch({ type: "lost" }, { type: "lost" }).score, 0);
});
