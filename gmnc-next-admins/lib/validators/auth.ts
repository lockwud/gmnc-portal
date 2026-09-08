import { z } from 'zod';

export const roleSchema = z.enum(['admin', 'provider', 'support', 'tester', 'caregiver']);
export const userTypeSchema = z.enum(['SERVICE_PROVIDER', 'ADMIN']);

// Mirrors backend termsReacceptanceRequired() (Group 3): login and /auth/me
// attach this so the portal can gate on document version bumps.
export const termsStatusSchema = z.object({
  reacceptanceRequired: z.boolean(),
  acceptedTermsVersion: z.string().nullable().optional(),
  acceptedPrivacyPolicyVersion: z.string().nullable().optional(),
  liveTermsVersion: z.string().optional(),
  livePrivacyPolicyVersion: z.string().optional(),
});

export const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email().nullable().optional().transform((value) => value ?? null),
  name: z.string().min(1),
  roles: z.array(roleSchema).default([]),
  permissions: z.array(z.string()).default([]),
  userType: userTypeSchema.optional(),
  avatar: z.string().nullable().optional().transform((value) => value ?? null),
  terms: termsStatusSchema.nullable().optional().transform((value) => value ?? null).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('A valid email address is required'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const genderSchema = z.enum(['MALE', 'FEMALE']);
export const otpChannelSchema = z.enum(['sms', 'email']);

export const acceptTermsSchema = z.object({
  acceptedTerms: z.literal(true, { message: 'You must accept the Terms to continue' }),
  acceptedPrivacyPolicy: z.literal(true, { message: 'You must accept the Privacy Policy to continue' }),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  email: z.string().email('A valid email address is required').optional().nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().trim().min(1, 'Phone number is required'),
  gender: genderSchema,
  role: userTypeSchema,
  dateOfBirth: z.string().optional().nullable().describe('ISO date string (YYYY-MM-DD)'),
  profileImage: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  digitalAddress: z.string().optional().nullable(),
  otpChannel: otpChannelSchema,
  verified: z.boolean().optional().default(false),
  profileCompleted: z.boolean().optional().default(false),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;
export type TermsStatus = z.infer<typeof termsStatusSchema>;
export type AcceptTermsInput = z.infer<typeof acceptTermsSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
