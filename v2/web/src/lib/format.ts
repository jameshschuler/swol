const pad = (value: number) => String(value).padStart(2, '0')

export function formatClock(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(secs)}`
    : `${minutes}:${pad(secs)}`
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const minutesAndSeconds = `${minutes}m ${seconds % 60}s`
  return hours > 0 ? `${hours}h ${minutesAndSeconds}` : minutesAndSeconds
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatShortMonth(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short' })
}

export function formatWeeks(count: number): string {
  return `${count} ${count === 1 ? 'week' : 'weeks'}`
}

export function formatWeekdayName(weekday: number): string {
  return formatShortWeekday(new Date(2026, 0, 4 + weekday))
}

export function formatShortWeekday(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short' })
}

export function formatHours(seconds: number): string {
  return `${Number((seconds / 3600).toFixed(1))} h`
}
