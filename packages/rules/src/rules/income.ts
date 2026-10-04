import { Rule } from '../engine';
import { RuleResult, Facts } from '@scholarflow/shared';
import { isWithinValidityWindow, parseDate } from '@scholarflow/matching';

export const ruleIn001: Rule = {
  id: 'IN-001',
  version: '1.0.0',
  group: 'IN',
  description: 'Verifies annual family income does not exceed scheme ceiling',
  run(f: Facts): RuleResult {
    const statedIncome = f.form.statedIncome;
    const maxAllowed = f.scheme.maxFamilyIncome;

    if (statedIncome > maxAllowed) {
      return {
        ruleId: 'IN-001',
        severity: 'HARD_FAIL',
        status: 'FAIL',
        evidence: [
          { label: 'Stated Family Income', entered: `₹${statedIncome.toLocaleString('en-IN')}` },
          { label: 'Maximum Income Ceiling', extracted: `₹${maxAllowed.toLocaleString('en-IN')}` },
        ],
        msg: {
          en: `Annual family income ₹${statedIncome.toLocaleString('en-IN')} exceeds the scheme ceiling of ₹${maxAllowed.toLocaleString('en-IN')}.`,
          kn: `ವಾರ್ಷಿಕ ಆದಾಯ ₹${statedIncome.toLocaleString('en-IN')} ಗರಿಷ್ಠ ಮಿತಿ ₹${maxAllowed.toLocaleString('en-IN')} ಗಿಂತ ಹೆಚ್ಚಾಗಿದೆ.`,
        },
        reviewerMsg: `Ineligible on income criterion: ₹${statedIncome} > ₹${maxAllowed}.`,
        fields: ['statedIncome'],
      };
    }

    // Check against official revenue registry (e.g., Nadakacheri) if available
    const registryIncome = f.registry.income?.annualIncome;
    if (typeof registryIncome === 'number' && registryIncome > maxAllowed) {
      return {
        ruleId: 'IN-001',
        severity: 'HARD_FAIL',
        status: 'FAIL',
        evidence: [
          { label: 'Stated Family Income', entered: `₹${statedIncome.toLocaleString('en-IN')}` },
          { label: 'Revenue Registry Income', extracted: `₹${registryIncome.toLocaleString('en-IN')}` },
        ],
        msg: {
          en: 'Revenue department records indicate family income exceeds the scholarship eligibility threshold.',
          kn: 'ಕಂದಾಯ ಇಲಾಖೆಯ ದಾಖಲೆಗಳ ಪ್ರಕಾರ ಆದಾಯವು ಅರ್ಹತಾ ಮಿತಿಗಿಂತ ಹೆಚ್ಚಾಗಿದೆ.',
        },
        reviewerMsg: `Revenue registry discrepancy: official income ₹${registryIncome} exceeds ceiling ₹${maxAllowed}.`,
        fields: ['statedIncome', 'documents.INCOME_CERT'],
      };
    }

    return {
      ruleId: 'IN-001',
      severity: 'INFO',
      status: 'PASS',
      evidence: [
        { label: 'Stated Family Income', entered: `₹${statedIncome.toLocaleString('en-IN')}` },
        { label: 'Ceiling', extracted: `<= ₹${maxAllowed.toLocaleString('en-IN')}` },
      ],
      msg: {
        en: 'Annual family income meets scheme ceiling criteria.',
        kn: 'ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯವು ಅರ್ಹತಾ ಮಿತಿಯೊಳಗಿದೆ.',
      },
      reviewerMsg: `Income verified below ceiling: ₹${statedIncome}.`,
      fields: [],
    };
  },
};

export const ruleIn002: Rule = {
  id: 'IN-002',
  version: '1.0.0',
  group: 'IN',
  description: 'Verifies income certificate was issued within the validity window',
  run(f: Facts): RuleResult {
    const cert = f.docs['INCOME_CERT'];
    const issuedRaw = cert?.fields['issuedDate']?.value?.toString();
    const maxMonths = f.scheme.maxDocAgeMonths || 12;

    if (!issuedRaw) {
      return {
        ruleId: 'IN-002',
        severity: 'FIXABLE',
        status: 'FAIL',
        evidence: [
          { label: 'Income Certificate Issue Date', extracted: 'Not detected' },
        ],
        msg: {
          en: 'Issue date could not be read from the income certificate.',
          kn: 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರದ ದಿನಾಂಕವನ್ನು ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',
        },
        reviewerMsg: 'Income certificate date missing or illegible.',
        fixHint: 'Upload a clear copy of your income certificate where the issue date and RD number are legible.',
        fields: ['documents.INCOME_CERT'],
      };
    }

    const isoDate = parseDate(issuedRaw);
    if (!isoDate || !isWithinValidityWindow(isoDate, maxMonths, f.now)) {
      return {
        ruleId: 'IN-002',
        severity: 'FIXABLE',
        status: 'FAIL',
        evidence: [
          { label: 'Certificate Issue Date', extracted: issuedRaw },
          { label: 'Validity Window', entered: `Within ${maxMonths} months of evaluation` },
        ],
        msg: {
          en: `Income certificate issued on ${issuedRaw} has expired. Certificates must be issued within ${maxMonths} months.`,
          kn: `ಆದಾಯ ಪ್ರಮಾಣಪತ್ರದ ಮಾನ್ಯತೆಯ ಅವಧಿ ಮುಗಿದಿದೆ. ಪ್ರಮಾಣಪತ್ರವು ${maxMonths} ತಿಂಗಳುಗಳ ಒಳಗಿರಬೇಕು.`,
        },
        reviewerMsg: `Expired income certificate: issued on ${issuedRaw}, outside ${maxMonths}-month window.`,
        fixHint: 'Please obtain and upload a currently valid income certificate from Nadakacheri/Revenue office.',
        fields: ['documents.INCOME_CERT'],
      };
    }

    return {
      ruleId: 'IN-002',
      severity: 'INFO',
      status: 'PASS',
      evidence: [
        { label: 'Certificate Issue Date', extracted: isoDate },
        { label: 'Validity Window', entered: `Valid within ${maxMonths} months` },
      ],
      msg: {
        en: 'Income certificate is within active validity period.',
        kn: 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರವು ಚಾಲ್ತಿಯಲ್ಲಿದೆ.',
      },
      reviewerMsg: `Income certificate validity verified: ${isoDate}.`,
      fields: [],
    };
  },
};
