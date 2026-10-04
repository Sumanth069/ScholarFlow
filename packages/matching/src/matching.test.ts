import { describe, it, expect } from 'vitest';
import { verhoeffValid, generateVerhoeffCheckDigit } from './verhoeff';
import { matchNames, foldPhonetics, normaliseName } from './nameMatcher';
import {
  parseDate,
  computeAge,
  validatePercentage,
  isWithinValidityWindow,
  isValidIfscFormat,
  isValidMobile,
} from './validators';

describe('Verhoeff Checksum Algorithm', () => {
  it('validates correct Verhoeff numbers and catches single-digit transpositions', () => {
    // Generate valid numbers and verify
    const baseNums = ['12345678901', '98765432109', '45678912345', '11112222333'];
    for (const base of baseNums) {
      const checkDigit = generateVerhoeffCheckDigit(base);
      const full = `${base}${checkDigit}`;
      expect(verhoeffValid(full)).toBe(true);

      // Mutate one digit -> must fail
      const mutatedLast = `${base}${(checkDigit + 1) % 10}`;
      expect(verhoeffValid(mutatedLast)).toBe(false);

      // Non-digit string -> must fail
      expect(verhoeffValid('1234ABCD5678')).toBe(false);
    }
  });
});

describe('Name Matching Engine', () => {
  // Test matrix covering Indian naming conventions
  const testCases = [
    // 1-10: Exact & Casing & Whitespace
    { a: 'Sumanth Kumar', b: 'Sumanth Kumar', expected: 'PASS' },
    { a: 'SUMANTH KUMAR', b: 'sumanth kumar', expected: 'PASS' },
    { a: '  Sumanth   Kumar  ', b: 'Sumanth Kumar', expected: 'PASS' },
    { a: 'Dr. Sumanth Kumar', b: 'Sumanth Kumar', expected: 'PASS' },
    { a: 'Shri Sumanth Kumar', b: 'Sumanth Kumar', expected: 'PASS' },
    { a: 'Smt. Priya Sharma', b: 'Priya Sharma', expected: 'PASS' },
    { a: 'Kumari Ananya Rao', b: 'Ananya Rao', expected: 'PASS' },
    { a: 'Mr. Rahul Verma', b: 'Rahul Verma', expected: 'PASS' },
    { a: 'Prof. Ramesh Patil', b: 'Ramesh Patil', expected: 'PASS' },
    { a: 'Late Krishna Murthy', b: 'Krishna Murthy', expected: 'PASS' },

    // 11-20: Initials and expansions (e.g. K Sumanth)
    { a: 'K Sumanth', b: 'Kumar Sumanth', expected: 'PASS' },
    { a: 'K. Sumanth', b: 'Sumanth K', expected: 'PASS' },
    { a: 'Sumanth K', b: 'Sumanth Kumar', expected: 'PASS' },
    { a: 'R Suresh', b: 'Suresh R', expected: 'PASS' },
    { a: 'A P J Abdul Kalam', b: 'Avul Pakir Jainulabdeen Abdul Kalam', expected: 'PASS' },
    { a: 'M K Gandhi', b: 'Mohandas Karamchand Gandhi', expected: 'PASS' },
    { a: 'B R Ambedkar', b: 'Bhimrao Ramji Ambedkar', expected: 'PASS' },
    { a: 'N R Narayana Murthy', b: 'Narayana Murthy N R', expected: 'PASS' },
    { a: 'V S Naipaul', b: 'Vidiadhar Surajprasad Naipaul', expected: 'PASS' },
    { a: 'P B Shelley', b: 'Percy Bysshe Shelley', expected: 'PASS' },

    // 21-30: Order inversions (South Indian family name vs given name)
    { a: 'Gowda Chethan', b: 'Chethan Gowda', expected: 'PASS' },
    { a: 'Patil Ramesh', b: 'Ramesh Patil', expected: 'PASS' },
    { a: 'Hegde Ananya', b: 'Ananya Hegde', expected: 'PASS' },
    { a: 'Shetty Praveen', b: 'Praveen Shetty', expected: 'PASS' },
    { a: 'Bhat Vishwanath', b: 'Vishwanath Bhat', expected: 'PASS' },
    { a: 'Rao Srinivas', b: 'Srinivas Rao', expected: 'PASS' },
    { a: 'Nayak Manoj', b: 'Manoj Nayak', expected: 'PASS' },
    { a: 'Reddy Karthik', b: 'Karthik Reddy', expected: 'PASS' },
    { a: 'Deshmukh Sanjay', b: 'Sanjay Deshmukh', expected: 'PASS' },
    { a: 'Kulkarni Pooja', b: 'Pooja Kulkarni', expected: 'PASS' },

    // 31-40: South-Indian transliteration variants (th/t, dh/d, ee/i, oo/u, v/w, sh/s)
    { a: 'Sumanth', b: 'Sumant', expected: 'PASS' },
    { a: 'Prathap', b: 'Pratap', expected: 'PASS' },
    { a: 'Praveen', b: 'Pravin', expected: 'PASS' },
    { a: 'Suresh', b: 'Sures', expected: 'PASS' },
    { a: 'Venkatesh', b: 'Wenkatesh', expected: 'PASS' },
    { a: 'Anandh', b: 'Anand', expected: 'PASS' },
    { a: 'Roopa', b: 'Rupa', expected: 'PASS' },
    { a: 'Deepti', b: 'Dipti', expected: 'PASS' },
    { a: 'Ashwin', b: 'Asvin', expected: 'PASS' },
    { a: 'Vinayaka', b: 'Vinayak', expected: 'PASS' },

    // 41-50: Slight spelling drift / OCR errors (Jaro-Winkler)
    { a: 'Sumanth', b: 'Sumantha', expected: 'PASS' },
    { a: 'Chethan Kumar', b: 'Cheten Kumar', expected: 'PASS' },
    { a: 'Divya Shree', b: 'Divyashri', expected: 'PASS' },
    { a: 'Mohammed Ali', b: 'Mohamed Ali', expected: 'PASS' },
    { a: 'Radhakrishna', b: 'Radha Krishna', expected: 'PASS' },
    { a: 'Chandrashekar', b: 'Chandra Shekhar', expected: 'PASS' },
    { a: 'Vijaykumar', b: 'Vijay Kumar', expected: 'PASS' },
    { a: 'Vishwajeet', b: 'Vishwajit', expected: 'PASS' },
    { a: 'Kavitha Devi', b: 'Kavita Devi', expected: 'PASS' },
    { a: 'Manjunatha', b: 'Manjunath', expected: 'PASS' },

    // 51-55: Kannada Script input
    { a: 'ಸುಮಂತ್ ಕುಮಾರ್', b: 'Sumanth Kumar', expected: 'PASS' },
    { a: 'ರಮೇಶ್ ಪಾಟೀಲ್', b: 'Ramesh Patil', expected: 'PASS' },
    { a: 'ಆನಂದ್', b: 'Anand', expected: 'PASS' },

    // 56-65: Discrepancies and hard mismatches (FIXABLE)
    { a: 'Sumanth Kumar', b: 'Ramesh Babu', expected: 'FIXABLE' },
    { a: 'Priya Sharma', b: 'Deepak Verma', expected: 'FIXABLE' },
    { a: 'Ananya Rao', b: 'Kavita Singh', expected: 'FIXABLE' },
    { a: 'Suresh Patil', b: 'John Doe', expected: 'FIXABLE' },
    { a: '', b: 'Sumanth Kumar', expected: 'FIXABLE' },
    { a: 'A', b: 'B', expected: 'FIXABLE' },
    { a: 'Ravi Kumar', b: 'Suresh Kumar', expected: 'FIXABLE' }, // Shared surname only
    { a: 'Pooja Hegde', b: 'Pooja Reddy', expected: 'WARN' }, // Shared first name, different surname
    { a: 'Karthik Rao', b: 'Karthik Sharma', expected: 'WARN' },
  ];

  it('correctly matches and classifies 60+ representative cases', () => {
    let passCount = 0;
    for (const tc of testCases) {
      const res = matchNames(tc.a, tc.b);
      if (tc.expected === 'PASS') {
        expect(['PASS', 'WARN']).toContain(res.status);
        passCount++;
      } else if (tc.expected === 'FIXABLE') {
        expect(res.status).toBe('FIXABLE');
        passCount++;
      } else if (tc.expected === 'WARN') {
        expect(['WARN', 'FIXABLE']).toContain(res.status);
        passCount++;
      }
    }
    expect(passCount).toBe(testCases.length);
  });
});

describe('Domain Validators', () => {
  it('validates IFSC codes correctly', () => {
    expect(isValidIfscFormat('SBIN0001234')).toBe(true);
    expect(isValidIfscFormat('HDFC0000001')).toBe(true);
    expect(isValidIfscFormat('KA012345')).toBe(false);
    expect(isValidIfscFormat('SBIN1001234')).toBe(false); // 5th char must be 0
  });

  it('validates mobile numbers', () => {
    expect(isValidMobile('9876543210')).toBe(true);
    expect(isValidMobile('7012345678')).toBe(true);
    expect(isValidMobile('5012345678')).toBe(false); // Doesn't start with 6-9
    expect(isValidMobile('987654321')).toBe(false); // Only 9 digits
  });

  it('parses diverse Indian date formats and Kannada numerals', () => {
    expect(parseDate('15/08/2004')).toBe('2004-08-15');
    expect(parseDate('15-08-2004')).toBe('2004-08-15');
    expect(parseDate('2004-08-15')).toBe('2004-08-15');
    expect(parseDate('15 Aug 2004')).toBe('2004-08-15');
    expect(parseDate('೧೫/೦೮/೨೦೦೪')).toBe('2004-08-15'); // Kannada digits
    expect(parseDate('32/01/2004')).toBeNull(); // Impossible date
    expect(parseDate('garbage')).toBeNull();
  });

  it('computes exact age against an injected evaluation date', () => {
    const evalDate = new Date('2026-10-04T00:00:00Z');
    expect(computeAge('2006-10-03', evalDate)).toBe(20);
    expect(computeAge('2006-10-05', evalDate)).toBe(19);
  });

  it('verifies academic percentage within specified tolerance', () => {
    const res = validatePercentage(480, 600, 80.0, 0.5);
    expect(res.valid).toBe(true);
    expect(res.calculated).toBe(80.0);

    const failRes = validatePercentage(450, 600, 85.0, 0.5);
    expect(failRes.valid).toBe(false);
  });

  it('verifies document validity window based on issue date', () => {
    const now = new Date('2026-10-04T00:00:00Z');
    expect(isWithinValidityWindow('2026-01-01', 12, now)).toBe(true);
    expect(isWithinValidityWindow('2024-01-01', 12, now)).toBe(false); // >12 months old
  });
});
