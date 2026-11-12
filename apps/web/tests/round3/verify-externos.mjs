// Verificação das integrações REAIS — roda só com as envs preenchidas.
// Cada bloco sem env imprime SKIP (não é falha); com env, prova real no serviço.
// Uso: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... [SUPABASE_ANON_KEY=...] \
//      [GROQ_API_KEY=...] [UPSTASH_REDIS_REST_URL=...] [UPSTASH_REDIS_REST_TOKEN=...] \
//      node tests/round3/verify-externos.mjs
let pass = 0;
let fail = 0;
let skip = 0;
const check = (name, cond, detail = "") => {
  cond ? pass++ : fail++;
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
const ok = (name, detail = "") => {
  skip++;
  console.log(`  SKIP  ${name}${detail ? ` — ${detail}` : ""}`);
};

const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPA_ANON = process.env.SUPABASE_ANON_KEY;
const GROQ = process.env.GROQ_API_KEY;
const UP_URL = process.env.UPSTASH_REDIS_REST_URL;
const UP_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// ---------- SUPABASE ----------
if (!SUPA_URL || !SUPA_KEY) {
  ok("Supabase", "sem SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY");
} else {
  const admin = (path, init = {}) =>
    fetch(`${SUPA_URL}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: SUPA_KEY,
        Authorization: `Bearer ${SUPA_KEY}`,
        "Content-Type": "application/json",
        ...init.headers
      }
    });

  //1) base legal carregada
  const topicsRes = await admin("legal_topics?select=id&active=eq.true");
  const topics = topicsRes.ok ? await topicsRes.json() : [];
  check(
    "legal_topics legível via service_role (seed rodou)",
    topicsRes.ok && topics.length >= 15,
    `status=${topicsRes.status} count=${topics.length} (esperado ≥15)`
  );

  //2) gravação de lead + RLS (anon não lê leads)
  if (SUPA_ANON) {
    const probeId = crypto.randomUUID();
    const ins = await admin("leads", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ name: "PROBE-HOMOLOG", whatsapp: "11900000000", notes: probeId })
    });
    const rows = ins.ok ? await ins.json() : [];
    const leadId = rows[0]?.id;
    check("insert de lead via service_role", ins.ok && Boolean(leadId), `status=${ins.status}`);

    const anonRes = await fetch(`${SUPA_URL}/rest/v1/leads?select=id`, {
      headers: { apikey: SUPA_ANON, Authorization: `Bearer ${SUPA_ANON}` }
    });
    const anonRows = anonRes.ok ? await anonRes.json() : null;
    check(
      "anon NÃO lê leads (RLS)",
      anonRes.ok && Array.isArray(anonRows) && anonRows.length === 0,
      `status=${anonRes.status} rows=${anonRows === null ? "?" : anonRows.length}`
    );

    if (leadId) await admin(`leads?id=eq.${leadId}`, { method: "DELETE" });

    //3) isolamento entre sessões
    const sA = crypto.randomUUID();
    const sB = crypto.randomUUID();
    await admin("conversation_sessions", {
      method: "POST",
      body: JSON.stringify([
        { id: sA, status: "active" },
        { id: sB, status: "active" }
      ])
    });
    await admin(`conversation_sessions?id=eq.${sA}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "handoff" })
    });
    const bRes = await admin(`conversation_sessions?id=eq.${sB}&select=status`);
    const bRows = bRes.ok ? await bRes.json() : [];
    check(
      "isolamento: atualizar sessão A não toca na B",
      bRows[0]?.status === "active",
      `B.status=${bRows[0]?.status}`
    );
    await admin(`conversation_sessions?id=in.(${sA},${sB})`, { method: "DELETE" });
  } else {
    ok("RLS de leads/isolamento", "sem SUPABASE_ANON_KEY (peque no dashboard: Settings → API)");
  }
}

// ---------- GROQ ----------
if (!GROQ) {
  ok("Groq", "sem GROQ_API_KEY");
} else {
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${GROQ}` }
  });
  check("Groq responde200 para a chave", res.status === 200, `status=${res.status}`);
}

// ---------- UPSTASH ----------
if (!UP_URL || !UP_TOKEN) {
  ok("Upstash", "sem UPSTASH_REDIS_REST_URL/TOKEN");
} else {
  const res = await fetch(`${UP_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${UP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify([["PING"]])
  });
  let pong = null;
  try {
    const data = await res.json();
    pong = data?.[0]?.result;
  } catch {}
  check("Upstash responde PONG no pipeline", res.ok && pong === "PONG", `status=${res.status} result=${pong}`);
}

console.log(`\n=== EXTERNOS: ${pass} PASS, ${fail} FAIL, ${skip} SKIP ===\n`);
process.exitCode = fail > 0 ? 1 : 0;
