import { Rule } from '../engine';
import { RuleResult, Facts } from '@scholarflow/shared';

export const ruleEl001: Rule = {
  id: 'EL-001',
  version: '1.0.0',
  group: 'EL',
  description: 'Verifies application submission is within official scheme deadline',
  run(f: Facts): RuleResult {
    const deadlineTime = new Date(f.scheme.submissionDeadline).getTime();
    const submissionTime = f.now.getTime();

    if (submissionTime > deadlineTime) {
      return {
        ruleId: 'EL-001',
        severity: 'HARD_FAIL',
        status: 'FAIL',
        evidence: [
          { label: 'Evaluation Timestamp (IST)', entered: f.now.toISOString() },
          { label: 'Official Scheme Deadline', extracted: f.scheme.submissionDeadline },
        ],
        msg: {
          en: `Scholarship scheme deadline closed on ${f.scheme.submissionDeadline}. Late submissions cannot be accepted.`,
          kn: `ವಿದ್ಯಾರ್ಥಿವೇತನ ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಕೊನೆಯ ದಿನಾಂಕ ಮುಗಿದಿದೆ.`,
        },
        reviewerMsg: `Late submission: timestamp ${f.now.toISOString()} past deadline ${f.scheme.submissionDeadline}.`,
        fields: [],
      };
    }

    return {
      ruleId: 'EL-001',
      severity: 'INFO',
      status: 'PASS',
      evidence: [
        { label: 'Evaluation Timestamp', entered: f.now.toISOString() },
        { label: 'Scheme Deadline', extracted: f.scheme.submissionDeadline },
      ],
      msg: {
        en: 'Application received within active scheme window.',
        kn: 'ಅರ್ಜಿಯನ್ನು ನಿಗದಿತ ಅವಧಿಯೊಳಗೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ.',
      },
      reviewerMsg: 'Submission on time.',
      fields: [],
    };
  },
};

export const ruleEl002: Rule = {
  id: 'EL-002',
  version: '1.0.0',
  group: 'EL',
  description: 'Detects duplicate identity hashes to prevent multi-claim scholarship fraud',
  run(f: Facts): RuleResult {
    const dupAadhaar = f.dedupe.aadhaarHashApps.length > 0;
    const dupBank = f.dedupe.bankHashApps.length > 0;

    if (dupAadhaar || dupBank) {
      const dupDetails = [
        dupAadhaar ? `Duplicate Aadhaar matched in: ${f.dedupe.aadhaarHashApps.join(', ')}` : null,
        dupBank ? `Duplicate Bank Account matched in: ${f.dedupe.bankHashApps.join(', ')}` : null,
      ].filter(Boolean).join(' | ');

      return {
        ruleId: 'EL-002',
        severity: 'HARD_FAIL',
        status: 'FAIL',
        evidence: [
          { label: 'Duplicate Check', extracted: dupDetails },
        ],
        msg: {
          en: 'A duplicate scholarship application was detected for this beneficiary or bank account.',
          kn: 'ಈ ಫಲಾನುಭವಿ ಅಥವಾ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ನಕಲಿ/ಮತ್ತೊಂದು ಅರ್ಜಿ ಕಂಡುಬಂದಿದೆ.',
        },
        reviewerMsg: `FRAUD ALERT: Duplicate identity hash detected! ${dupDetails}`,
        fields: ['aadhaarLast4', 'accountNumber'],
      };
    }

    return {
      ruleId: 'EL-002',
      severity: 'INFO',
      status: 'PASS',
      evidence: [{ label: 'Duplicate Check', extracted: 'Unique beneficiary verified' }],
      msg: {
        en: 'Identity uniqueness verified across database.',
        kn: 'ಅರ್ಜಿದಾರರ ವಿವರಗಳು ವಿಶಿಷ್ಟವಾಗಿವೆ.',
      },
      reviewerMsg: 'No duplicate records found.',
      fields: [],
    };
  },
};
