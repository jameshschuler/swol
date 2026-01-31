import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import { createErrorSchema, IdParamsSchema } from 'stoker/openapi/schemas'
import { insertCheckInsSchema, patchCheckInsSchema, selectCheckInSchema, selectCheckInsSchema } from '@/db/schemas/checkIns.schemas'
import { notFoundSchema } from '@/lib/constants'
import { authMiddleware } from '@/middlewares/auth'
import { listCheckInsQuerySchema } from './lib'

const tags = ['Check-Ins']

export const list = createRoute({
  path: '/check-ins',
  method: 'get',
  request: {
    query: listCheckInsQuerySchema,
  },
  tags,
  middleware: [authMiddleware] as const,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        checkIns: z.array(selectCheckInsSchema),
      }),
      'The list of check-ins',
    ),
    // TODO: currently middleware response types aren't getting passed through
    // [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
    //   z.object({ error: z.string() }),
    //   'Unauthorized',
    // ),
  },
})

export const create = createRoute({
  path: '/check-ins',
  method: 'post',
  request: {
    body: jsonContentRequired(insertCheckInsSchema, 'The check-in to create'),
  },
  tags,
  middleware: [authMiddleware] as const,
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectCheckInSchema,
      'The created check-in',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Activity or program not found',
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertCheckInsSchema),
      'The validation errors(s)',
    ),
  },
})

export const remove = createRoute({
  path: '/check-ins',
  method: 'delete',
  request: {
    params: IdParamsSchema,
  },
  tags,
  middleware: [authMiddleware] as const,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'Check-in deleted',
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Check-in not found',
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid id error',
    ),
  },
})

export const getOne = createRoute({
  path: '/check-ins/{id}',
  method: 'get',
  tags,
  middleware: [authMiddleware] as const,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectCheckInSchema,
      'The requested check-in',
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid id error',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Check-in not found',
    ),
  },
})

export const patch = createRoute({
  path: '/check-ins/{id}',
  method: 'patch',
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(patchCheckInsSchema, 'The check-in to patch'),
  },
  tags,
  middleware: [authMiddleware] as const,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectCheckInSchema,
      'The patched check-in',
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchCheckInsSchema).or(createErrorSchema(IdParamsSchema)),
      'The validation errors(s)',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Check-in not found',
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type RemoveRoute = typeof remove
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
