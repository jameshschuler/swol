import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './programs.routes'
import type { AppRouteHandler } from '@/lib/types'
import { and, count, desc, eq, ilike, or, ne } from 'drizzle-orm'
import { db } from '@/db'
import { programs } from '@/db/schema'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { name, author, programType } = c.req.valid('query')
  const user = c.get('user')

  const orConditions = []

  if (name) {
    orConditions.push(ilike(programs.name, `%${name}%`))
  }

  if (author) {
    orConditions.push(ilike(programs.author, `%${author}%`))
  }

  if (programType) {
    orConditions.push(eq(programs.programType, programType))
  }

  const rows = await db.query.programs.findMany({
    where: and(
      eq(programs.userId, user!.id),
      or(...orConditions),
    ),
    orderBy: [desc(programs.createdAt)],
  })

  const response = {
    programs: rows,
    currentPrograms: {},
  }

  const activePrograms = await db.query.programs.findMany({
    where: and(
      eq(programs.userId, user!.id),
      eq(programs.active, true),
    ),
  })

  if (activePrograms.length !== 0) {
    const currentPrograms = activePrograms.reduce((acc, program) => {
      acc[program.programType] = {
        type: program.programType,
        name: program.name,
        id: program.id,
      }
      return acc
    }, {} as Record<string, { type: string, name: string, id: number }>)

    response.currentPrograms = currentPrograms
  }

  return c.json(response)
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const user = c.get('user')

  const programsCount = await db.select({ count: count() })
    .from(programs)
    .where(eq(programs.userId, user!.id))

  if (programsCount[0].count >= 100) {
    return c.json(
      { error: { issues: [], name: 'ProgramLimitExceeded' }, success: false },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    )
  }

  const program = c.req.valid('json')

  const values = {
    userId: user!.id,
    name: program.name,
    description: program.description,
    author: program.author,
    active: program.active || false,
    programType: program.programType,
    weeks: program.weeks,
    daysPerWeek: program.daysPerWeek,
  }

  const [createdProgram] = await db.insert(programs).values(values).returning()
  if (!createdProgram) {
    return c.json(
      {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    )
  }

  // Deactivate all other programs of the same type
  if (program.active) {
    await db.update(programs)
      .set({ active: false })
      .where(
        and(
          eq(programs.userId, user!.id),
          eq(programs.programType, program.programType),
          ne(programs.id, createdProgram.id),
        ),
      )
  }

  const { userId, ...rest } = createdProgram

  return c.json(rest, HttpStatusCodes.CREATED)
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const user = c.get('user')
  const { id } = c.req.valid('param')

  const result = await db.delete(programs)
    .where(and(
      eq(programs.id, id),
      eq(programs.userId, user!.id),
    ))

  if (result.count === 0) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.json({ success: true }, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const user = c.get('user')
  const { id } = c.req.valid('param')

  const result = await db.query.programs.findFirst({
    where: and(eq(programs.id, id), eq(programs.userId, user!.id)),
    columns: {
      userId: false,
    }
  })

  if (!result) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.json(result, HttpStatusCodes.OK)
}

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const user = c.get('user')
  const { id } = c.req.valid('param')

  const program = c.req.valid('json')
  const [result] = await db.update(programs).set(program).where(
    and(
      eq(programs.id, id),
      eq(programs.userId, user!.id),
    ),
  ).returning()

  if (!result) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  // Deactivate all other programs of the same type
  if (result.active) {
    await db.update(programs)
      .set({ active: false })
      .where(
        and(
          eq(programs.userId, user!.id),
          eq(programs.programType, result.programType),
          ne(programs.id, result.id),
        ),
      )
  }

  const { userId, ...rest } = result
  return c.json(rest, HttpStatusCodes.OK)
}
