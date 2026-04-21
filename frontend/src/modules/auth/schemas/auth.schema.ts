import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name:                  z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:                 z.string().email('Enter a valid email address'),
  password:              z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().min(1, 'Please confirm your password'),
}).refine(
  (d) => d.password === d.password_confirmation,
  { message: 'Passwords do not match', path: ['password_confirmation'] }
);

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password:              z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().min(1, 'Please confirm your password'),
}).refine(
  (d) => d.password === d.password_confirmation,
  { message: 'Passwords do not match', path: ['password_confirmation'] }
);

export type LoginData    = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
