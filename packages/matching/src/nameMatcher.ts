export interface NameMatchResult {
  score: number;
  status: 'PASS' | 'WARN' | 'FIXABLE';
  reasons: string[];
  matchedTokens: Array<{ tokenA: string; tokenB: string; similarity: number; type: 'exact' | 'initial' | 'fuzzy' | 'folded' }>;
  unmatchedA: string[];
  unmatchedB: string[];
  isKannadaScript: boolean;
}

// Common Indian honorifics to strip
const HONORIFICS = new Set([
  'mr', 'mrs', 'ms', 'miss', 'master',
  'shri', 'sri', 'shree', 'smt', 'shrimati',
  'kumari', 'km', 'dr', 'prof', 'late', 'selvi'
]);

// Kannada to Latin basic phoneme mapping
const KANNADA_TO_LATIN: Record<string, string> = {
  'ಅ': 'a', 'ಆ': 'aa', 'ಇ': 'i', 'ಈ': 'ee', 'ಉ': 'u', 'ಊ': 'oo',
  'ಋ': 'ru', 'ಎ': 'e', 'ಏ': 'ee', 'ಐ': 'ai', 'ಒ': 'o', 'ಓ': 'oo', 'ಔ': 'au',
  'ಕ': 'k', 'ಖ': 'kh', 'ಗ': 'g', 'ಘ': 'gh', 'ಙ': 'ng',
  'ಚ': 'ch', 'ಛ': 'chh', 'ಜ': 'j', 'ಝ': 'jh', 'ಞ': 'ny',
  'ಟ': 't', 'ಠ': 'th', 'ಡ': 'd', 'ಢ': 'dh', 'ಣ': 'n',
  'ತ': 't', 'ಥ': 'th', 'ದ': 'd', 'ಧ': 'dh', 'ನ': 'n',
  'ಪ': 'p', 'ಫ': 'ph', 'ಬ': 'b', 'ಭ': 'bh', 'ಮ': 'm',
  'ಯ': 'y', 'ರ': 'r', 'ಲ': 'l', 'ವ': 'v', 'ಶ': 'sh', 'ಷ': 'sh', 'ಸ': 's', 'ಹ': 'h', 'ಳ': 'l',
  'ಾ': 'a', 'ಿ': 'i', 'ೀ': 'ee', 'ು': 'u', 'ೂ': 'oo', 'ೃ': 'ru',
  'ೆ': 'e', 'ೇ': 'ee', 'ೈ': 'ai', 'ೊ': 'o', 'ೋ': 'oo', 'ೌ': 'au',
  '್': '', 'ಂ': 'm', 'ಃ': 'h'
};

export function isKannada(text: string): boolean {
  return /[\u0C80-\u0CFF]/.test(text);
}

export function transliterateKannada(text: string): string {
  let result = '';
  for (const ch of text) {
    result += KANNADA_TO_LATIN[ch] ?? ch;
  }
  return result;
}

/**
 * Normalises an input string: Unicode NFKC, lowercase, strip punctuation, strip honorifics.
 */
export function normaliseName(raw: string): string {
  if (!raw) return '';
  let str = raw.normalize('NFKC').toLowerCase();
  
  if (isKannada(str)) {
    str = transliterateKannada(str);
  }

  // Remove dots from initials e.g. "K. Sumanth" -> "k sumanth"
  str = str.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ');

  // Collapse whitespaces and split
  const tokens = str.split(/\s+/).filter(Boolean);

  // Filter out honorifics
  const filtered = tokens.filter(t => !HONORIFICS.has(t));
  return filtered.join(' ');
}

/**
 * Applies phonetic and transliteration folding for South-Indian name variants:
 * th/t, dh/d, ee/i, oo/u, v/w, sh/s, doubled consonants, trailing vowels
 */
export function foldPhonetics(token: string): string {
  let s = token.toLowerCase();
  // Transliteration pairs
  s = s.replace(/th/g, 't');
  s = s.replace(/dh/g, 'd');
  s = s.replace(/ee/g, 'i');
  s = s.replace(/oo/g, 'u');
  s = s.replace(/w/g, 'v');
  s = s.replace(/sh/g, 's');
  s = s.replace(/zh/g, 'l');
  s = s.replace(/bh/g, 'b');
  s = s.replace(/ph/g, 'p');
  s = s.replace(/kh/g, 'k');
  s = s.replace(/gh/g, 'g');

  // Collapse consecutive duplicate consonants e.g. "sumanthh" -> "sumanth"
  s = s.replace(/([b-df-hj-np-tv-z])\1+/g, '$1');

  // Strip trailing 'a' or 'u' (common Kannada/Telugu/Tamil vowel suffixes e.g., 'Kumara' -> 'Kumar')
  if (s.length > 3 && (s.endsWith('a') || s.endsWith('u'))) {
    s = s.slice(0, -1);
  }

  return s;
}

/**
 * Standard Jaro-Winkler string similarity calculation (0.0 to 1.0).
 */
export function jaroWinkler(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1.length || !s2.length) return 0.0;

  const matchDistance = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let matches = 0;
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  let transpositions = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro =
    (matches / s1.length +
      matches / s2.length +
      (matches - transpositions / 2) / matches) /
    3.0;

  // Winkler prefix scaling (max 4 chars, prefix weight p = 0.1)
  let prefix = 0;
  const maxPrefix = Math.min(4, Math.min(s1.length, s2.length));
  for (let i = 0; i < maxPrefix; i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1.0 - jaro);
}

/**
 * Intelligent Name Matching engine specifically tuned for Indian identity documents.
 * Tolerates initials expansion, spelling variants, reversed order, and script differences.
 */
export function matchNames(nameA: string, nameB: string): NameMatchResult {
  const isKannadaScript = isKannada(nameA) || isKannada(nameB);
  const normA = normaliseName(nameA);
  const normB = normaliseName(nameB);

  const tokensA = normA.split(/\s+/).filter(Boolean);
  const tokensB = normB.split(/\s+/).filter(Boolean);

  if (tokensA.length === 0 || tokensB.length === 0) {
    return {
      score: 0,
      status: 'FIXABLE',
      reasons: ['One or both names are empty after normalisation'],
      matchedTokens: [],
      unmatchedA: tokensA,
      unmatchedB: tokensB,
      isKannadaScript,
    };
  }

  // Exact match shortcut
  if (normA === normB) {
    return {
      score: 1.0,
      status: 'PASS',
      reasons: ['Exact full string match'],
      matchedTokens: tokensA.map(t => ({ tokenA: t, tokenB: t, similarity: 1.0, type: 'exact' })),
      unmatchedA: [],
      unmatchedB: [],
      isKannadaScript,
    };
  }

  // Compound name check (e.g. "Radhakrishna" vs "Radha Krishna", "Chandrashekar" vs "Chandra Shekhar")
  const collapsedA = normA.replace(/\s+/g, '');
  const collapsedB = normB.replace(/\s+/g, '');
  if (collapsedA === collapsedB || foldPhonetics(collapsedA) === foldPhonetics(collapsedB)) {
    return {
      score: 0.98,
      status: 'PASS',
      reasons: ['Compound name match (spacing variation)'],
      matchedTokens: [{ tokenA: normA, tokenB: normB, similarity: 0.98, type: 'folded' }],
      unmatchedA: [],
      unmatchedB: [],
      isKannadaScript,
    };
  }

  const matchedTokens: NameMatchResult['matchedTokens'] = [];
  const unmatchedA = [...tokensA];
  const unmatchedB = [...tokensB];
  const reasons: string[] = [];

  // Pairwise greedy best-match matching
  const usedB = new Set<number>();

  for (let i = 0; i < tokensA.length; i++) {
    const tA = tokensA[i]!;
    const isInitA = tA.length === 1;
    let bestJ = -1;
    let bestSim = -1;
    let bestType: 'exact' | 'initial' | 'fuzzy' | 'folded' = 'fuzzy';

    for (let j = 0; j < tokensB.length; j++) {
      if (usedB.has(j)) continue;
      const tB = tokensB[j]!;
      const isInitB = tB.length === 1;

      // 1. Exact match
      if (tA === tB) {
        bestJ = j;
        bestSim = 1.0;
        bestType = 'exact';
        break;
      }

      // 2. Initial expansion (e.g. 'k' matches 'kumar')
      if (isInitA || isInitB) {
        if (tA[0] === tB[0]) {
          const sim = 0.95;
          if (sim > bestSim) {
            bestSim = sim;
            bestJ = j;
            bestType = 'initial';
          }
        }
        continue;
      }

      // 3. Phonetic folding match (e.g., 'sumanth' vs 'sumant')
      const foldedA = foldPhonetics(tA);
      const foldedB = foldPhonetics(tB);
      if (foldedA === foldedB) {
        const sim = 0.96;
        if (sim > bestSim) {
          bestSim = sim;
          bestJ = j;
          bestType = 'folded';
        }
        continue;
      }

      // 4. Jaro-Winkler fuzzy match on folded tokens
      const jwSim = jaroWinkler(foldedA, foldedB);
      if (jwSim > bestSim) {
        bestSim = jwSim;
        bestJ = j;
        bestType = 'fuzzy';
      }
    }

    if (bestJ !== -1 && bestSim >= 0.75) {
      usedB.add(bestJ);
      matchedTokens.push({
        tokenA: tA,
        tokenB: tokensB[bestJ]!,
        similarity: bestSim,
        type: bestType,
      });
      // Remove from unmatched
      const idxA = unmatchedA.indexOf(tA);
      if (idxA !== -1) unmatchedA.splice(idxA, 1);
    }
  }

  // Update unmatchedB
  for (let j = 0; j < tokensB.length; j++) {
    if (usedB.has(j)) {
      const idxB = unmatchedB.indexOf(tokensB[j]!);
      if (idxB !== -1) unmatchedB.splice(idxB, 1);
    }
  }

  // Calculate weighted overall score
  const totalTokens = Math.max(tokensA.length, tokensB.length);
  const matchedSum = matchedTokens.reduce((acc, m) => acc + m.similarity, 0);
  let score = matchedSum / totalTokens;

  // Small penalty for unmatched extra tokens
  if (unmatchedA.length > 0 || unmatchedB.length > 0) {
    reasons.push(
      `Unmatched tokens: ${[...unmatchedA, ...unmatchedB].join(', ')}`
    );
  }

  // Kannada transliteration slight confidence attenuation (from spec page 10)
  if (isKannadaScript && score >= 0.90) {
    score = Math.max(0.85, score - 0.05);
    reasons.push('Kannada script transliteration applied; confidence slightly discounted.');
  }

  let status: 'PASS' | 'WARN' | 'FIXABLE';
  if (score >= 0.92) {
    status = 'PASS';
    reasons.push('Name match verified above threshold (>= 0.92)');
  } else if (score >= 0.80) {
    status = 'WARN';
    reasons.push('Name match requires reviewer glance (0.80 - 0.92)');
  } else {
    status = 'FIXABLE';
    reasons.push('Name match score is below acceptable threshold (< 0.80)');
  }

  return {
    score: Number(score.toFixed(4)),
    status,
    reasons,
    matchedTokens,
    unmatchedA,
    unmatchedB,
    isKannadaScript,
  };
}
