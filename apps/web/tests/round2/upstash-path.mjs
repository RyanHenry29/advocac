// Fase 1: Upstash mock vivo → limite distribuído deve valer (6ª lead → 429)
// Fase 2 (mock morto): fail-open para memória → lead nova → 200
// Uso: node tests/round2/upstash-path.mjs <baseURL> <fase1|fase2>
const base = process.argv[2] || "http://127.0.0.1:3102";
const phase = process.argv[3] || "fase1";

async function lead() {
  const res = await fetch(base + "/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Upstash Teste", whatsapp: "(11) 91234-5678" })
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json };
}

console.log(`\n=== UPSTASH PATH — ${phase} @ ${base} ===\n`);

if (phase === "fase1") {
  const statuses = [];
  for (let i = 0; i < 6; i++) {
    const r = await lead();
    statuses.push(r.status);
  }
  console.log(`  statuses: ${statuses.join(", ")}`);
  const ok5 = statuses.slice(0, 5).every((s) => s === 200);
  const six429 = statuses[5] === 429;
  console.log(`  ${ok5 ? "PASS" : "FAIL"}  5 primeiras → 200`);
  console.log(`  ${six429 ? "PASS" : "FAIL"}  6ª → 429 (limite distribuído aplicado)`);
  process.exitCode = ok5 && six429 ? 0 : 1;
} else {
  const r = await lead();
  console.log(`  status: ${r.status}`);
  const ok = r.status === 200;
  console.log(`  ${ok ? "PASS" : "FAIL"}  com mock morto → fail-open e aceita (200)`);
  process.exitCode = ok ? 0 : 1;
}
