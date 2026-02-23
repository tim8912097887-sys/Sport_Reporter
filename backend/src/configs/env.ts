import z  from 'zod';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env.dev'] });

const envSchema = z.object({
  // NODE_ENV Validation
  NODE_ENV: z
    .enum(['development', 'test', 'production'], {
      error: "NODE_ENV must be 'development', 'test', or 'production'",
    })
    .default('development'),

  // PORT Validation
  PORT: z.coerce
    .number({
      error: "PORT must be a number",
    })
    .int()
    .positive("PORT must be a positive integer")
    .max(65535, "PORT cannot exceed 65535")
    .default(3000),

  // DATABASE_URL Validation
  DATABASE_URL: z
  .string()
  .regex(
    /^postgresql?:\/\/[a-zA-Z0-9_.-]+(:.+)?@([a-zA-Z0-9.-]+|\[[a-fA-Z0-9:]+\])(:[0-9]+)?\/[a-zA-Z0-9_.-]+$/,
    "Invalid PostgreSQL connection string format"
  ),
  // HOST Validation
  HOST: z.string().default('0.0.0.0'),
  ARCJET_KEY: z.string("Arcjet key must be string").refine((data) => data.startsWith("ajkey_"),{ error: "Arcjet key must start with ajkey_" }),
  ARCJET_ENV: z
    .enum(['development', 'test', 'production'], {
      error: "NODE_ENV must be 'development', 'test', or 'production'",
    })
    .default('development'),
  ARCJET_MODE: z
    .enum(['DRY_RUN', 'LIVE'], {
      error: "ARCJET_MODE must be 'LIVE', 'DRY_RUN'",
    })
    .default('LIVE'),
  MAX_LIMIT: z.coerce
    .number({
      error: "MAX_LIMIT must be a number",
    })
    .int()
    .positive("MAX_LIMIT must be a positive integer")
    .max(100, "MAX_LIMIT cannot exceed 100")
    .default(100) 
});

// Validate process.env
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  const errorMessage = _env.error.issues
    .map((issue) => `- ${issue.path.join('.')} : ${issue.message}`).join('\n');

  console.error(`❌ Invalid environment variables:\n${errorMessage}`);
  process.exit(1); // Stop the process in production if config is broken
}

export const env = _env.data;


