import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3002),
  HOST: z.string().default('0.0.0.0'),
  MINNAUZ_API_URL: z.string().url().default('http://127.0.0.1:3001/api'),
  MINNAUZ_AUTH_SERVER_URL: z.string().url().default('https://api.minna.uz'),
  MCP_RESOURCE_URL: z.string().url().default('https://mcp.minna.uz'),
  API_TIMEOUT_MS: z.coerce.number().default(10000),
  DEV_BEARER_TOKEN: z.string().optional().default(''),
  CORS_ORIGINS: z.string().default('*'),
});

export type EnvConfig = z.infer<typeof envSchema>;

function loadEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid MCP Server configuration:', result.error.format());
    throw new Error('Invalid environment configuration for MCP Server');
  }
  return result.data;
}

export const env = loadEnv();

