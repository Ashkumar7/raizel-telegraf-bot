import { sql } from '@vercel/postgres';
import DotEnv from 'dotenv';

import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';
DotEnv.config({ path: '.env.local' });

// Initialize Drizzle
export const db = drizzle(sql, { schema });
