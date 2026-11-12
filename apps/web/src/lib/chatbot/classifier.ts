import type { KnowledgeTopic } from "@/lib/chatbot/types";

export interface ClassifyResult {
  topic: KnowledgeTopic | null;
  score: number;
}

const MIN_SCORE = 3;

// patterns vêm do banco: compila uma vez por pattern (e tolera pattern inválido)
const regexCache = new Map<string, RegExp | null>();

function getRegex(pattern: string): RegExp | null {
  const hit = regexCache.get(pattern);
  if (hit !== undefined) return hit;
  let compiled: RegExp | null = null;
  try {
    compiled = new RegExp(pattern, "i");
  } catch {
    compiled = null;
  }
  regexCache.set(pattern, compiled);
  return compiled;
}

export function classify(text: string, topics: KnowledgeTopic[]): ClassifyResult {
  let best: KnowledgeTopic | null = null;
  let bestScore = 0;

  for (const topic of topics) {
    let score = 0;
    for (const [pattern, weight] of topic.patterns) {
      const re = getRegex(pattern);
      if (re && re.test(text)) score += weight;
    }
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }

  return { topic: bestScore >= MIN_SCORE ? best : null, score: bestScore };
}
