// Validação estática: seed × migrations × RLS (pega drift como o vírgula fatal
// e coluna que não existe sem precisar de banco).
// Uso: node tests/round3/schema-seed-check.mjs
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const MIG = join(ROOT, "supabase", "migrations");
const SEED = join(ROOT, "supabase", "seed", "seed.sql");

let pass = 0;
let fail = 0;
const check = (name, cond, detail = "") => {
  cond ? pass++ : fail++;
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

// ---- parse: create table → colunas
function parseTables(sql) {
  const tables = new Map();
  const re = /create table (?:if not exists )?(\w+)\s*\(([\s\S]*?)\n\);/gi;
  let m;
  while ((m = re.exec(sql))) {
    const cols = new Set();
    for (const raw of m[2].split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      const first = line.split(/\s+/)[0].toLowerCase();
      if (["primary", "foreign", "unique", "check", "constraint"].includes(first)) continue;
      cols.add(first);
    }
    tables.set(m[1].toLowerCase(), cols);
  }
  return tables;
}

// ---- parse: insert into → tabela + colunas
function parseInserts(sql) {
  const out = [];
  const re = /insert into (\w+)\s*\(([^)]+)\)\s*values/gi;
  let m;
  while ((m = re.exec(sql))) {
    out.push({
      table: m[1].toLowerCase(),
      cols: m[2].split(",").map((c) => c.trim().toLowerCase())
    });
  }
  return out;
}

const migFiles = readdirSync(MIG)
  .filter((f) => f.endsWith(".sql"))
  .sort();
const migSql = migFiles.map((f) => readFileSync(join(MIG, f), "utf8")).join("\n");
const seedSql = readFileSync(SEED, "utf8");

const tables = parseTables(migSql);
check(
  `migrations criam tabelas (${migFiles.length} arquivos)`,
  tables.size >= 14,
  `tabelas=${tables.size}: ${[...tables.keys()].join(", ")}`
);

// ---- seed: toda tabela/coluna existe
const inserts = parseInserts(seedSql);
check(`seed tem inserts (${inserts.length} tabelas)`, inserts.length >= 5, inserts.map((i) => i.table).join(", "));

let missingTable = null;
let missingCol = null;
for (const ins of inserts) {
  if (!tables.has(ins.table)) {
    missingTable = ins.table;
    break;
  }
  for (const c of ins.cols) {
    if (!tables.get(ins.table).has(c)) {
      missingCol = `${ins.table}.${c}`;
      break;
    }
  }
  if (missingCol) break;
}
check("toda tabela do seed existe nas migrations", !missingTable, missingTable || "");
check("toda coluna do seed existe no create table", !missingCol, missingCol || "");

// ---- bug clássico: vírgula órfã antes de on conflict / fim de statement
const fatalComma = /,\s*(?:on conflict|;)/i.test(seedSql);
check("seed sem vírgula órfã antes de on conflict/fim", !fatalComma);

// ---- legal_topics: quantos tópicos o seed carrega (DEPLOYMENT.md manda 15)
const ltSection = (seedSql.match(/insert into legal_topics[\s\S]*?values([\s\S]*?)on conflict/i) || [])[1] || "";
const topicIds = ltSection.match(/^\s{2}'[A-Z_0-9]+',$/gm) || [];
check(
  "seed carrega15 tópicos em legal_topics (bate com DEPLOYMENT.md)",
  topicIds.length === 15,
  `encontrados=${topicIds.length}`
);

// ---- RLS: toda tabela criada tem enable row level security no003
const rlsSql = readFileSync(join(MIG, "003_create_rls_policies.sql"), "utf8");
const missingRls = [...tables.keys()].filter(
  (t) => !new RegExp(`alter table ${t} enable row level security`, "i").test(rlsSql)
);
check("RLS habilitado em toda tabela criada", missingRls.length === 0, missingRls.join(", ") || `${tables.size}/${tables.size}`);

// ---- API escreve só em tabelas com RLS
const apiTables = ["conversation_sessions", "conversation_messages", "unknown_questions", "leads"];
const apiNoRls = apiTables.filter((t) => !tables.has(t) || missingRls.includes(t));
check("tabelas gravadas pela API têm RLS", apiNoRls.length === 0, apiNoRls.join(", ") || apiTables.join(", "));

console.log(`\n=== SCHEMA×SEED×RLS: ${pass} PASS, ${fail} FAIL ===\n`);
process.exitCode = fail > 0 ? 1 : 0;
