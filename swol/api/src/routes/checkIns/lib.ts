import z from 'zod'

export const listCheckInsQuerySchema = z.object({
  from: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true
      return !Number.isNaN(Date.parse(date))
    }, 'Invalid date format')
    .transform((date) => (date ? new Date(date) : undefined))
    .openapi({
      param: {
        name: 'from',
        in: 'query',
        required: false,
        description: 'Filter check ins from this date (inclusive).',
        example: '2023-01-01',
      },
    }),
  to: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true
      return !Number.isNaN(Date.parse(date))
    }, 'Invalid date format')
    .transform((date) => (date ? new Date(date) : undefined))
    .openapi({
      param: {
        name: 'to',
        in: 'query',
        required: false,
        description: 'Filter check ins up to this date (inclusive).',
        example: '2023-12-31',
      },
    }),
})
