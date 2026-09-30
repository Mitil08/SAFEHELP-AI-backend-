import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1, 'Contact name is required').max(100),
  phone: z.string().min(5, 'Valid phone number is required').max(25),
  email: z.string().email('Please provide a valid email').optional().or(z.literal(''))
});
