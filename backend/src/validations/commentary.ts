import { z } from 'zod';
import { env } from '@configs/env.js';


export const listCommentaryQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(env.MAX_LIMIT).optional()
}) 
/**
 * Zod schema for the 'commentary' table.
 * Designed for TypeScript type inference.
 */
export const createCommentarySchema = z.object({
  // Logical constraints for match timing
  minute: z.number().int().min(0).max(150),
  sequence: z.number().int().nonnegative().optional(),
  period: z.string().optional(),
  eventType: z.string().min(1).max(50).optional(),
  
  // Actor and Team info
  actor: z.string().max(255).optional(),
  team: z.string().max(255).optional(),
  
  // The actual text of the commentary
  message: z.string().min(1),
  
  // Metadata: Validating a JSONB object
  // Using z.record to ensure it's a key-value object
  metadata: z.record(z.string(),z.any()).optional(),
  
  // Array of strings for tags
  tags: z.array(z.string()).optional(),
});

// Extract the TypeScript type from the schema
export type CreateCommentaryType = z.infer<typeof createCommentarySchema>;
