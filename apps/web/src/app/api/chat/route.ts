import { NextResponse } from "next/server";
import { z } from "zod";
import { getTopics } from "@/lib/chatbot/retriever";
import { newSession, processMessage } from "@/lib/chatbot/engine";
import { isLlmConfigured } from "@/lib/chatbot/generator";
import { rateLimit, clientKey } from "@/lib/security/rate-limit";
import { signSessionId, verifySessionId } from "@/lib/security/session-token";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const chatSchema = z.object({
  message: z.string().max(2000).optional(),
  chipValue: z.string().max(200).optional(),
  context: z
    .object({
      sessionId: z.string().max(200),
      phase: z.enum(["CAPTURE", "CLARIFY", "ANSWER", "PROFILE", "HANDOFF"]),
      currentTopicId: z.string().max(80).nullable(),
      pendingClarifyTopicId: z.string().max(80).nullable(),
      profile: z.string().max(40).nullable(),
      urgency: z.boolean(),
      lastUserText: z.string().max(2000)
    })
    .optional()
});

export async function POST(req: Request) {
  const limit = await rateLimit(clientKey(req, "chat"), 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Muitas mensagens em sequência. Aguarde alguns segundos." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  // sessionId forjado/sem assinatura vira sessão nova — nunca escreve em sessão alheia
  const rawCtx = parsed.data.context;
  const verifiedId = rawCtx ? verifySessionId(rawCtx.sessionId) : null;
  const context = rawCtx
    ? { ...rawCtx, sessionId: verifiedId ?? crypto.randomUUID() }
    : newSession();

  const input = {
    message: parsed.data.message || "",
    chipValue: parsed.data.chipValue,
    context
  };

  try {
    const { topics, origin } = await getTopics();
    const response = await processMessage(input, topics);

    await logConversation(input, response, origin).catch((err) => {
      console.error(
        "[chat] logConversation falhou:",
        err instanceof Error ? err.message : "unknown"
      );
    });

    return NextResponse.json(
      {
        ...response,
        context: { ...response.context, sessionId: signSessionId(response.context.sessionId) }
      },
      {
        headers: { "X-KB-Origin": origin, "X-LLM": isLlmConfigured() ? "on" : "off" }
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Falha interna do atendimento. Tente novamente." },
      { status: 500 }
    );
  }
}

type ProcessedResponse = Awaited<ReturnType<typeof processMessage>>;

async function logConversation(
  input: { message: string; chipValue?: string },
  response: ProcessedResponse,
  origin: string
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const ctx = response.context;
  const isHandoff = response.action === "HANDOFF";
  const leadScore = computeLeadScore(ctx, isHandoff);

  const { data: session, error: sessionError } = await supabase
    .from("conversation_sessions")
    .upsert(
      {
        id: ctx.sessionId,
        status: isHandoff ? "handoff" : "active",
        intent: ctx.currentTopicId,
        urgency: ctx.urgency ? "high" : "low",
        lead_score: leadScore,
        human_required: isHandoff || ctx.urgency,
        profile: ctx.profile,
        kb_origin: origin
      },
      { onConflict: "id" }
    )
    .select("id")
    .single();

  if (sessionError) {
    console.error(`[chat] session upsert recusado: ${sessionError.message}`);
    return;
  }
  if (!session) return;

  const userText = input.chipValue || input.message;
  if (userText) {
    await supabase.from("conversation_messages").insert({
      session_id: session.id,
      role: "user",
      content: userText.slice(0, 2000)
    });
  }

  await supabase.from("conversation_messages").insert({
    session_id: session.id,
    role: "assistant",
    content: response.reply.slice(0, 4000),
    state: response.action,
    metadata: {
      topic: response.topicLabel || null,
      source: response.source || null,
      kb_origin: origin
    }
  });

  if (response.action === "FALLBACK" && userText) {
    await supabase.from("unknown_questions").insert({
      question: userText.slice(0, 1000),
      session_id: session.id
    });
  }
}

function computeLeadScore(
  ctx: { urgency: boolean; profile: string | null; currentTopicId: string | null },
  handoff: boolean
): number {
  let score = 10;
  if (ctx.currentTopicId) score += 20;
  if (ctx.profile) score += 15;
  if (ctx.urgency) score += 30;
  if (handoff) score += 25;
  return Math.min(score, 100);
}
