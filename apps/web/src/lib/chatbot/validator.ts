const forbiddenPromisePatterns: RegExp[] = [
  /\bgarant[io]|garantimos|garanto\b/i,
  /\b(com certeza|certamente|sem d[úu]vida)\b.{0,40}\b(deferido|aprovado|concedido|vit[óo]ria)\b/i,
  /\bvoc[êe] (vai|ir[áa]) (ganhar|conseguir|ser aprovado)\b/i,
  /\bdeferimento garantido\b/i,
  /\b100% de chance\b/i
];

export function validateReply(reply: string): { ok: boolean; reason?: string } {
  if (!reply || reply.trim().length < 10) {
    return { ok: false, reason: "empty_or_too_short" };
  }

  for (const pattern of forbiddenPromisePatterns) {
    if (pattern.test(reply)) {
      return { ok: false, reason: "promise_of_result" };
    }
  }

  return { ok: true };
}
