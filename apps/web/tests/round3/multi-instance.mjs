// Rate limit multi-instância — mesma janela, dois processos `next start`.
// fase memoria: sem UPSTASH → buckets por processo, nada compartilha
// fase upstash: com UPSTASH → contador compartilhado via mock REST
// Uso: node tests/round3/multi-instance.mjs <memoria|upstash> <baseA> <baseB>
const [phase, baseA, baseB] = process.argv.slice(2);
if (!["memoria", "upstash"].includes(phase) || !baseA || !baseB) {
  console.error("uso: node tests/round3/multi-instance.mjs <memoria|upstash> <baseA> <baseB>");
  process.exit(2);
}

let pass = 0;
let fail = 0;
const check = (name, cond, detail = "") => {
  cond ? pass++ : fail++;
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

async function lead(base) {
  const r = await fetch(`${base}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Teste Multi", whatsapp: "11912345678" })
  });
  return r.status;
}

// sequência:3 em A,2 em B,1 em A —5 cabem na janela de5/min
const seq = [baseA, baseA, baseA, baseB, baseB, baseA];
const statuses = [];
for (const base of seq) statuses.push(await lead(base));
console.log(`  fase=${phase} statuses=${statuses.join(",")}`);

if (phase === "memoria") {
  check(
    "sem Upstash: nada bloqueia entre instâncias (6×200)",
    statuses.every((s) => s === 200),
    statuses.join(",")
  );
  check(
    "comportamento esperado do bucket em memória (A=4<5, B=2<5)",
    statuses[5] === 200,
    `6ª=${statuses[5]}`
  );
} else {
  const firstFive = statuses.slice(0, 5);
  check(
    "com Upstash:5 primeiras atravessam as duas instâncias (200)",
    firstFive.every((s) => s === 200),
    firstFive.join(",")
  );
  check(
    "com Upstash:6ª bloqueada (contador compartilhado) → 429",
    statuses[5] === 429,
    `6ª=${statuses[5]}`
  );
}

console.log(`\n=== MULTI-INSTÂNCIA (${phase}): ${pass} PASS, ${fail} FAIL ===\n`);
process.exitCode = fail > 0 ? 1 : 0;
