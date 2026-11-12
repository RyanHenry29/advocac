import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isLlmConfigured } from "@/lib/chatbot/generator";

export const runtime = "nodejs";
// sonda em runtime: sem isso o Next pré-renderiza e o cache HIT congela
// o status do banco/hint de LLM no horário do build
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();
  let db = "unconfigured";

  if (supabase) {
    try {
      const { error } = await supabase.from("legal_topics").select("id").limit(1);
      db = error ? "error" : "ok";
    } catch {
      db = "error";
    }
  }

  return NextResponse.json({
    status: "ok",
    db,
    llm: isLlmConfigured() ? "groq" : "local",
    timestamp: new Date().toISOString()
  });
}
