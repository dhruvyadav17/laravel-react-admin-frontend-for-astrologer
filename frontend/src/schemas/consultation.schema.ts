// PATH: src/schemas/consultation.schema.ts
import { z } from 'zod';

export const bookingSchema = z.object({
  type:      z.enum(['chat', 'call', 'video']),
  user_note: z.string().max(500).optional(),
});

export type BookingData = z.infer<typeof bookingSchema>;
