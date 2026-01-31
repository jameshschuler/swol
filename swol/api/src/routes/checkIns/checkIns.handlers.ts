import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './checkIns.routes'
import type { AppRouteHandler } from '@/lib/types'
import { and, eq, inArray, lt, sql } from 'drizzle-orm'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { db } from '@/db'
import { activity, gymCheckin, programs } from '@/db/schema'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const user = c.get('user')
  const { from, to } = c.req.valid('query')
  const whereConditions = []

  let start = from ? dayjs.utc(from) : dayjs.utc().subtract(30, 'day');
  let end = to ? dayjs.utc(to) : dayjs.utc();

  const startStr = start.startOf('day').toISOString();
  const endStr = end.endOf('day').toISOString();

  whereConditions.push(sql`${gymCheckin.checkinDate} >= ${startStr}`);
  whereConditions.push(sql`${gymCheckin.checkinDate} <= ${endStr}`);

  const rows = await db.query.gymCheckin.findMany({
    where: and(eq(gymCheckin.userId, user!.id), ...whereConditions),
    columns: {
      id: true,
      checkinDate: true,
      notes: true,
    },
    with: {
      activity: {
        columns: {
          id: true,
          name: true,
        },
      },
      program: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  })

  return c.json({
    checkIns: rows,
  })
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const user = c.get('user')

  const checkIn = c.req.valid('json')

  const relatedActivity = await db.query.activity.findFirst({
    where: eq(activity.id, checkIn.activityId),
  })

  if (!relatedActivity) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  if (checkIn.programId) {
    const relatedProgram = await db.query.programs.findFirst({
      where: eq(programs.id, checkIn.programId),
    })

    if (!relatedProgram) {
      return c.json(
        {
          message: HttpStatusPhrases.NOT_FOUND,
        },
        HttpStatusCodes.NOT_FOUND,
      )
    }
  }

  const [createdCheckIn] = await db.insert(gymCheckin).values({
    userId: user!.id,
    checkinDate: checkIn.checkinDate,
    activityId: checkIn.activityId,
    notes: checkIn.notes,
    programId: checkIn.programId,
  }).returning({
    id: gymCheckin.id,
    checkinDate: gymCheckin.checkinDate,
    activityId: gymCheckin.activityId,
    notes: gymCheckin.notes,
    programId: gymCheckin.programId,
  })

  return c.json(createdCheckIn, HttpStatusCodes.CREATED)
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const user = c.get('user')
  const { id } = c.req.valid('param')

  const result = await db.delete(gymCheckin)
    .where(and(
      eq(gymCheckin.id, id),
      eq(gymCheckin.userId, user!.id),
    ))

  if (result.count === 0) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const user = c.get('user')
  const { id } = c.req.valid('param')

  const result = await db.query.gymCheckin.findFirst({
    where: and(eq(gymCheckin.id, id), eq(gymCheckin.userId, user!.id)),
    columns: {
      userId: false,
    },
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

  const checkIn = c.req.valid('json')
  const [result] = await db.update(gymCheckin).set(checkIn).where(
    and(
      eq(gymCheckin.id, id),
      eq(gymCheckin.userId, user!.id),
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

  const { userId, ...rest } = result
  return c.json(rest, HttpStatusCodes.OK)
}
