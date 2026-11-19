import { classify } from "@/lib/chatbot/classifier";
import { detectUrgency, matchRefusal } from "@/lib/chatbot/safety";
import { validateReply } from "@/lib/chatbot/validator";
import { generateLlmReply, isLlmConfigured } from "@/lib/chatbot/generator";
import { fallbackText, profileOptions } from "@/lib/knowledge/local";
import { waLink } from "@/lib/config";
import type {
  ChatContext,
  ChatRequestMessage,
  ChatResponse,
  KnowledgeTopic
} from "@/lib/chatbot/types";

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export function newSession(): ChatContext {
  return {
    sessionId: crypto.randomUUID(),
    phase: "CAPTURE",
    currentTopicId: null,
    pendingClarifyTopicId: null,
    profile: null,
    urgency: false,
    lastUserText: ""
  };
}

export function initialChips() {
  return [
    {
      label: "Meu CRAF está vencendo",
      value: "Meu CRAF está vencendo, o que faço?"
    },
    { label: "Recebi uma exigência", value: "Recebi uma exigência da Polícia Federal, o que fazer?" },
    {
      label: "Processo indeferido",
      value: "Meu processo de CRAF foi indeferido, tenho recurso?"
    },
    { label: "Documentação", value: "Quais documentos preciso apresentar?" },
    { label: "Portal PF", value: "Como funciona o novo Portal da Polícia Federal para CACs?" },
    { label: "Falar com a equipe", primary: true, value: "Quero falar direto com a equipe" }
  ];
}

function profileLabel(id: string | null): string {
  if (!id) return "não informado";
  return profileOptions.find((p) => p.id === id)?.label || id;
}

function buildSummary(context: ChatContext, topics: KnowledgeTopic[]): string {
  const topic = topics.find((t) => t.id === context.currentTopicId);
  const hasContext = context.lastUserText || context.currentTopicId || context.profile;

  if (!hasContext) {
    return "Olá, venho pelo site da Advocac.\nGostaria de falar com a equipe sobre meu caso.";
  }

  const lines = ["Olá, venho pelo site da Advocac.", ""];

  if (context.lastUserText) {
    lines.push(`Situação: ${context.lastUserText}`);
  }
  if (topic) {
    lines.push(`Tema: ${topic.label}`);
  }
  if (context.profile) {
    lines.push(`Perfil: ${profileLabel(context.profile)}`);
  }
  if (context.urgency) {
    lines.push("Urgência: sim");
  }

  return lines.join("\n");
}

function handoffResponse(context: ChatContext, topics: KnowledgeTopic[]): ChatResponse {
  const summary = buildSummary(context, topics);
  return {
    action: "HANDOFF",
    reply:
      "Vou abrir o WhatsApp com a equipe. Envie a mensagem que aparecer — eles já recebem o contexto do seu caso.",
    handoffUrl: waLink(summary),
    context: { ...context, phase: "HANDOFF" },
    chips: []
  };
}

function profileChips() {
  return profileOptions
    .map((p) => ({ label: p.label, value: `__profile__:${p.id}` }))
    .concat([{ label: "Prefiro não informar", value: "__profile__:SKIP" }]);
}

async function resolveAnswer(
  topic: KnowledgeTopic,
  raw: string,
  history: ChatHistoryItem[]
): Promise<string> {
  if (isLlmConfigured()) {
    const topicContext = [
      `Tema: ${topic.label}`,
      topic.source
        ? `Fonte oficial: ${topic.source.label} · verificada em ${topic.source.verified}`
        : "",
      topic.steps ? `Passos recomendados: ${topic.steps.join("; ")}` : "",
      `Resposta canônica de referência: ${topic.answer.replace(/<[^>]+>/g, " ")}`
    ]
      .filter(Boolean)
      .join("\n");

    const llmReply = await generateLlmReply(raw, topicContext, history);
    if (llmReply) {
      const validation = validateReply(llmReply);
      if (validation.ok) return llmReply;
    }
  }
  return topic.answer;
}

export async function processMessage(
  input: ChatRequestMessage,
  topics: KnowledgeTopic[],
  history: ChatHistoryItem[] = []
): Promise<ChatResponse> {
  const raw = String(input.message || "").trim();
  const ctx: ChatContext = { ...input.context };
  const chipValue = input.chipValue || "";

  if (chipValue.startsWith("__profile__:")) {
    const id = chipValue.replace("__profile__:", "");
    ctx.profile = id === "SKIP" ? null : id;
    ctx.phase = "PROFILE";
    const summary =
      `Resumo do que temos até aqui:<br><br>` +
      `<strong>Tema:</strong> ${
        topics.find((t) => t.id === ctx.currentTopicId)?.label || "—"
      }<br>` +
      `<strong>Perfil:</strong> ${profileLabel(ctx.profile)}<br>` +
      `<strong>Urgência aparente:</strong> ${ctx.urgency ? "sim" : "não identificada"}`;
    return {
      action: "ANSWER",
      reply: summary,
      context: ctx,
      chips: [
        { label: "Fale com a equipe", primary: true, value: "Fale com a equipe" },
        { label: "Continuar aqui", value: "Continuar aqui" }
      ]
    };
  }

  if (chipValue === "Fale com a equipe" || chipValue === "Quero falar direto com a equipe") {
    return handoffResponse(ctx, topics);
  }

  if (chipValue === "Continuar aqui") {
    ctx.phase = "CAPTURE";
    return {
      action: "ANSWER",
      reply: "Certo. Pode continuar me contando — estou por aqui.",
      context: ctx,
      chips: initialChips()
    };
  }

  if (!raw) {
    return {
      action: "FALLBACK",
      reply: fallbackText,
      context: ctx,
      chips: initialChips()
    };
  }

  ctx.lastUserText = raw;
  ctx.urgency = ctx.urgency || detectUrgency(raw);

  const refusal = matchRefusal(raw);
  if (refusal) {
    ctx.phase = "CAPTURE";
    return {
      action: "REFUSE",
      reply: refusal.reply,
      context: ctx,
      chips: [
        { label: "Fale com a equipe", primary: true, value: "Fale com a equipe" }
      ]
    };
  }

  const result = classify(raw, topics);

  if (result.topic && result.topic.directHandoff) {
    ctx.currentTopicId = result.topic.id;
    ctx.phase = "HANDOFF";
    return {
      action: "HANDOFF",
      reply: result.topic.answer,
      handoffUrl: waLink(buildSummary(ctx, topics)),
      topicLabel: result.topic.label,
      context: ctx,
      chips: []
    };
  }

  if (result.topic) {
    ctx.currentTopicId = result.topic.id;

    if (ctx.phase !== "CLARIFY") {
      ctx.phase = "CLARIFY";
      ctx.pendingClarifyTopicId = result.topic.id;
      return {
        action: "CLARIFY",
        reply: result.topic.clarify,
        topicLabel: result.topic.label,
        context: ctx,
        chips: [
          { label: "Sim", value: "Sim" },
          { label: "Não", value: "Não" }
        ]
      };
    }

    ctx.pendingClarifyTopicId = null;
    ctx.phase = "PROFILE";

    const answer = await resolveAnswer(result.topic, raw, history);

    const needsEscalation = ctx.urgency || result.topic.escalateHint;
    const urgencyNote =
      ctx.urgency && !result.topic.escalateHint
        ? "<br><br>Pelo que você descreveu, existe <strong>elemento de urgência</strong> (prazo/vencimento envolvido). Nesses casos eu não recomendo depender só de orientação geral: <em>o ideal é validar seu caso com a equipe ainda hoje</em>."
        : "";

    return {
      action: needsEscalation ? "ESCALATE" : "ANSWER",
      reply: answer + urgencyNote,
      source: result.topic.source,
      steps: result.topic.steps,
      topicLabel: result.topic.label,
      context: ctx,
      askProfile: true,
      chips: profileChips()
    };
  }

  if (ctx.pendingClarifyTopicId) {
    const pending = topics.find((t) => t.id === ctx.pendingClarifyTopicId);
    ctx.pendingClarifyTopicId = null;
    if (pending) {
      ctx.currentTopicId = pending.id;
      ctx.phase = "PROFILE";
      const answer = await resolveAnswer(pending, raw, history);
      return {
        action: "ANSWER",
        reply: answer,
        source: pending.source,
        steps: pending.steps,
        topicLabel: pending.label,
        context: ctx,
        askProfile: true,
        chips: profileChips()
      };
    }
  }

  ctx.phase = "CAPTURE";
  return {
    action: "FALLBACK",
    reply: fallbackText,
    context: ctx,
    chips: initialChips()
  };
}

