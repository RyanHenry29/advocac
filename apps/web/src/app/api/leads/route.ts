import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientKey } from "@/lib/security/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { waLink } from "@/lib/config";

export const runtime = "nodejs";

function isValidBrMobile(value: string): boolean {
  const validDDDs = new Set([
    11,12,13,14,15,16,17,18,19,
    21,22,24,27,28,
    31,32,33,34,35,37,38,39,
    41,42,43,44,45,46,47,48,49,
    51,53,54,55,61,62,63,64,65,66,67,68,69,
    71,73,74,75,77,79,
    81,82,83,84,85,86,87,88,89,
    91,92,93,94,95,96,97,98,99
  ]);
  const d = value.replace(/\D/g, "").replace(/^55/, "");
  if (d.length !== 10 && d.length !== 11) return false;
  const ddd = parseInt(d.slice(0, 2), 10);
  if (!validDDDs.has(ddd)) return false;
  if (d.length === 11 && d[2] !== "9") return false;
  if (d.length === 10 && d[2] === "0") return false;
  return true;
}

const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80),
  whatsapp: z
    .string()
    .refine(isValidBrMobile, "WhatsApp inválido — use DDD + número, ex.: (11) 91234-5678."),
  email: z.string().email("E-mail inválido.").max(120).optional().or(z.literal("")),
  subject: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
  company: z.string().max(120).optional()
});

export async function POST(req: Request) {
  const limit = await rateLimit(clientKey(req, "leads"), 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.company) {
    return NextResponse.json({ ok: true });
  }

  const subject = data.subject?.trim() || "Contato pelo site";
  const message = data.message?.trim();

  const summary = [
    "Olá, venho pelo site da Advocac.",
    "",
    `Nome: ${data.name}`,
    `Assunto: ${subject}`,
    message ? `Situação: ${message}` : "Situação: explico por áudio/ligação.",
    data.email ? `E-mail: ${data.email}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("[leads] SUPABASE não configurado — lead não gravado (handoff segue)");
  } else {
    try {
      const { error } = await supabase.from("leads").insert({
        name: data.name,
        whatsapp: data.whatsapp.replace(/\D/g, ""),
        email: data.email || null,
        subject,
        notes: message || null,
        status: "new",
        score: message ? 60 : 40
      });
      if (error) {
        console.error(
          `[leads] insert recusado: code=${error.code ?? "?"} msg=${error.message}`
        );
      }
    } catch (err) {
      console.error(
        "[leads] insert exceção:",
        err instanceof Error ? err.message : "unknown"
      );
    }
  }

  return NextResponse.json({ ok: true, handoffUrl: waLink(summary) });
}