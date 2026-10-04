import { Rule } from '../engine';
import { RuleResult, Facts } from '@scholarflow/shared';

const REQUIRED_DOCS = ['MARKSHEET', 'INCOME_CERT', 'PASSBOOK'] as const;

export const ruleDq001: Rule = {
  id: 'DQ-001',
  version: '1.0.0',
  group: 'DQ',
  description: 'Validates that uploaded documents pass the readability and quality threshold',
  run(f: Facts): RuleResult[] {
    const results: RuleResult[] = [];

    for (const docKey of Object.keys(f.docs)) {
      const doc = f.docs[docKey];
      if (!doc) continue;

      let lowConfidenceFields = 0;
      for (const [field, data] of Object.entries(doc.fields)) {
        if (data.confidence < 0.60) {
          lowConfidenceFields++;
        }
      }

      if (lowConfidenceFields > 0) {
        results.push({
          ruleId: 'DQ-001',
          severity: 'FIXABLE',
          status: 'FAIL',
          evidence: [
            { label: 'Document Type', entered: doc.docType },
            { label: 'Readability Warning', extracted: `${lowConfidenceFields} fields unreadable or blurred` },
          ],
          msg: {
            en: `The uploaded ${doc.docType} is blurred or low-resolution. Please re-upload a clearer image.`,
            kn: `ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ${doc.docType} ಅಸ್ಪಷ್ಟವಾಗಿದೆ. ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾದ ಪ್ರತಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.`,
          },
          reviewerMsg: `Document ${doc.docType} failed clarity threshold (${lowConfidenceFields} low-confidence fields).`,
          fixHint: 'Take a clear, well-lit photo of the original document without glare or shadows.',
          fields: [`documents.${doc.docType}`],
        });
      }
    }

    if (results.length === 0) {
      results.push({
        ruleId: 'DQ-001',
        severity: 'INFO',
        status: 'PASS',
        evidence: [{ label: 'Document Quality Gate', extracted: 'All documents pass resolution check' }],
        msg: {
          en: 'Document clarity and quality gates passed.',
          kn: 'ದಾಖಲೆಗಳ ಸ್ಪಷ್ಟತೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.',
        },
        reviewerMsg: 'All documents legible.',
        fields: [],
      });
    }

    return results;
  },
};

export const ruleDq002: Rule = {
  id: 'DQ-002',
  version: '1.0.0',
  group: 'DQ',
  description: 'Verifies all mandatory documents are present in the application dossier',
  run(f: Facts): RuleResult {
    const missing: string[] = [];
    for (const req of REQUIRED_DOCS) {
      if (!f.docs[req]) {
        missing.push(req);
      }
    }

    if (missing.length > 0) {
      return {
        ruleId: 'DQ-002',
        severity: 'FIXABLE',
        status: 'FAIL',
        evidence: [
          { label: 'Required Documents', entered: REQUIRED_DOCS.join(', ') },
          { label: 'Missing Documents', extracted: missing.join(', ') },
        ],
        msg: {
          en: `Mandatory documents are missing: ${missing.join(', ')}.`,
          kn: `ಕಡ್ಡಾಯ ದಾಖಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ: ${missing.join(', ')}.`,
        },
        reviewerMsg: `Dossier incomplete. Missing documents: ${missing.join(', ')}.`,
        fixHint: `Please upload the following required documents: ${missing.join(', ')}.`,
        fields: missing.map(m => `documents.${m}`),
      };
    }

    return {
      ruleId: 'DQ-002',
      severity: 'INFO',
      status: 'PASS',
      evidence: [
        { label: 'Required Documents', entered: REQUIRED_DOCS.join(', ') },
        { label: 'Upload Status', extracted: 'All mandatory documents present' },
      ],
      msg: {
        en: 'All required documents have been uploaded.',
        kn: 'ಎಲ್ಲಾ ಅಗತ್ಯ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.',
      },
      reviewerMsg: 'Dossier complete.',
      fields: [],
    };
  },
};
