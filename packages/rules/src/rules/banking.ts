import { Rule } from '../engine';
import { RuleResult, Facts } from '@scholarflow/shared';
import { isValidIfscFormat } from '@scholarflow/matching';

export const ruleBk001: Rule = {
  id: 'BK-001',
  version: '1.0.0',
  group: 'BK',
  description: 'Validates bank IFSC code format and existence in national bank registry',
  run(f: Facts): RuleResult {
    const ifsc = f.form.ifscCode;
    const formatValid = isValidIfscFormat(ifsc);
    const knownInRegistry = f.bank.ifscKnown;

    if (!formatValid || !knownInRegistry) {
      return {
        ruleId: 'BK-001',
        severity: 'FIXABLE',
        status: 'FAIL',
        evidence: [
          { label: 'Bank IFSC Code', entered: ifsc },
          { label: 'Registry Verification', extracted: !formatValid ? 'Invalid IFSC Format' : 'Unrecognized Bank Branch' },
        ],
        msg: {
          en: `Bank IFSC code "${ifsc}" is invalid or could not be found in the RBI bank directory.`,
          kn: `ಬ್ಯಾಂಕ್ ಐಎಫ್‌ಎಸ್‌ಸಿ ಕೋಡ್ "${ifsc}" ಅಮಾನ್ಯವಾಗಿದೆ ಅಥವಾ ಪತ್ತೆಯಾಗಲಿಲ್ಲ.`,
        },
        reviewerMsg: `IFSC ${ifsc} failed validation (format: ${formatValid}, known: ${knownInRegistry}).`,
        fixHint: 'Verify the IFSC code printed on your bank passbook/cheque and update your details.',
        fields: ['ifscCode'],
      };
    }

    return {
      ruleId: 'BK-001',
      severity: 'INFO',
      status: 'PASS',
      evidence: [
        { label: 'Bank IFSC Code', entered: ifsc },
        { label: 'Registry Verification', extracted: 'Verified Active Branch' },
      ],
      msg: {
        en: 'Bank IFSC code verified.',
        kn: 'ಬ್ಯಾಂಕ್ ಐಎಫ್‌ಎಸ್‌ಸಿ ಕೋಡ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ.',
      },
      reviewerMsg: `Valid IFSC branch: ${ifsc}.`,
      fields: [],
    };
  },
};

export const ruleBk002: Rule = {
  id: 'BK-002',
  version: '1.0.0',
  group: 'BK',
  description: 'Verifies whether bank account is seeded for Aadhaar Direct Benefit Transfer (DBT)',
  run(f: Facts): RuleResult {
    const isDbtActive = f.bank.dbtActive;

    if (!isDbtActive) {
      return {
        ruleId: 'BK-002',
        severity: 'FIXABLE',
        status: 'FAIL',
        evidence: [
          { label: 'Bank Account Number', entered: `Ending in ${f.form.accountNumber.slice(-4)}` },
          { label: 'NPCI DBT Seeding Status', extracted: 'INACTIVE / Not Seeded' },
        ],
        msg: {
          en: 'Your bank account is not enabled for Aadhaar Direct Benefit Transfer (DBT). Scholarship funds cannot be disbursed.',
          kn: 'ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಆಧಾರ್ ಡಿಬಿಟಿ ಸಕ್ರಿಯವಾಗಿಲ್ಲ. ವಿದ್ಯಾರ್ಥಿವೇತನ ಹಣ ಜಮಾ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ.',
        },
        reviewerMsg: 'Bank account not seeded with NPCI Aadhaar mapper. Fund transfer would bounce.',
        fixHint: 'Visit your bank branch and submit the Aadhaar-seeding mandate form to enable DBT on your account.',
        fields: ['accountNumber'],
      };
    }

    return {
      ruleId: 'BK-002',
      severity: 'INFO',
      status: 'PASS',
      evidence: [
        { label: 'Bank Account Number', entered: `Ending in ${f.form.accountNumber.slice(-4)}` },
        { label: 'NPCI DBT Seeding Status', extracted: 'ACTIVE' },
      ],
      msg: {
        en: 'Direct Benefit Transfer (DBT) is active on this bank account.',
        kn: 'ಬ್ಯಾಂಕ್ ಖಾತೆಯಲ್ಲಿ ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT) ಸಕ್ರಿಯವಾಗಿದೆ.',
      },
      reviewerMsg: 'NPCI DBT seeding verified active.',
      fields: [],
    };
  },
};
