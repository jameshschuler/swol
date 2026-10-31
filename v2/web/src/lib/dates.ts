export function localDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function dateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const msPerHour = 60 * 60 * 1000
export const msPerWeek = 7 * 24 * msPerHour

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function startOfWeek(date: Date): Date {
  return addDays(date, -date.getDay())
}

export function timeForDate(dateKey: string, now: Date): string {
  if (dateKey === localDateKey(now)) {
    return now.toISOString()
  }
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day, 12).toISOString()
}

export function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const start = new Date(year, month, 1 - first.getDay())
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weeks = Math.ceil((first.getDay() + daysInMonth) / 7)
  return Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i))
}

export function groupByDay<T>(
  items: T[],
  dateOf: (item: T) => string,
): Map<string, T[]> {
  const days = new Map<string, T[]>()
  for (const item of items) {
    const key = localDateKey(new Date(dateOf(item)))
    days.set(key, [...(days.get(key) ?? []), item])
  }
  return days
}

export function formatMonth(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}
