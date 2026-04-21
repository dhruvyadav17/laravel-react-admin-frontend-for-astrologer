import { z } from 'zod';

export const astrologerProfileSchema = z.object({
  bio:               z.string().min(20, 'Bio must be at least 20 characters').max(2000),
  expertise:         z.string().min(2, 'Please enter your expertise').max(200),
  experience:        z.number().min(0).max(50),
  price_per_minute:  z.number().min(1, 'Minimum ₹1/min').max(10000),
  consultation_type: z.enum(['chat', 'call', 'video', 'all']),
  languages:         z.array(z.string()).min(1, 'Select at least one language'),
  skills:            z.array(z.string()).optional(),
});

export const reviewSchema = z.object({
  rating:  z.number().min(1, 'Rating is required').max(5),
  comment: z.string().max(1000).optional(),
});

export type AstrologerProfileData = z.infer<typeof astrologerProfileSchema>;
export type ReviewData            = z.infer<typeof reviewSchema>;
