import { describe, it, expect } from 'vitest';
import { evaluate, allRules, Rule } from './index';
import { Facts, SchemeConfig } from '@scholarflow/shared';

const mockScheme: SchemeConfig = {
  slug: 'post-matric-sc-st',
  name: 'Post-Matric Scholarship Scheme',
  version: 1,
  minPercentage: 60.0,
  maxFamilyIncome: 250000,
  allowedCategories: ['SC', 'ST'],
  maxDocAgeMonths: 12,
  submissionDeadline: '2026-12-31T23:59:59.000Z',
};

function createBaseFacts(): Facts {
  return {
    now: new Date('2026-10-04T12:00:00.000Z'),
    scheme: mockScheme,
    form: {
      applicantName: 'Sumanth Kumar',
      dateOfBirth: '2005-06-15',
      gender: 'MALE',
      category: 'SC',
      statedIncome: 180000,
      statedPercentage: 82.5,
      aadhaarLast4: '5678',
      aadhaarHash: 'hash_aadhaar_sumanth',
      accountNumber: '123456789012',
      ifscCode: 'SBIN0001234',
      mobile: '9876543210',
      email: 'sumanth@example.com',
      institutionCode: 'INST001',
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

describe('Deterministic Rule Engine Evaluation', () => {
  it('Scenario 1: Fully valid clean application -> AUTO_CLEARED', () => {
    const facts = createBaseFacts();
    const { outcome, results } = evaluate(facts, allRules);

    expect(outcome).toBe('AUTO_CLEARED');
    expect(results.every(r => r.status === 'PASS')).toBe(true);
  });

  it('Scenario 2: Low academic score below cutoff -> REJECTED_INELIGIBLE (HARD_FAIL)', () => {
    const facts = createBaseFacts();
    facts.form.statedPercentage = 45.0; // below 60.0% cutoff

    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('REJECTED_INELIGIBLE');
    const acFail = results.find(r => r.ruleId === 'AC-001');
    expect(acFail?.status).toBe('FAIL');
    expect(acFail?.severity).toBe('HARD_FAIL');
  });

  it('Scenario 3: Income exceeding ceiling -> REJECTED_INELIGIBLE (HARD_FAIL)', () => {
    const facts = createBaseFacts();
    facts.form.statedIncome = 350000; // > 2,50,000 ceiling

    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('REJECTED_INELIGIBLE');
    const inFail = results.find(r => r.ruleId === 'IN-001');
    expect(inFail?.status).toBe('FAIL');
    expect(inFail?.severity).toBe('HARD_FAIL');
  });

  it('Scenario 4: Fixable name mismatch -> NEEDS_CORRECTION', () => {
    const facts = createBaseFacts();
    // Name on marksheet is completely different
    facts.docs['MARKSHEET']!.fields['studentName'] = {
      value: 'Ramesh Babu',
      confidence: 0.95,
    };

    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('NEEDS_CORRECTION');
    const idFail = results.find(r => r.ruleId === 'ID-002');
    expect(idFail?.status).toBe('FAIL');
    expect(idFail?.severity).toBe('FIXABLE');
  });

  it('Scenario 5: Duplicate Aadhaar fraud detected -> REJECTED_INELIGIBLE (HARD_FAIL)', () => {
    const facts = createBaseFacts();
    facts.dedupe.aadhaarHashApps = ['SF-2026-000042'];

    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('REJECTED_INELIGIBLE');
    const fraudRule = results.find(r => r.ruleId === 'EL-002');
    expect(fraudRule?.status).toBe('FAIL');
    expect(fraudRule?.severity).toBe('HARD_FAIL');
  });

  it('Scenario 6: Inactive DBT on bank account -> NEEDS_CORRECTION', () => {
    const facts = createBaseFacts();
    facts.bank.dbtActive = false;

    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('NEEDS_CORRECTION');
    const dbtFail = results.find(r => r.ruleId === 'BK-002');
    expect(dbtFail?.status).toBe('FAIL');
    expect(dbtFail?.severity).toBe('FIXABLE');
  });

  it('Scenario 7: Past deadline submission -> REJECTED_INELIGIBLE', () => {
    const facts = createBaseFacts();
    facts.now = new Date('2027-01-01T00:00:00.000Z'); // Deadline was 2026-12-31

    const { outcome, results } = evaluate(facts, allRules);
    expect(outcome).toBe('REJECTED_INELIGIBLE');
    const deadlineFail = results.find(r => r.ruleId === 'EL-001');
    expect(deadlineFail?.status).toBe('FAIL');
  });

  it('Scenario 8: Rule throwing unhandled exception triggers MANUAL_REVIEW, never silent pass', () => {
    const facts = createBaseFacts();
    const buggyRule: Rule = {
      id: 'BUG-001',
      version: '1.0.0',
      group: 'ID',
      description: 'Throws error',
      run() {
        throw new Error('Simulated runtime failure');
      },
    };

    const { outcome, results } = evaluate(facts, [...allRules, buggyRule]);
    expect(outcome).toBe('MANUAL_REVIEW');
    const errResult = results.find(r => r.ruleId === 'BUG-001');
    expect(errResult?.status).toBe('ERROR');
  });
});
