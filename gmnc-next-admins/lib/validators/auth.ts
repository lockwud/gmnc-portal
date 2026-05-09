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

export type SessionUser = z.infer<typeof sessionUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;