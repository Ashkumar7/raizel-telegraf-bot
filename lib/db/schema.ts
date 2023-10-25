import { bigint, integer, pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);

export const users = pgTable('user', {
  id: varchar('id', { length: 191 }).primaryKey(),
  telegram_id: bigint('telegram_id', { mode: 'number' }).unique().notNull(),
  points: integer('points').default(0),
  role: roleEnum('role').default('USER'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const keys = pgTable('keys', {
  id: varchar('id', { length: 191 }).primaryKey(),
  key: varchar('key', { length: 191 }).unique().notNull(),
  points: integer('points').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
