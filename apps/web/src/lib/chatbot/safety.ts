import { refusalPatterns, urgencyPatterns } from "@/lib/knowledge/local";
import type { RefusalPattern } from "@/lib/chatbot/types";

export function matchRefusal(text: string): RefusalPattern | null {
  for (const pattern of refusalPatterns) {
    if (pattern.test.test(text)) return pattern;
  }
  return null;
}

export function detectUrgency(text: string): boolean {
  return urgencyPatterns.some((re) => re.test(text));
}
