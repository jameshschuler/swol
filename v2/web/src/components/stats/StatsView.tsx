import { useQuery } from '@tanstack/react-query'
import {
  formatDuration,
  formatHours,
  formatShortDate,
  formatShortMonth,
  formatWeekdayName,
  formatWeeks,
} from '#/lib/format'
import { legacyCheckInsQuery, sessionsQuery } from '#/lib/queries'
import {
  averageVisitsPerWeek,
  recentWorkoutLengths,
  visitDays,
  visitTotals,
  visitsByWeekday,
  visitsPerMonth,
  visitsPerWeek,
  weekStreaks,
  workoutTotals,
} from '#/lib/stats'
import { StatTile } from './StatTile'
import { BarChartCard } from './BarChartCard'
import { VisitsHeatmap } from './VisitsHeatmap'

const weeksShown = 12

export function StatsView() {
  const sessions = useQuery(sessionsQuery)
  const legacyCheckIns = useQuery(legacyCheckInsQuery)
  const error = sessions.error ?? legacyCheckIns.error

  if (error) {
    return <p className="text-danger">{error.message}</p>
  }
  if (!sessions.data || !legacyCheckIns.data) {
    return <p>Loading…</p>
  }

  const now = new Date()
  const days = visitDays(sessions.data, legacyCheckIns.data)
  const totals = visitTotals(days, now)
  const streaks = weekStreaks(days, now)
  const workouts = workoutTotals(sessions.data, now.getTime())

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Total visits" value={String(totals.all)} />
        <StatTile label="This year" value={String(totals.thisYear)} />
        <StatTile label="This month" value={String(totals.thisMonth)} />
        <StatTile
          label="Visits per week"
          value={averageVisitsPerWeek(days, now, weeksShown).toFixed(1)}
        />
        <StatTile label="Current streak" value={formatWeeks(streaks.current)} />
        <StatTile label="Longest streak" value={formatWeeks(streaks.longest)} />
        <StatTile
          label="Time trained"
          value={formatHours(workouts.totalSeconds)}
        />
        <StatTile
          label="Average workout"
          value={
            workouts.count
              ? formatDuration(Math.round(workouts.averageSeconds))
              : '–'
          }
        />
      </div>
      <VisitsHeatmap days={days} now={now} />
      <BarChartCard
        title={`Visits per week (last ${weeksShown})`}
        valueLabel="Visits"
        data={visitsPerWeek(days, now, weeksShown).map((week) => ({
          label: formatShortDate(week.start),
          value: week.visits,
        }))}
      />
      <BarChartCard
        title="Visits per month"
        valueLabel="Visits"
        data={visitsPerMonth(days, now, 12).map((month) => ({
          label: formatShortMonth(month.start),
          value: month.visits,
        }))}
      />
      <BarChartCard
        title="Favorite days"
        valueLabel="Visits"
        data={visitsByWeekday(days).map((visits, weekday) => ({
          label: formatWeekdayName(weekday),
          value: visits,
        }))}
      />
      {workouts.count > 0 && (
        <BarChartCard
          title="Workout length (last 20)"
          valueLabel="Minutes"
          data={recentWorkoutLengths(sessions.data, now.getTime(), 20).map(
            (workout) => ({
              label: formatShortDate(workout.start),
              value: workout.minutes,
            }),
          )}
        />
      )}
    </div>
  )
}
