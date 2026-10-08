import { defineConfig } from 'drizzle-kit'
import env from '@/env'

export default defineConfig({
  schemaFilter: ['swol'],
  tablesFilter: ['activity', 'gym_checkin', 'user_profile', 'programs'],
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
})
