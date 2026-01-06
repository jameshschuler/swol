import { z } from 'zod'

export const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),
  NODE_ENV: z.string().default('development'),
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string(),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
})

export type env = z.infer<typeof EnvSchema>

// eslint-disable-next-line ts/no-redeclare, node/prefer-global/process, node/no-process-env
const { data: env, error } = EnvSchema.safeParse(process.env)

if (error) {
  console.error('❌ Invalid env:')
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2))
  // eslint-disable-next-line node/prefer-global/process
  process.exit(1)
}

export default env!
