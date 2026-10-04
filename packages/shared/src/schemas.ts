import { z } from 'zod';

export const AadhaarLast4Schema = z.string().regex(/^\d{4}$/, 'Must be exactly 4 digits');

export const MobileSchema = z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number');

export const IfscSchema = z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Must be a valid 11-character IFSC code');

export const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const ApplicationFormSchema = z.object({
  applicantName: z.string().min(2, 'Name must be at least 2 characters').max(150),
  dateOfBirth: DateStringSchema,
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  category: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'EWS']),
  statedIncome: z.number().nonnegative(),
  statedPercentage: z.number().min(0).max(100),
  aadhaarLast4: AadhaarLast4Schema,
  accountNumber: z.string().min(8).max(20),
  ifscCode: IfscSchema,
  mobile: MobileSchema,
  email: z.string().email(),
  institutionCode: z.string().min(2),
});

export type ApplicationFormInput = z.infer<typeof ApplicationFormSchema>;
