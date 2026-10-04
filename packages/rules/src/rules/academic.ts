import { Rule } from '../engine';
import { RuleResult, Facts } from '@scholarflow/shared';
import { validatePercentage } from '@scholarflow/matching';

export const ruleAc001: Rule = {
  id: 'AC-001',
  version: '1.0.0',
  group: 'AC',
  description: 'Validates that academic percentage meets scheme eligibility cutoff',
  run(f: Facts): RuleResult {
    const marksheet = f.docs['MARKSHEET'];
    const extractedMarks = marksheet?.fields['marksObtained']?.value;
    const extractedTotal = marksheet?.fields['totalMarks']?.value;
    const statedPercentage = f.form.statedPercentage;
    const minPercentage = f.scheme.minPercentage;

    // Check if stated percentage meets minimum scheme requirement
    if (statedPercentage < minPercentage) {
      return {
        ruleId: 'AC-001',
        severity: 'HARD_FAIL',
        status: 'FAIL',
        evidence: [
          { label: 'Stated Percentage', entered: `${statedPercentage}%` },
          { label: 'Required Cutoff', extracted: `${minPercentage}%` },
        ],
        msg: {
          en: `Academic score of ${statedPercentage}% does not meet the minimum required cutoff of ${minPercentage}%.`,
          kn: `ಅಂಕಗಳ ಶೇಕಡಾವಾರು ${statedPercentage}% ಕನಿಷ್ಠ ನಿಗದಿತ ${minPercentage}% ಗಿಂತ ಕಡಿಮೆಯಿದೆ.`,
        },
        reviewerMsg: `Applicant ineligible on academic cutoff: stated ${statedPercentage}%, required ${minPercentage}%.`,
        fields: ['statedPercentage'],
      };
    }

    // If marksheet marks are extracted, cross-verify
    if (typeof extractedMarks === 'number' && typeof extractedTotal === 'number' && extractedTotal > 0) {
      const pCheck = validatePercentage(extractedMarks, extractedTotal, statedPercentage);
      if (!pCheck.valid) {
        return {
          ruleId: 'AC-001',
          severity: 'FIXABLE',
          status: 'FAIL',
          evidence: [
            { label: 'Stated Percentage', entered: `${statedPercentage}%` },
            { label: 'Calculated from Marksheet', extracted: `${pCheck.calculated}% (${extractedMarks}/${extractedTotal})` },
          ],
          msg: {
            en: `Stated percentage (${statedPercentage}%) conflicts with marks on your marksheet (${pCheck.calculated}%).`,
            kn: `ಅರ್ಜಿಯಲ್ಲಿ ನಮೂದಿಸಿದ ಶೇಕಡಾವಾರು ಮತ್ತು ಅಂಕಪಟ್ಟಿಯ ಲೆಕ್ಕಾಚಾರ ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ.`,
          },
          reviewerMsg: `Percentage mismatch: stated ${statedPercentage}%, document yields ${pCheck.calculated}%.`,
          fixHint: 'Correct the entered percentage to match the exact score on your marksheet.',
          fields: ['statedPercentage', 'documents.MARKSHEET'],
        };
      }
    }

    return {
      ruleId: 'AC-001',
      severity: 'INFO',
      status: 'PASS',
      evidence: [
        { label: 'Stated Percentage', entered: `${statedPercentage}%` },
        { label: 'Required Cutoff', extracted: `>= ${minPercentage}%` },
      ],
      msg: {
        en: `Academic eligibility verified (${statedPercentage}% >= ${minPercentage}%).`,
        kn: `ಶೈಕ್ಷಣಿಕ ಅರ್ಹತೆಯನ್ನು ದೃಢೀಕರಿಸಲಾಗಿದೆ.`,
      },
      reviewerMsg: `Eligible academic score: ${statedPercentage}%.`,
      fields: [],
    };
  },
};

export const ruleAc002: Rule = {
  id: 'AC-002',
  version: '1.0.0',
  group: 'AC',
  description: 'Verifies educational institution is recognized and active',
  run(f: Facts): RuleResult {
    const { listed, active } = f.institution;

    if (!listed || !active) {
      return {
        ruleId: 'AC-002',
        severity: 'HARD_FAIL',
        status: 'FAIL',
        evidence: [
          { label: 'Institution Code', entered: f.form.institutionCode },
          { label: 'Registry Status', extracted: !listed ? 'Not Listed / Unrecognized' : 'Inactive / De-affiliated' },
        ],
        msg: {
          en: 'The educational institution selected is not recognized or is currently de-affiliated.',
          kn: 'ಆಯ್ಕೆಮಾಡಿದ ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಯು ಅನುಮೋದಿತವಾಗಿಲ್ಲ ಅಥವಾ ನಿಷ್ಕ್ರಿಯವಾಗಿದೆ.',
        },
        reviewerMsg: `Institution ${f.form.institutionCode} failed accreditation check (listed: ${listed}, active: ${active}).`,
        fields: ['institutionCode'],
      };
    }

    return {
      ruleId: 'AC-002',
      severity: 'INFO',
      status: 'PASS',
      evidence: [
        { label: 'Institution Code', entered: f.form.institutionCode },
        { label: 'Registry Status', extracted: 'Accredited & Active' },
      ],
      msg: {
        en: 'Institution accreditation verified.',
        kn: 'ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಯ ಮಾನ್ಯತೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.',
      },
      reviewerMsg: `Institution ${f.form.institutionCode} is valid and active.`,
      fields: [],
    };
  },
};
