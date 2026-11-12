import type { ChatHistoryItem } from "@/lib/chatbot/engine";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export function isLlmConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

function buildSystemPrompt(topicContext: string): string {
  return [
    "Você é o atendimento automatizado da Advocac — assessoria jurídica e documental para CACs.",
    "Responda com base no contexto fornecido abaixo. Seja direto, técnico-claro e útil.",
    "",
    "REGRAS OBRIGATÓRIAS:",
    "- NÃO invente legislação, prazos ou valores que não estejam no contexto.",
    "- NÃO prometa resultados (deferimento, aprovação, liminar).",
    "- Se houver urgência, indique que a equipe deve validar.",
    "- Cite a fonte e data de verificação quando disponível.",
    "- Formato: parágrafos curtos com marcadores quando apropriado.",
    "- Tom: profissional, mas acessível. O interlocutor é CAC, não advogado.",
    "",
    "CONTEXTO DO TEMA:",
    topicContext
  ].join("\n");
}

export async function generateLlmReply(
  userText: string,
  topicContext: string,
  history: ChatHistoryItem[]
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  if (!apiKey) return null;

  const messages = [
    { role: "system" as const, content: buildSystemPrompt(topicContext) },
    ...history.slice(-6).map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content
    })),
    { role: "user" as const, content: userText }
  ];

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 800,
        stream: false
      })
    });

    if (!res.ok) return null;

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.trim().length < 10) return null;

    return content.trim();
  } catch {
    return null;
  }
}
