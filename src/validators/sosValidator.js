import { z } from 'zod';

export const createSosSchema = z.object({
  incident_type: z.string().optional().default('Emergency'),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
  people_involved: z.number().int().min(1).default(1),
  injury_reported: z.boolean().default(false),
  hazard_reported: z.boolean().default(false),
  ai_summary: z.string().optional().default(''),
  recommended_action: z.string().optional().default(''),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  location_accuracy: z.number().nullable().optional(),
  status: z.enum(['ACTIVE', 'DISPATCHED', 'RESOLVED', 'CANCELLED']).default('ACTIVE')
});

export const updateSosStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'DISPATCHED', 'RESOLVED', 'CANCELLED'])
});
