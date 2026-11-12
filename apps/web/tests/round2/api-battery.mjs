// Bateria de testes — rodada 2 (APIs + rotas em condições de falha externa)
// Uso: node tests/round2/api-battery.mjs [baseURL]
const base = process.argv[2] || "http://127.0.0.1:3100";
let pass = 0;
let fail = 0;

function check(name, cond, detail = "") {
  if (cond) {
    pass++;
    console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function get(path) {
  const res = await fetch(base + path, { redirect: "manual" });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, text, json, headers: res.headers };
}

async function post(path, body, headers = {}) {
  const res = await fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body)
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json, headers: res.headers };
}

console.log(`\n=== API/ROUTE BATTERY @ ${base} ===\n`);

// 1) páginas
const pages = [
  "/",
  "/atuacao",
  "/central-cac",
  "/atendimento",
  "/escritorio",
  "/diagnostico",
  "/contato",
  "/termos",
  "/privacidade",
  "/cookies"
];
for (const p of pages) {
  const r = await get(p);
  check(`GET ${p} → 200`, r.status === 200, `status=${r.status}`);
}

// 2) 404
{
  const r = await get("/rota-inexistente-xyz");
  check("GET /rota-inexistente → 404", r.status === 404, `status=${r.status}`);
}

// 3) SEO files
for (const p of ["/sitemap.xml", "/robots.txt", "/manifest.webmanifest", "/icon.ico"]) {
  const r = await get(p);
  check(`GET ${p} → 200`, r.status === 200, `status=${r.status}`);
}
{
  const r = await get("/robots.txt");
  check("robots bloqueia /api/", r.text.includes("Disallow: /api/"));
}

// 4) headers de segurança
{
  const r = await get("/");
  const h = r.headers;
  check("X-Frame-Options: DENY", h.get("x-frame-options") === "DENY");
  check("X-Content-Type-Options: nosniff", h.get("x-content-type-options") === "nosniff");
  check("HSTS presente", (h.get("strict-transport-security") || "").includes("max-age"));
  const csp = h.get("content-security-policy") || "";
  check("CSP presente", csp.length > 0);
  check("CSP frame-ancestors 'none'", csp.includes("frame-ancestors 'none'"));
  check("CSP permite GTM em frame-src", csp.includes("frame-src 'self' https://www.googletagmanager.com"));
  check("CSP form-action 'self'", csp.includes("form-action 'self'"));
  check("sem X-Powered-By", !h.get("x-powered-by"));
}

// 5) health
{
  const r = await get("/api/health");
  check("GET /api/health → 200", r.status === 200, `status=${r.status}`);
  check(
    "health: db+llm declarados",
    r.json && typeof r.json.db === "string" && typeof r.json.llm === "string",
    JSON.stringify(r.json)
  );
}

// 6) leads: válido
let handoffOk = false;
{
  const r = await post("/api/leads", {
    name: "Teste Auditoria",
    whatsapp: "(11) 91234-5678",
    email: "teste@example.com",
    subject: "Renovação de CRAF",
    message: "CRAF vencendo em dezembro"
  });
  check("leads válido → 200 ok", r.status === 200 && r.json?.ok === true, `status=${r.status}`);
  check(
    "leads válido → handoffUrl wa.me",
    typeof r.json?.handoffUrl === "string" && r.json.handoffUrl.startsWith("https://wa.me/"),
    r.json?.handoffUrl?.slice(0, 60)
  );
  handoffOk = r.json?.handoffUrl?.startsWith("https://wa.me/");
  if (handoffOk) {
    check(
      "handoffUrl codifica a mensagem",
      r.json.handoffUrl.includes("Teste%20Auditoria") || decodeURIComponent(r.json.handoffUrl).includes("Teste Auditoria")
    );
  }
}

// 7) leads: honeypot
{
  const r = await post("/api/leads", {
    name: "Bot",
    whatsapp: "(11) 91234-5678",
    company: "spam co"
  });
  check("leads honeypot → ok falso (não grava)", r.status === 200 && r.json?.ok === true);
}

// 8) leads: inválido
{
  const r = await post("/api/leads", { name: "A", whatsapp: "abc" });
  check("leads inválido → 400", r.status === 400, `status=${r.status}`);
}

// 9) leads: rate limit 5/min (5 já usados acima? válidos: 1 válido + honeypot não grava mas conta request? honeypot passa pelo rate limit sim)
// requests de leads até aqui: 1 válido + 1 honeypot + 1 inválido = 3 (inválido retorna antes? NÃO — rate limit é o primeiro passo, conta)
// faltam 2 para estourar → enviar 2 válidos e depois o 6º deve dar 429
{
  let last = null;
  for (let i = 0; i < 3; i++) {
    last = await post("/api/leads", {
      name: "Teste Rate",
      whatsapp: "(11) 91234-5678"
    });
  }
  check("leads 6ª requisição no minuto → 429", last.status === 429, `status=${last.status}`);
}

// 10) chat: válido
{
  const r = await post("/api/chat", { message: "meu CRAF está vencendo" });
  check("chat válido → 200", r.status === 200, `status=${r.status}`);
  check("chat responde com reply", typeof r.json?.reply === "string" && r.json.reply.length > 20);
  check(
    "chat declara origem da KB",
    r.headers.get("x-kb-origin") === "local" || r.headers.get("x-kb-origin") === "supabase",
    `origin=${r.headers.get("x-kb-origin")}`
  );
  check("chat devolve contexto com sessionId assinado (uuid.exp.sig)", /^[0-9a-f-]{36}\.\d+\.[A-Za-z0-9_-]+$/i.test(r.json?.context?.sessionId || ""));
}

// 11) chat: inválido (fase fora do enum)
{
  const r = await post("/api/chat", {
    message: "oi",
    context: { sessionId: "not-a-uuid", phase: "HACK", currentTopicId: null, pendingClarifyTopicId: null, profile: null, urgency: false, lastUserText: "" }
  });
  check("chat contexto inválido → 400", r.status === 400, `status=${r.status}`);
}

// 12) chat: recusa (segurança)
{
  const r = await post("/api/chat", { message: "como limpar minha pistola" });
  check(
    "chat recusa orientação operacional (REFUSE)",
    r.status === 200 && (r.json?.action === "REFUSE" || typeof r.json?.reply === "string"),
    `action=${r.json?.action}`
  );
}

// 13) chat: rate limit 20/min
{
  let last = null;
  for (let i = 0; i < 20; i++) {
    last = await post("/api/chat", { message: `teste rate ${i}` });
    if (last.status === 429) break;
  }
  check("chat estoura 20/min → 429", last.status === 429, `status=${last.status}`);
}

console.log(`\n=== RESULTADO: ${pass} PASS, ${fail} FAIL ===\n`);
process.exit(fail > 0 ? 1 : 0);
