import { z } from 'zod';

export const analyzeTextSchema = z.object({
  text: z.string().min(1, 'Emergency text cannot be empty')
});
