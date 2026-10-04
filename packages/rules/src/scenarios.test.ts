import { describe, it, expect } from 'vitest';
import { evaluate, allRules } from './index';
import { Facts, SchemeConfig } from '@scholarflow/shared';

const baselineScheme: SchemeConfig = {
  slug: 'post-matric-sc-st',
  name: 'Post-Matric Scholarship Scheme',
  version: 1,
  minPercentage: 60.0,
  maxFamilyIncome: 250000,
  allowedCategories: ['SC', 'ST'],
  maxDocAgeMonths: 12,
  submissionDeadline: '2026-12-31T23:59:59.000Z',
};

function createValidFacts(): Facts {
  return {
    now: new Date('2026-10-04T12:00:00.000Z'),
    scheme: baselineScheme,
    form: {
      applicantName: 'Sumanth Kumar',
      dateOfBirth: '2005-06-15',
      gender: 'MALE',
      category: 'SC',
      statedIncome: 180000,
      statedPercentage: 82.5,
      aadhaarLast4: '5678',
      aadhaarHash: 'hash_aadhaar_sumanth_001',
      accountNumber: '123456789012',
      ifscCode: 'SBIN0001234',
      mobile: '9876543210',
      email: 'sumanth@example.com',
      institutionCode: 'INST-BLR-001',
    },
    docs: {
      MARKSHEET: {
        docType: 'MARKSHEET',
        fields: {
          studentName: { value: 'Sumanth Kumar', confidence: 0.98 },
          marksObtained: { value: 495, confidence: 0.95 },
          totalMarks: { value: 600, confidence: 0.95 },
        },
      },
      INCOME_CERT: {
        docType: 'INCOME_CERT',
        fields: {
          holderName: { value: 'Sumanth Kumar', confidence: 0.96 },
          annualIncome: { value: 180000, confidence: 0.95 },
          issuedDate: { value: '2026-05-10', confidence: 0.95 },
        },
      },
      PASSBOOK: {
        docType: 'PASSBOOK',
        fields: {
          accountHolder: { value: 'Sumanth Kumar', confidence: 0.97 },
          accountNumber: { value: '123456789012', confidence: 0.97 },
          ifsc: { value: 'SBIN0001234', confidence: 0.97 },
        },
      },
    },
    registry: {
      income: { valid: true, annualIncome: 180000 },
      caste: { valid: true, category: 'SC' },
    },
    bank: {
      ifscKnown: true,
      dbtActive: true,
    },
    institution: {
      listed: true,
      active: true,
    },
    dedupe: {
      aadhaarHashApps: [],
      bankHashApps: [],
      phoneApps: [],
      fileHashApps: [],
    },
  };
}

describe('The 12 Official Benchmark Scenarios', () => {
  it('Scenario 01: Clean eligible applicant with verified documents -> AUTO_CLEARED', () => {
    const facts = createValidFacts();
    const { outcome } = evaluate(facts, allRules);
    expect(outcome).toBe('AUTO_CLEARED');
  });

  it('Scenario 02: Academic marks below scheme cutoff -> REJECTED_INELIGIBLE', () => {
    const facts = createValidFacts();
    facts.form.statedPercentage = 52.0; // cutoff is 60.0%
    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('REJECTED_INELIGIBLE');
    expect(results.some(r => r.ruleId === 'AC-001' && r.severity === 'HARD_FAIL')).toBe(true);
  });

  it('Scenario 03: Percentage entered conflicts with marksheet marks -> NEEDS_CORRECTION', () => {
    const facts = createValidFacts();
    // Entered 82.5% but marksheet math yields 450/600 = 75.0%
    facts.docs['MARKSHEET']!.fields['marksObtained'] = { value: 450, confidence: 0.95 };
    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('NEEDS_CORRECTION');
    expect(results.some(r => r.ruleId === 'AC-001' && r.severity === 'FIXABLE')).toBe(true);
  });

  it('Scenario 04: Family income exceeds scheme ceiling -> REJECTED_INELIGIBLE', () => {
    const facts = createValidFacts();
    facts.form.statedIncome = 320000; // ceiling is 2,50,000
    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('REJECTED_INELIGIBLE');
    expect(results.some(r => r.ruleId === 'IN-001' && r.severity === 'HARD_FAIL')).toBe(true);
  });

  it('Scenario 05: Expired income certificate (>12 months old) -> NEEDS_CORRECTION', () => {
    const facts = createValidFacts();
    facts.docs['INCOME_CERT']!.fields['issuedDate'] = { value: '2024-01-10', confidence: 0.98 };
    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('NEEDS_CORRECTION');
    expect(results.some(r => r.ruleId === 'IN-002' && r.severity === 'FIXABLE')).toBe(true);
  });

  it('Scenario 06: Legitimate name variation with initials (K Sumanth vs Kumar Sumanth) -> AUTO_CLEARED or MANUAL_REVIEW', () => {
    const facts = createValidFacts();
    facts.form.applicantName = 'K Sumanth';
    facts.docs['MARKSHEET']!.fields['studentName'] = { value: 'Kumar Sumanth', confidence: 0.95 };
    const { outcome } = evaluate(facts, allRules);
    expect(['AUTO_CLEARED', 'MANUAL_REVIEW']).toContain(outcome);
  });

  it('Scenario 07: Genuine name mismatch on document -> NEEDS_CORRECTION', () => {
    const facts = createValidFacts();
    facts.docs['MARKSHEET']!.fields['studentName'] = { value: 'Ramesh Babu', confidence: 0.95 };
    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('NEEDS_CORRECTION');
    expect(results.some(r => r.ruleId === 'ID-002' && r.severity === 'FIXABLE')).toBe(true);
  });

  it('Scenario 08: Unrecognized or invalid bank IFSC code -> NEEDS_CORRECTION', () => {
    const facts = createValidFacts();
    facts.bank.ifscKnown = false;
    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('NEEDS_CORRECTION');
    expect(results.some(r => r.ruleId === 'BK-001' && r.severity === 'FIXABLE')).toBe(true);
  });

  it('Scenario 09: Bank account not seeded for Aadhaar DBT -> NEEDS_CORRECTION', () => {
    const facts = createValidFacts();
    facts.bank.dbtActive = false;
    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('NEEDS_CORRECTION');
    expect(results.some(r => r.ruleId === 'BK-002' && r.severity === 'FIXABLE')).toBe(true);
  });

  it('Scenario 10: Duplicate Aadhaar hash across applications -> REJECTED_INELIGIBLE', () => {
    const facts = createValidFacts();
    facts.dedupe.aadhaarHashApps = ['SF-2026-000042'];
    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('REJECTED_INELIGIBLE');
    expect(results.some(r => r.ruleId === 'EL-002' && r.severity === 'HARD_FAIL')).toBe(true);
  });

  it('Scenario 11: Institution unaccredited or inactive -> REJECTED_INELIGIBLE', () => {
    const facts = createValidFacts();
    facts.institution.listed = false;
    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('REJECTED_INELIGIBLE');
    expect(results.some(r => r.ruleId === 'AC-002' && r.severity === 'HARD_FAIL')).toBe(true);
  });

  it('Scenario 12: Application timestamp past scheme deadline -> REJECTED_INELIGIBLE', () => {
    const facts = createValidFacts();
    facts.now = new Date('2027-01-05T00:00:00.000Z'); // deadline was 2026-12-31
    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('REJECTED_INELIGIBLE');
    expect(results.some(r => r.ruleId === 'EL-001' && r.severity === 'HARD_FAIL')).toBe(true);
  });
});
