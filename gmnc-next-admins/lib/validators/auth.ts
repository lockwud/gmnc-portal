import { profile } from 'console';
import { z } from 'zod';

export const roleSchema = z.enum(['admin', 'provider', 'support', 'tester', 'caregiver']);

export const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email().nullable().optional().transform((value) => value ?? null),
  name: z.string().min(1),
  roles: z.array(roleSchema).default([]),
  permissions: z.array(z.string()).default([]),
  avatar: z.string().nullable().optional().transform((value) => value ?? null),
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
export const userTypeSchema = z.enum(['SERVICE_PROVIDER', 'CAREGIVER', 'ADMIN']);
export const otpChannelSchema = z.enum(['sms', 'email']);

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
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;