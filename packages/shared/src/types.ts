import { z } from 'zod';

export type Role = 'APPLICANT' | 'GUARDIAN' | 'REVIEWER' | 'APPROVER' | 'ADMIN' | 'AUDITOR';

export type AppStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PROCESSING'
  | 'AUTO_CLEARED'
  | 'NEEDS_CORRECTION'
  | 'CORRECTION_SENT'
  | 'RESUBMITTED'
  | 'MANUAL_REVIEW'
  | 'APPROVED_BY_REVIEWER'
  | 'REJECTED_INELIGIBLE'
  | 'APPEALED'
  | 'LAPSED'
  | 'REOPENED'
  | 'HELP_REQUIRED'
  | 'SANCTIONED'
  | 'WITHDRAWN';

export type Severity = 'INFO' | 'WARN' | 'FIXABLE' | 'HARD_FAIL';

export type RuleStatus = 'PASS' | 'FAIL' | 'SKIPPED' | 'ERROR';

export type DocType =
  | 'AADHAAR_MASKED'
  | 'MARKSHEET'
  | 'INCOME_CERT'
  | 'CASTE_CERT'
  | 'BONAFIDE'
  | 'PASSBOOK'
  | 'PHOTO'
  | 'OTHER';

export type ExtractStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED' | 'DELAYED';

export type NotifChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'INAPP';

export type NotifStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'SKIPPED';

export type CorrectionStatus = 'OPEN' | 'SUBMITTED' | 'LAPSED' | 'CANCELLED';

export type Outcome =
  | 'AUTO_CLEARED'
  | 'NEEDS_CORRECTION'
  | 'MANUAL_REVIEW'
  | 'REJECTED_INELIGIBLE';

export interface Evidence {
  label: string;
  entered?: string | number | null;
  extracted?: string | number | null;
  docId?: string;
  page?: number;
  snippet?: string;
}

export interface RuleResult {
  ruleId: string;
  severity: Severity;
  status: RuleStatus;
  evidence: Evidence[];
  msg: {
    en: string;
    kn: string;
  };
  reviewerMsg: string;
  fixHint?: string;
  fields: string[];
}

export interface ExtractedDoc {
  docType: DocType;
  fields: Record<string, {
    value: string | number | boolean | null;
    confidence: number;
    page?: number;
    snippet?: string;
  }>;
}

export interface RegistryFact {
  valid: boolean;
  holderName?: string;
  category?: string;
  annualIncome?: number;
  issuedDate?: string;
  expiryDate?: string;
}

export interface SchemeConfig {
  slug: string;
  name: string;
  version: number;
  minPercentage: number;
  maxFamilyIncome: number;
  allowedCategories: string[];
  maxDocAgeMonths: number;
  submissionDeadline: string; // ISO format (IST)
}

export interface NormalisedForm {
  applicantName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: string;
  category: string;
  statedIncome: number;
  statedPercentage: number;
  aadhaarLast4: string;
  aadhaarHash: string;
  accountNumber: string;
  ifscCode: string;
  mobile: string;
  email: string;
  institutionCode: string;
}

export interface Facts {
  now: Date; // Injected clock (IST)
  scheme: SchemeConfig;
  form: NormalisedForm;
  docs: Record<string, ExtractedDoc | undefined>;
  registry: {
    income?: RegistryFact;
    caste?: RegistryFact;
  };
  bank: {
    ifscKnown: boolean;
    dbtActive: boolean;
  };
  institution: {
    listed: boolean;
    active: boolean;
  };
  dedupe: {
    aadhaarHashApps: string[];
    bankHashApps: string[];
    phoneApps: string[];
    fileHashApps: string[];
  };
}
