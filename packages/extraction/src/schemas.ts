import { z } from 'zod';

export const ExtractedFieldSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  confidence: z.number().min(0).max(1),
  page: z.number().optional(),
  snippet: z.string().optional(),
});

export type ExtractedField = z.infer<typeof ExtractedFieldSchema>;

export const MarksheetExtractionSchema = z.object({
  studentName: ExtractedFieldSchema,
  rollNumber: ExtractedFieldSchema,
  examBoard: ExtractedFieldSchema,
  marksObtained: ExtractedFieldSchema,
  totalMarks: ExtractedFieldSchema,
  passingYear: ExtractedFieldSchema,
});

export const IncomeCertExtractionSchema = z.object({
  holderName: ExtractedFieldSchema,
  applicationNumber: ExtractedFieldSchema,
  annualIncome: ExtractedFieldSchema,
  issuedDate: ExtractedFieldSchema,
  tahsildarOffice: ExtractedFieldSchema,
});

export const CasteCertExtractionSchema = z.object({
  holderName: ExtractedFieldSchema,
  casteCategory: ExtractedFieldSchema,
  certificateNumber: ExtractedFieldSchema,
  issuedDate: ExtractedFieldSchema,
});

export const PassbookExtractionSchema = z.object({
  accountHolder: ExtractedFieldSchema,
  accountNumber: ExtractedFieldSchema,
  ifsc: ExtractedFieldSchema,
  bankName: ExtractedFieldSchema,
  branch: ExtractedFieldSchema,
});

export const AadhaarMaskedExtractionSchema = z.object({
  name: ExtractedFieldSchema,
  dob: ExtractedFieldSchema,
  gender: ExtractedFieldSchema,
  last4: ExtractedFieldSchema,
  isMasked: ExtractedFieldSchema,
});
