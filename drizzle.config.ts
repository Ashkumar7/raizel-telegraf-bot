import type { Config } from 'drizzle-kit';
import DotEnv from 'dotenv';
DotEnv.config({ path: '.env.local' });

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL + '?sslmode=require',
  },
} satisfies Config;
