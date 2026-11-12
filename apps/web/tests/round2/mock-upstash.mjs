// Mock mínimo da API REST do Upstash (pipeline) para testar o caminho
// distribuído do rate-limit sem serviço externo.
// Uso: node tests/round2/mock-upstash.mjs <porta>
import http from "node:http";

const port = Number(process.argv[2] || 3800);
const sets = new Map(); // key -> Map(member -> score)

function zremrangebyscore(key, min, max) {
  const set = sets.get(key);
  if (!set) return 0;
  const maxN = Number(max);
  let removed = 0;
  for (const [m, s] of set) {
    if (s <= maxN) {
      set.delete(m);
      removed++;
    }
  }
  return removed;
}

function exec(cmd) {
  const [name, ...args] = cmd;
  switch (name.toUpperCase()) {
    case "ZREMRANGEBYSCORE":
      return zremrangebyscore(args[0], args[1], args[2]);
    case "ZCARD":
      return sets.get(args[0])?.size ?? 0;
    case "ZADD": {
      const key = args[0];
      const score = Number(args[1]);
      const member = args[2];
      if (!sets.has(key)) sets.set(key, new Map());
      const existed = sets.get(key).has(member);
      sets.get(key).set(member, score);
      return existed ? 0 : 1;
    }
    case "PEXPIRE":
      return 1;
    case "ZRANGE": {
      const set = sets.get(args[0]);
      if (!set) return [];
      const sorted = [...set.entries()].sort((a, b) => a[1] - b[1]);
      return sorted.slice(0, 1).flatMap(([m, s]) => [m, String(s)]);
    }
    default:
      return null;
  }
}

const server = http.createServer((req, res) => {
  if (req.method !== "POST" || !req.url.includes("pipeline")) {
    res.writeHead(404).end();
    return;
  }
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    let cmds;
    try {
      cmds = JSON.parse(body);
    } catch {
      res.writeHead(400).end();
      return;
    }
    const results = cmds.map((c) => ({ result: exec(c) }));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(results));
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`mock-upstash listening on ${port}`);
});
