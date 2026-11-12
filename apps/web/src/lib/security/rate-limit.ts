interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60_000;

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const UPSTASH_TIMEOUT_MS = 1_000;

function prune(bucket: Bucket, windowMs: number): void {
  const cutoff = Date.now() - windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
}

function cleanupAllBuckets(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.timestamps.length === 0) {
      buckets.delete(key);
    }
  }
}

function memoryLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  cleanupAllBuckets();

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  prune(bucket, windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - Date.now()) / 1000);
    return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
  }

  bucket.timestamps.push(Date.now());
  return { allowed: true };
}

async function upstashPipeline(commands: string[][]): Promise<unknown[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTASH_TIMEOUT_MS);
  try {
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(commands),
      cache: "no-store",
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`upstash_http_${res.status}`);
    const data = (await res.json()) as Array<{ result: unknown }>;
    if (!Array.isArray(data)) throw new Error("upstash_bad_shape");
    return data.map((r) => r.result);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Janela deslizante por Redis (Upstash REST) quando UPSTASH_REDIS_REST_URL/TOKEN
 * existem — vale entre instâncias serverless. Sem as envs, bucket em memória
 * (por instância). Falha no Redis cai para memória (fail-open) com log.
 */
async function distributedLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfter?: number } | null> {
  const now = Date.now();
  const redisKey = `rl:${key}`;
  const member = `${now}:${Math.random().toString(36).slice(2, 10)}`;

  try {
    // 1) expira janela antiga e conta
    const [, counted] = await upstashPipeline([
      ["ZREMRANGEBYSCORE", redisKey, "-inf", String(now - windowMs)],
      ["ZCARD", redisKey]
    ]);
    const count = typeof counted === "number" ? counted : 0;

    if (count >= limit) {
      const oldestRes = await upstashPipeline([["ZRANGE", redisKey, "0", "0", "WITHSCORES"]]);
      const oldestPair = oldestRes[0];
      const oldest =
        Array.isArray(oldestPair) && typeof oldestPair[1] === "string"
          ? Number(oldestPair[1])
          : now;
      const retryAfter = Math.max(Math.ceil((oldest + windowMs - now) / 1000), 1);
      return { allowed: false, retryAfter };
    }

    // 2) registra a requisição atual
    await upstashPipeline([
      ["ZADD", redisKey, String(now), member],
      ["PEXPIRE", redisKey, String(windowMs * 2)]
    ]);
    return { allowed: true };
  } catch (err) {
    console.error(
      "[rate-limit] upstash falhou, usando memoria:",
      err instanceof Error ? err.message : "unknown"
    );
    return null;
  }
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfter?: number }> {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    const distributed = await distributedLimit(key, limit, windowMs);
    if (distributed) return distributed;
  }
  return memoryLimit(key, limit, windowMs);
}

export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
