import { getSupabaseAdmin } from "@/lib/supabase/server";
import { localTopics } from "@/lib/knowledge/local";
import type { KnowledgeTopic } from "@/lib/chatbot/types";

let cache: { topics: KnowledgeTopic[]; origin: "local" | "supabase" } | null = null;
let lastFetch = 0;

interface TopicRow {
  id: string;
  label: string;
  patterns: unknown;
  clarify: string | null;
  answer: string;
  steps: unknown;
  docs: unknown;
  source_label: string | null;
  source_verified: string | null;
  direct_handoff: boolean;
  escalate_hint: boolean;
  urgent_if_expired: boolean;
}

function asPatterns(value: unknown): Array<[string, number]> | null {
  if (!Array.isArray(value)) return null;
  const pairs: Array<[string, number]> = [];
  for (const item of value) {
    if (!Array.isArray(item) || item.length !== 2) return null;
    const [pattern, weight] = item;
    if (typeof pattern !== "string" || typeof weight !== "number") return null;
    try {
      new RegExp(pattern, "i");
    } catch {
      return null;
    }
    pairs.push([pattern, weight]);
  }
  return pairs.length > 0 ? pairs : null;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((v): v is string => typeof v === "string");
  return items.length > 0 ? items : undefined;
}

function toTopic(row: TopicRow): KnowledgeTopic | null {
  const patterns = asPatterns(row.patterns);
  if (!row.id || !row.label || !row.answer || !patterns) return null;

  return {
    id: row.id,
    label: row.label,
    patterns,
    clarify: row.clarify || "",
    answer: row.answer,
    steps: asStringArray(row.steps),
    docs: asStringArray(row.docs),
    source:
      row.source_label && row.source_verified
        ? { label: row.source_label, verified: row.source_verified }
        : undefined,
    directHandoff: row.direct_handoff || undefined,
    escalateHint: row.escalate_hint || undefined,
    urgentIfExpired: row.urgent_if_expired || undefined
  };
}

export async function getTopics(): Promise<{
  topics: KnowledgeTopic[];
  origin: "local" | "supabase";
}> {
  const now = Date.now();
  if (cache && now - lastFetch < 300_000) {
    return cache;
  }

  const supabase = getSupabaseAdmin();

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("legal_topics")
        .select(
          "id,label,patterns,clarify,answer,steps,docs,source_label,source_verified,direct_handoff,escalate_hint,urgent_if_expired"
        )
        .eq("active", true)
        .order("id");

      if (!error && data && data.length > 0) {
        const topics = (data as TopicRow[]).map(toTopic).filter((t): t is KnowledgeTopic => t !== null);
        if (topics.length > 0) {
          cache = { topics, origin: "supabase" };
          lastFetch = now;
          return cache;
        }
      }
    }
  } catch {
    // rede fora do ar → fallback local
  }

  cache = { topics: localTopics, origin: "local" };
  lastFetch = now;
  return cache;
}

export function invalidateTopicCache(): void {
  cache = null;
}
