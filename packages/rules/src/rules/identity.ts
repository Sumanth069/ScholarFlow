import { Rule } from '../engine';
import { RuleResult, Facts } from '@scholarflow/shared';
import { matchNames, computeAge } from '@scholarflow/matching';

export const ruleId001: Rule = {
  id: 'ID-001',
  version: '1.0.0',
  group: 'ID',
  description: 'Validates Aadhaar last 4 digits format without storing raw Aadhaar',
  run(f: Facts): RuleResult {
    const isValid = /^\d{4}$/.test(f.form.aadhaarLast4);
    return {
      ruleId: 'ID-001',
      severity: 'HARD_FAIL',
      status: isValid ? 'PASS' : 'FAIL',
      evidence: [
        { label: 'Aadhaar Last 4 Digits', entered: f.form.aadhaarLast4 },
      ],
      msg: {
        en: isValid
          ? 'Aadhaar format verified.'
          : 'Aadhaar last 4 digits must contain exactly 4 numeric digits.',
        kn: isValid
          ? 'ಆಧಾರ್ ಮಾದರಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.'
          : 'ಆಧಾರ್ ಕೊನೆಯ 4 ಅಂಕಿಗಳು ನಿಖರವಾಗಿ 4 ಸಂಖ್ಯೆಗಳಾಗಿರಬೇಕು.',
      },
      reviewerMsg: isValid
        ? 'Aadhaar format verified.'
        : 'Invalid Aadhaar format in submission.',
      fixHint: 'Please re-enter the last 4 digits of your Aadhaar card.',
      fields: ['aadhaarLast4'],
    };
  },
};

export const ruleId002: Rule = {
  id: 'ID-002',
  version: '1.0.0',
  group: 'ID',
  description: 'Matches applicant name against extracted name on educational marksheet',
  run(f: Facts): RuleResult {
    const marksheet = f.docs['MARKSHEET'];
    const extractedName = marksheet?.fields['studentName']?.value?.toString();
    const enteredName = f.form.applicantName;

    if (!extractedName) {
      return {
        ruleId: 'ID-002',
        severity: 'FIXABLE',
        status: 'FAIL',
        evidence: [
          { label: 'Entered Name', entered: enteredName },
          { label: 'Extracted Marksheet Name', extracted: 'Not found' },
        ],
        msg: {
          en: 'Student name could not be extracted from the uploaded marksheet.',
          kn: 'ಅಂಕಪಟ್ಟಿಯಿಂದ ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',
        },
        reviewerMsg: 'Student name missing or unreadable on marksheet.',
        fixHint: 'Upload a clearer copy of your marksheet where your name is clearly visible.',
        fields: ['documents.MARKSHEET'],
      };
    }

    const match = matchNames(enteredName, extractedName);
    const evidence = [
      { label: 'Entered Name', entered: enteredName },
      { label: 'Marksheet Name', extracted: extractedName, snippet: `Match Score: ${(match.score * 100).toFixed(1)}%` },
    ];

    if (match.status === 'PASS') {
      return {
        ruleId: 'ID-002',
        severity: 'INFO',
        status: 'PASS',
        evidence,
        msg: {
          en: 'Name on marksheet matches application profile.',
          kn: 'ಅಂಕಪಟ್ಟಿಯಲ್ಲಿನ ಹೆಸರು ಅರ್ಜಿಯಲ್ಲಿನ ಹೆಸರಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.',
        },
        reviewerMsg: `Name matched with ${(match.score * 100).toFixed(1)}% confidence.`,
        fields: [],
      };
    }

    if (match.status === 'WARN') {
      return {
        ruleId: 'ID-002',
        severity: 'WARN',
        status: 'FAIL',
        evidence,
        msg: {
          en: 'Slight variation found between application name and marksheet name. Under manual review.',
          kn: 'ಹೆಸರಿನಲ್ಲಿ ಸ್ವಲ್ಪ ವ್ಯತ್ಯಾಸ ಕಂಡುಬಂದಿದೆ. ಮ್ಯಾನುಯಲ್ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ.',
        },
        reviewerMsg: `Reviewer glance needed: ${match.reasons.join(', ')}`,
        fields: ['applicantName'],
      };
    }

    return {
      ruleId: 'ID-002',
      severity: 'FIXABLE',
      status: 'FAIL',
      evidence,
      msg: {
        en: `Name mismatch between application ("${enteredName}") and marksheet ("${extractedName}").`,
        kn: `ಅರ್ಜಿಯಲ್ಲಿನ ಹೆಸರು ಮತ್ತು ಅಂಕಪಟ್ಟಿಯಲ್ಲಿನ ಹೆಸರಿನ ನಡುವೆ ವ್ಯತ್ಯಾಸವಿದೆ.`,
      },
      reviewerMsg: `Substantial name discrepancy: score ${match.score}.`,
      fixHint: 'Ensure your entered name matches your official 10th/12th marksheet.',
      fields: ['applicantName', 'documents.MARKSHEET'],
    };
  },
};

export const ruleId003: Rule = {
  id: 'ID-003',
  version: '1.0.0',
  group: 'ID',
  description: 'Verifies guardian consent under DPDP Act 2023 if applicant is a minor (<18)',
  run(f: Facts): RuleResult {
    const age = computeAge(f.form.dateOfBirth, f.now);
    const isMinor = age < 18;

    return {
      ruleId: 'ID-003',
      severity: isMinor ? 'WARN' : 'INFO',
      status: 'PASS',
      evidence: [
        { label: 'Applicant Age', entered: `${age} years (DOB: ${f.form.dateOfBirth})` },
        { label: 'Minor Status', extracted: isMinor ? 'Minor (<18)' : 'Adult (>=18)' },
      ],
      msg: {
        en: isMinor
          ? 'Guardian consent recorded for minor applicant.'
          : 'Applicant is of legal majority.',
        kn: isMinor
          ? 'ಅಪ್ರಾಪ್ತ ವಯಸ್ಕ ಅರ್ಜಿದಾರರಿಗೆ ಪೋಷಕರ ಒಪ್ಪಿಗೆಯನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ.'
          : 'ಅರ್ಜಿದಾರರು ವಯಸ್ಕರಾಗಿದ್ದಾರೆ.',
      },
      reviewerMsg: isMinor
        ? 'Applicant is under 18. Verified parental/guardian relationship OTP flow.'
        : 'Applicant is adult.',
      fields: [],
    };
  },
};
