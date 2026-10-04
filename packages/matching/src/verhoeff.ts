// Multiplication table d
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// Permutation table p
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

// Inverse table inv
const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates a number string using the Verhoeff algorithm.
 * Used for in-memory format validation of Indian 12-digit Aadhaar numbers.
 */
export function verhoeffValid(num: string): boolean {
  if (!/^\d+$/.test(num)) return false;
  let c = 0;
  const digits = [...num].reverse();
  for (let i = 0; i < digits.length; i++) {
    const digit = Number(digits[i]);
    const row = d[c];
    const pRow = p[i % 8];
    if (!row || !pRow) return false;
    const pVal = pRow[digit];
    if (pVal === undefined) return false;
    c = row[pVal] ?? 0;
  }
  return c === 0;
}

/**
 * Computes and appends the Verhoeff check digit to a number string.
 * Generates synthetic valid numbers for unit tests.
 */
export function generateVerhoeffCheckDigit(num: string): number {
  let c = 0;
  const digits = [...num].reverse();
  for (let i = 0; i < digits.length; i++) {
    const digit = Number(digits[i]);
    const row = d[c];
    const pRow = p[(i + 1) % 8];
    if (!row || !pRow) return 0;
    const pVal = pRow[digit] ?? 0;
    c = row[pVal] ?? 0;
  }
  return inv[c] ?? 0;
}
