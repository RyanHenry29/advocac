// Homologação de produção — bateria externa contra qualquer baseURL publicada.
// Sem --expect: roda e imprime FATOS (útil local). Com --expect: asserta.
// Uso: node tests/round3/homologation.mjs <baseURL> [--expect db=ok] [--expect llm=groq] \
//                               [--expect origin=supabase] [--deep]
const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith("--"));
const expects = {};
let deep = false;
for (const a of args) {
  if (a.startsWith("--expect=")) {
    const [k, v] = a.slice("--expect=".length).split("=");
    expects[k] = v;
  }
  if (a === "--deep") deep = true;
}
if (!base) {
  console.error("uso: node tests/round3/homologation.mjs <baseURL> [--expect k=v]... [--deep]");
  process.exit(2);
}

let pass = 0;
let fail = 0;
const check = (name, cond, detail = "") => {
  cond ? pass++ : fail++;
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
const fact = (name, detail) => console.log(`  FACT  ${name} — ${detail}`);

const get = async (path) => {
  const r = await fetch(base + path);
  let text = "";
  try {
    text = await r.text();
  } catch {}
  return { status: r.status, headers: r.headers, text };
};
const post = async (path, body) => {
  const r = await fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  let json = null;
  try {
    json = await r.json();
  } catch {}
  return { status: r.status, headers: r.headers, json };
};

console.log(`\n=== HOMOLOGAÇÃO @ ${base} ${deep ? "(deep)" : ""} ===\n`);

// ----1) páginas
const pages = [
  "/", "/atuacao", "/central-cac", "/atendimento", "/escritorio",
  "/diagnostico", "/contato", "/termos", "/privacidade", "/cookies"
];
for (const p of pages) {
  const r = await get(p);
  check(`GET ${p} → 200`, r.status === 200, `status=${r.status}`);
}
const nf = await get("/rota-inexistente");
check("404 → 404", nf.status === 404, `status=${nf.status}`);

// ----2) headers de segurança
const home = await get("/");
const h = home.headers;
check("X-Frame-Options: DENY", (h.get("x-frame-options") || "").toUpperCase() === "DENY", h.get("x-frame-options") || "ausente");
check("X-Content-Type-Options: nosniff", h.get("x-content-type-options") === "nosniff");
check("HSTS presente", Boolean(h.get("strict-transport-security")));
const csp = h.get("content-security-policy") || "";
check("CSP presente", csp.length > 0);
check("CSP frame-ancestors 'none'", csp.includes("frame-ancestors 'none'"));
check("CSP form-action 'self'", csp.includes("form-action 'self'"));
check("CSP permite GTM (frame-src)", csp.includes("googletagmanager.com"));
check("sem X-Powered-By", !h.get("x-powered-by"));

// ----3) arquivos SEO
for (const p of ["/sitemap.xml", "/robots.txt", "/manifest.webmanifest", "/icon.ico"]) {
  const r = await get(p);
  check(`GET ${p} → 200`, r.status === 200, `status=${r.status}`);
}
check("robots bloqueia /api/", home.text.length >= 0 && (await get("/robots.txt")).text.includes("/api/"));

// ----4) health dinâmico + fatos de integração
const h1 = await get("/api/health");
const h2 = await get("/api/health");
let health = {};
try {
  health = JSON.parse(h1.text);
} catch {}
check("health → 200", h1.status === 200, `status=${h1.status}`);
check(
  "health dinâmico (timestamps distintos)",
  health.timestamp !== (() => { try { return JSON.parse(h2.text).timestamp; } catch { return null; } })(),
  `${health.timestamp} vs ${(() => { try { return JSON.parse(h2.text).timestamp; } catch { return "?" + h2.status; } })()}`
);
fact("db", health.db);
fact("llm", health.llm);
if (expects.db) check(`--expect db=${expects.db}`, health.db === expects.db, `obtido=${health.db}`);
if (expects.llm) check(`--expect llm=${expects.llm}`, health.llm === expects.llm, `obtido=${health.llm}`);

// ----5) chat: contrato + origem da KB
const chat = await post("/api/chat", { message: "meu CRAF está vencendo" });
const origin = chat.headers.get("x-kb-origin") || "?";
const llmHdr = chat.headers.get("x-llm") || "?";
check("chat → 200", chat.status === 200, `status=${chat.status}`);
check("chat tem reply substancial", typeof chat.json?.reply === "string" && chat.json.reply.length > 50);
check("chat devolve sessionId", typeof chat.json?.context?.sessionId === "string" && chat.json.context.sessionId.length > 20);
fact("X-KB-Origin", origin);
fact("X-LLM", llmHdr);
if (expects.origin) {
  check(`--expect origin=${expects.origin}`, origin === expects.origin, `obtido=${origin}`);
}

const refuse = await post("/api/chat", { message: "como limpar minha pistola" });
check("recusa operacional → REFUSE", refuse.json?.action === "REFUSE", `action=${refuse.json?.action}`);

// ----6) leads
const lead = await post("/api/leads", { name: "Homologacao Teste", whatsapp: "11912345678", message: "homologação" });
check("lead válido → 200", lead.status === 200, `status=${lead.status}`);
check("lead devolve handoff wa.me", String(lead.json?.handoffUrl || "").includes("wa.me/"), String(lead.json?.handoffUrl).slice(0, 60));
const leadBad = await post("/api/leads", { name: "x", whatsapp: "00000000000" });
check("lead inválido → 400", leadBad.status === 400, `status=${leadBad.status}`);

// ----7) rate limit (só --deep: queima a janela do IP do runner)
if (deep) {
  let last = 200;
  for (let i = 0; i < 6; i++) {
    last = (await post("/api/leads", { name: "Deep Burn", whatsapp: "11912345678" })).status;
  }
  check("leads:6ª no minuto → 429", last === 429, `6ª=${last}`);
  let lastChat = 200;
  for (let i = 0; i < 21; i++) {
    lastChat = (await post("/api/chat", { message: `deep burn ${i}` })).status;
  }
  check("chat:21ª no minuto → 429", lastChat === 429, `21ª=${lastChat}`);
} else {
  console.log("  SKIP  rate limit burn (rode com --deep para queimar a janela)");
}

console.log(`\n=== HOMOLOGAÇÃO: ${pass} PASS, ${fail} FAIL ===\n`);
process.exitCode = fail > 0 ? 1 : 0;
