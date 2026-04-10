// PATH: src/schemas/auth.schema.ts
// Centralized form validation — React Hook Form + Zod
// Use karo: const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });

import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().min(1, 'Email required hai').email('Valid email likhein'),
  password: z.string().min(1, 'Password required hai'),
});

export const registerSchema = z.object({
  name:                  z.string().min(2, 'Name 2+ characters hona chahiye').max(100),
  email:                 z.string().email('Valid email likhein'),
  password:              z.string().min(8, 'Password 8+ characters'),
  password_confirmation: z.string().min(1, 'Confirm password likhein'),
}).refine(
  (d) => d.password === d.password_confirmation,
  { message: 'Passwords match nahi karte', path: ['password_confirmation'] }
);

export const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email likhein'),
});

export const resetPasswordSchema = z.object({
  password:              z.string().min(8, 'Password 8+ characters'),
  password_confirmation: z.string().min(1, 'Confirm password likhein'),
}).refine(
  (d) => d.password === d.password_confirmation,
  { message: 'Passwords match nahi karte', path: ['password_confirmation'] }
);

export type LoginData    = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
