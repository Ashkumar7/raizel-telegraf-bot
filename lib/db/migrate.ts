import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './connection';

// Migrations
async function main() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('Migrations complete');
}

main().catch((err) => console.log(err));
