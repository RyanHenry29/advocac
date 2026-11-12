import { createHmac, timingSafeEqual } from "node:crypto";

// Segredo da sessão: SESSION_SECRET dedicado, ou derivado da service_role
// (se não há Supabase configurado, não há banco para proteger — id puro passa).
const secret = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Expiração deslizante: cada resposta re-assina com exp novo; token parado
// 48h vira sessão nova (chat continua, só perde o contexto). Emergência:
// trocar o segredo derruba todos os tokens de uma vez.
const TTL_SECONDS = 48 * 60 * 60;

function mac(payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url").slice(0, 32);
}

export function signSessionId(id: string): string {
  if (!secret) return id;
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  return `${id}.${exp}.${mac(`${id}.${exp}`)}`;
}

/** Devolve o id puro se a assinatura bater E o token não venceu; null caso contrário. */
export function verifySessionId(token: string): string | null {
  if (!secret) return token;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, expRaw, sig] = parts;
  const exp = Number(expRaw);
  if (!id || !Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return null;
  const expected = mac(`${id}.${exp}`);
  if (sig.length !== expected.length) return null;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? id : null;
}
