const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "this", "that", "lost", "found", "near", "campus",
  "was", "were", "has", "have", "please", "item", "someone", "anyone", "around"
]);

export function extractKeywords(value = "") {
  return [...new Set(value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word)))];
}

function words(value = "") {
  return new Set(extractKeywords(value));
}

export function calculateMatch(lost, found) {
  if (lost.type === found.type) return { score: 0, reasons: [] };

  let score = 0;
  const reasons = [];
  if (lost.category === found.category) {
    score += 45;
    reasons.push("Same category");
  }

  const lostLocation = words(lost.location);
  const foundLocation = words(found.location);
  const locationOverlap = [...lostLocation].filter((word) => foundLocation.has(word));
  if (locationOverlap.length) {
    score += Math.min(25, 15 + locationOverlap.length * 5);
    reasons.push("Similar location");
  }

  const lostWords = words(`${lost.title} ${lost.description}`);
  const foundWords = words(`${found.title} ${found.description}`);
  const shared = [...lostWords].filter((word) => foundWords.has(word));
  if (shared.length) {
    score += Math.min(30, shared.length * 8);
    reasons.push(`Shared details: ${shared.slice(0, 3).join(", ")}`);
  }

  return { score: Math.min(100, score), reasons };
}
