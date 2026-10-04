export interface AuditEntryInput {
  at: string; // ISO string
  actorId?: string | null;
  actorRole?: string | null;
  entity: string;
  entityId: string;
  event: string;
  payload: Record<string, unknown>;
  prevHash: string;
}

/**
 * Deterministic canonical JSON stringifier with recursively sorted keys.
 */
export function canonicalJSON(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJSON).join(',') + ']';
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map(
    (k) => `"${k}":${canonicalJSON((obj as Record<string, unknown>)[k])}`
  );
  return '{' + pairs.join(',') + '}';
}

// Pure zero-dependency synchronous SHA-256 implementation for universal Node/Browser use
function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

export function sha256Sync(ascii: string): string {
  let i = 0, j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  for (i = 0; i < ascii.length; i++) {
    const code = ascii.charCodeAt(i);
    words[i >> 2] = (words[i >> 2] || 0) | (code << (24 - (i % 4) * 8));
  }

  words[asciiBitLength >> 5] = (words[asciiBitLength >> 5] || 0) | (0x80 << (24 - (asciiBitLength % 32)));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = [...hash];

    for (j = 0; j < 64; j++) {
      let w15 = w[j - 15] ?? 0;
      let w2 = w[j - 2] ?? 0;

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[j] = j < 16 ? (w[j] ?? 0) : ((w[j - 16] ?? 0) + s0 + (w[j - 7] ?? 0) + s1) | 0;

      const ch = (hash[4]! & hash[5]!) ^ (~hash[4]! & hash[6]!);
      const maj = (hash[0]! & hash[1]!) ^ (hash[0]! & hash[2]!) ^ (hash[1]! & hash[2]!);
      const sigma1 = rightRotate(hash[4]!, 6) ^ rightRotate(hash[4]!, 11) ^ rightRotate(hash[4]!, 25);
      const sigma0 = rightRotate(hash[0]!, 2) ^ rightRotate(hash[0]!, 13) ^ rightRotate(hash[0]!, 22);

      const temp1 = (hash[7]! + sigma1 + ch + k[j]! + w[j]!) | 0;
      const temp2 = (sigma0 + maj) | 0;

      hash[7] = hash[6]!;
      hash[6] = hash[5]!;
      hash[5] = hash[4]!;
      hash[4] = (hash[3]! + temp1) | 0;
      hash[3] = hash[2]!;
      hash[2] = hash[1]!;
      hash[1] = hash[0]!;
      hash[0] = (temp1 + temp2) | 0;
    }

    for (j = 0; j < 8; j++) {
      hash[j] = (hash[j]! + oldHash[j]!) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i]! >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

export function computeAuditHash(entry: AuditEntryInput): string {
  const content = entry.prevHash + canonicalJSON({
    at: entry.at,
    actorId: entry.actorId ?? null,
    actorRole: entry.actorRole ?? null,
    entity: entry.entity,
    entityId: entry.entityId,
    event: entry.event,
    payload: entry.payload,
  });
  return sha256Sync(content);
}

export function verifyAuditChain(
  entries: Array<{
    at: Date | string;
    actorId?: string | null;
    actorRole?: string | null;
    entity: string;
    entityId: string;
    event: string;
    payload: unknown;
    prevHash: string;
    hash: string;
  }>
): { valid: boolean; brokenIndex: number } {
  for (let i = 0; i < entries.length; i++) {
    const curr = entries[i]!;
    const atIso = typeof curr.at === 'string' ? curr.at : curr.at.toISOString();
    const expected = computeAuditHash({
      at: atIso,
      actorId: curr.actorId,
      actorRole: curr.actorRole,
      entity: curr.entity,
      entityId: curr.entityId,
      event: curr.event,
      payload: (curr.payload as Record<string, unknown>) ?? {},
      prevHash: curr.prevHash,
    });

    if (expected !== curr.hash) {
      return { valid: false, brokenIndex: i };
    }

    if (i > 0) {
      const prev = entries[i - 1]!;
      if (curr.prevHash !== prev.hash) {
        return { valid: false, brokenIndex: i };
      }
    }
  }

  return { valid: true, brokenIndex: -1 };
}
