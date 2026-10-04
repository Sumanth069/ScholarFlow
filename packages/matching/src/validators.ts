// Kannada numerals map: ೦ ೧ ೨ ೩ ೪ ೫ ೬ ೭ ೮ ೯ -> 0-9
const KANNADA_DIGITS: Record<string, string> = {
  '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4',
  '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9'
};

export function normaliseKannadaDigits(text: string): string {
  return text.replace(/[೦-೯]/g, ch => KANNADA_DIGITS[ch] ?? ch);
}

/**
 * Validate Indian IFSC code format: 4 letters, '0', 6 alphanumeric characters.
 */
export function isValidIfscFormat(ifsc: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase());
}

/**
 * Validate Indian 10-digit mobile number starting with 6, 7, 8, or 9.
 */
export function isValidMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile.trim());
}

const MONTH_NAMES: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

/**
 * Parses dates in various formats: DD/MM/YYYY, DD-MM-YYYY, D MMM YYYY, ISO YYYY-MM-DD.
 * Converts Kannada numerals if present.
 * Returns ISO date string (YYYY-MM-DD) or null if invalid.
 */
export function parseDate(raw: string): string | null {
  if (!raw) return null;
  const str = normaliseKannadaDigits(raw.trim());

  // 1. ISO format YYYY-MM-DD
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return isValidDateParts(Number(y), Number(m), Number(d)) ? `${y}-${m}-${d}` : null;
  }

  // 2. DD/MM/YYYY or DD-MM-YYYY
  const slashDashMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(str);
  if (slashDashMatch) {
    const [, d, m, y] = slashDashMatch;
    const year = Number(y);
    const month = Number(m);
    const day = Number(d);
    if (!isValidDateParts(year, month, day)) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // 3. D MMM YYYY e.g. "15 Aug 2004"
  const textMonthMatch = /^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/.exec(str);
  if (textMonthMatch) {
    const [, d, monStr, y] = textMonthMatch;
    const month = MONTH_NAMES[monStr!.toLowerCase()];
    if (!month) return null;
    const year = Number(y);
    const day = Number(d);
    if (!isValidDateParts(year, month, day)) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return null;
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

/**
 * Computes exact completed years of age between date of birth and evaluation date.
 */
export function computeAge(dobIso: string, evaluationDate: Date): number {
  const [y, m, d] = dobIso.split('-').map(Number);
  const birthDate = new Date(y!, m! - 1, d!);
  let age = evaluationDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = evaluationDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && evaluationDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Validates whether marks percentage matches stated value within tolerance.
 */
export function validatePercentage(
  obtained: number,
  total: number,
  stated: number,
  tolerance = 0.5
): { valid: boolean; calculated: number; diff: number } {
  if (total <= 0 || obtained < 0 || obtained > total) {
    return { valid: false, calculated: 0, diff: 100 };
  }
  const calculated = Number(((obtained / total) * 100).toFixed(2));
  const diff = Number(Math.abs(calculated - stated).toFixed(2));
  return {
    valid: diff <= tolerance,
    calculated,
    diff,
  };
}

/**
 * Checks document validity window: issuedOn + maxMonths <= now
 */
export function isWithinValidityWindow(
  issuedDateIso: string,
  maxMonths: number,
  now: Date
): boolean {
  const [y, m, d] = issuedDateIso.split('-').map(Number);
  if (!y || !m || !d) return false;
  
  const expiry = new Date(y, m - 1 + maxMonths, d);
  return expiry.getTime() >= now.getTime();
}
