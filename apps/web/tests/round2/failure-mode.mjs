// Modo de falha: SUPABASE_URL apontando para domínio inexistente.
// Uso: node tests/round2/failure-mode.mjs [baseURL]
const base = process.argv[2] || "http://127.0.0.1:3101";
let pass = 0;
let fail = 0;
const check = (name, cond, detail = "") => {
  cond ? pass++ : fail++;
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

async function post(path, body) {
  const res = await fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json, headers: res.headers };
}

console.log(`\n=== FAILURE MODE @ ${base} (SUPABASE configurado mas inacessível) ===\n`);

{
  const res = await fetch(base + "/api/health");
  const json = await res.json();
  check(
    "health reporta db=error (não ok falso)",
    json.db === "error",
    `db=${json.db} llm=${json.llm}`
  );
  check("health status continua ok (site de pé)", json.status === "ok");
}

{
  const r = await post("/api/leads", {
    name: "Teste Falha",
    whatsapp: "(11) 91234-5678",
    message: "gravacao deve falhar mas handoff segue"
  });
  check("leads → 200 mesmo com banco fora", r.status === 200 && r.json?.ok === true);
  check("leads → handoffUrl presente (canal primário funciona)", typeof r.json?.handoffUrl === "string");
}

{
  const r = await post("/api/chat", { message: "meu CRAF está vencendo" });
  check("chat → 200 com banco fora", r.status === 200, `status=${r.status}`);
  check(
    "chat cai para KB local (origin=local)",
    r.headers.get("x-kb-origin") === "local",
    `origin=${r.headers.get("x-kb-origin")}`
  );
  check("chat responde com texto", typeof r.json?.reply === "string" && r.json.reply.length > 20);
}

console.log(`\n=== RESULTADO: ${pass} PASS, ${fail} FAIL ===\n`);
process.exit(fail > 0 ? 1 : 0);
