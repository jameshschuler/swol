import { sql } from 'drizzle-orm'
import { bigint, boolean, foreignKey, pgPolicy, pgSchema, pgTable, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core'

const authSchema = pgSchema('auth')
const swolSchema = pgSchema('swol')

export const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
})

export const activity = swolSchema.table('activity', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({ name: 'activity_id_seq', startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  name: text().notNull(),
}, () => [
  pgPolicy("Prevent all UPDATE operations", { as: "permissive", for: "update", to: ["public"], using: sql`false` }),
	pgPolicy("Prevent all Inserts", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Prevent all DELETE operations", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("Enable select for authenticated users only", { as: "permissive", for: "select", to: ["authenticated"] }),
])

export const gymCheckin = swolSchema.table('gym_checkin', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({ name: 'gym_checkin_id_seq', startWith: 1, increment: 1, minValue: 1, maxValue: '9223372036854775807', cache: 1 }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  userId: uuid('user_id').notNull(),
  checkinDate: timestamp('checkin_date', { withTimezone: true, mode: 'string' }).notNull(),
  activityId: bigint('activity_id', { mode: 'number' }).default(sql`'1'`).notNull(),
  notes: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	programId: bigint("program_id", { mode: "number" }),
}, table => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'gym_checkin_user_id_fkey',
  }),
  foreignKey({
    columns: [table.programId],
    foreignColumns: [programs.id],
    name: "gym_checkin_program_id_fkey"
  }),
  foreignKey({
    columns: [table.activityId],
    foreignColumns: [activity.id],
    name: 'gym_checkin_activity_id_fkey',
  }),
  pgPolicy('Enable update for users based on user_id', { as: 'permissive', for: 'update', to: ['authenticated'], using: sql`(auth.uid() = user_id)` }),
  pgPolicy('Enable select for users based on user_id', { as: 'permissive', for: 'select', to: ['authenticated'] }),
  pgPolicy('Enable insert for authenticated users only', { as: 'permissive', for: 'insert', to: ['authenticated'] }),
  pgPolicy('Enable delete for users based on user_id', { as: 'permissive', for: 'delete', to: ['authenticated'] }),
  pgPolicy("Deny all access to anon", { as: "restrictive", for: "all", to: ["anon"] }),
])

export const userProfile = swolSchema.table('user_profile', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({ name: 'user_profile_id_seq', startWith: 1, increment: 1, minValue: 1, maxValue: '9223372036854775807', cache: 1 }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  userId: uuid('user_id').notNull(),
  email: varchar().notNull(),
  fullName: varchar('full_name'),
  avatarUrl: varchar('avatar_url'),
  pictureUrl: varchar('picture_url'),
  username: varchar(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  syncedProfile: boolean('synced_profile').default(false).notNull(),
}, table => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'user_profile_user_id_fkey',
  }),
  unique('user_profile_user_id_key').on(table.userId),
  unique('user_profile_email_key').on(table.email),
  pgPolicy('Enable update for users based on user_id', { as: 'permissive', for: 'update', to: ['authenticated'], using: sql`(auth.uid() = user_id)` }),
  pgPolicy('Enable select for users based on user_id', { as: 'permissive', for: 'select', to: ['authenticated'] }),
  pgPolicy('Disable delete', { as: 'permissive', for: 'delete', to: ['public'] }),
])

export const programs = swolSchema.table('programs', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({ name: 'programs_id_seq', startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
  name: text().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }),
  description: text(),
  userId: uuid('user_id').notNull(),
  programType: text('program_type').notNull(),
  active: boolean().notNull(),
  author: text().notNull(),
  weeks: bigint({ mode: 'number' }),
  daysPerWeek: bigint('days_per_week', { mode: 'number' }),
}, table => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'programs_user_id_fkey',
  }),
  pgPolicy('Enable all operations for users based on user_id', { as: 'restrictive', for: 'all', to: ['authenticated'], using: sql`(auth.uid() = user_id)`, withCheck: sql`(( SELECT auth.uid() AS uid) = user_id)` }),
  pgPolicy('Deny all access to anon', { as: 'restrictive', for: 'all', to: ['anon'] }),
])
