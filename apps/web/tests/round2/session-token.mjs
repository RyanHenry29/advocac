// Sessão assinada + expiração — servidor com SESSION_SECRET definido
// Uso: node tests/round2/session-token.mjs <baseURL>
import { createHmac } from "node:crypto";

const base = process.argv[2] || "http://127.0.0.1:3104";
const SECRET = "segredo-de-teste-local"; // SESSION_SECRET do servidor de teste
let pass = 0;
let fail = 0;
const check = (name, cond, detail = "") => {
  cond ? pass++ : fail++;
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const mac = (payload) =>
  createHmac("sha256", SECRET).update(payload).digest("base64url").slice(0, 32);

async function post(path, body) {
  const r = await fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  let json = null;
  try {
    json = await r.json();
  } catch {}
  return { status: r.status, json };
}

const ctxOf = (sessionId) => ({
  sessionId,
  phase: "CAPTURE",
  currentTopicId: null,
  pendingClarifyTopicId: null,
  profile: null,
  urgency: false,
  lastUserText: ""
});

// 1) sessão nova devolve token com expiração (uuid.exp.assinatura)
const r1 = await post("/api/chat", { message: "meu CRAF está vencendo" });
check("sessão nova → 200", r1.status === 200, `status=${r1.status}`);
const signed = r1.json?.context?.sessionId || "";
const parts = signed.split(".");
const exp1 = Number(parts[1]);
const now = Math.floor(Date.now() / 1000);
check(
  "token no formato uuid.exp.assinatura",
  /^[0-9a-f-]{36}\.\d{10}\.[A-Za-z0-9_-]{16,}$/i.test(signed),
  signed.slice(0, 70)
);
check("exp no futuro (≤48h)", exp1 > now && exp1 <= now + 48 * 3600 + 5, `exp-now=${exp1 - now}s`);

// 2) round-trip mantém a MESMA sessão (id puro igual)
const r2 = await post("/api/chat", { message: "recebi uma exigência", context: r1.json.context });
check("round-trip → 200", r2.status === 200, `status=${r2.status}`);
const signed2 = r2.json?.context?.sessionId || "";
const exp2 = Number(signed2.split(".")[1]);
check(
  "sessão mantida no round-trip (mesmo uuid)",
  signed2.split(".")[0] === signed.split(".")[0],
  signed2.slice(0, 20)
);
check(
  "rotação deslizante (exp da resposta ≥ exp original)",
  Number.isFinite(exp2) && exp2 >= exp1,
  `exp1=${exp1} exp2=${exp2}`
);

// 3) sessionId forjado (2 partes / assinatura errada) → sessão NOVA
const forgedId = "00000000-0000-4000-8000-000000000000";
const r3 = await post("/api/chat", {
  message: "processo indeferido",
  context: ctxOf(`${forgedId}.assinaturafalsa`)
});
const got3 = r3.json?.context?.sessionId || "";
check("token forjado → 200 (não quebra o chat)", r3.status === 200, `status=${r3.status}`);
check(
  "token forjado é descartado (sessão nova ≠ forjada)",
  got3 !== `${forgedId}.assinaturafalsa` && !got3.startsWith(forgedId),
  got3.slice(0, 70)
);

// 4) uuid puro sem assinatura → descartado
const r4 = await post("/api/chat", {
  message: "habitualidade",
  context: ctxOf("11111111-2222-4333-8444-555555555555")
});
const got4 = r4.json?.context?.sessionId || "";
check("uuid puro sem assinatura → 200", r4.status === 200, `status=${r4.status}`);
check(
  "uuid puro sem assinatura é descartado",
  got4 !== "11111111-2222-4333-8444-555555555555",
  got4.slice(0, 70)
);

// 5) token EXPIRADO com assinatura correta → descartado
const expId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const pastExp = now - 60;
const expiredToken = `${expId}.${pastExp}.${mac(`${expId}.${pastExp}`)}`;
const r5 = await post("/api/chat", {
  message: "renovar craf",
  context: ctxOf(expiredToken)
});
const got5 = r5.json?.context?.sessionId || "";
check("token expirado → 200", r5.status === 200, `status=${r5.status}`);
check(
  "token expirado é descartado (assinatura válida, prazo vencido)",
  !got5.startsWith(expId),
  got5.slice(0, 70)
);

// 6) exp alterado sem re-assinar (tamper) → descartado
const tampered = `${parts[0]}.${exp1 + 999999}.${parts[2]}`;
const r6 = await post("/api/chat", {
  message: "craf vencido",
  context: ctxOf(tampered)
});
const got6 = r6.json?.context?.sessionId || "";
check("exp tamperado → 200", r6.status === 200, `status=${r6.status}`);
check("exp tamperado é descartado", !got6.startsWith(parts[0]), got6.slice(0, 70));

// 7) validação de domínio continua de pé
const r7 = await post("/api/chat", { message: "x", context: ctxOf(signed) });
const r7b = await post("/api/chat", {
  message: "x",
  context: { ...ctxOf(signed), phase: "HACK" }
});
check("contexto válido com token válido → 200", r7.status === 200, `status=${r7.status}`);
check("phase inválida continua → 400", r7b.status === 400, `status=${r7b.status}`);

console.log(`\n=== SESSION TOKEN: ${pass} PASS, ${fail} FAIL ===\n`);
process.exitCode = fail > 0 ? 1 : 0;
