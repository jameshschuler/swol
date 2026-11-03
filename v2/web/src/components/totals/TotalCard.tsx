import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { formatList, formatShortDateWithYear } from '#/lib/format'
import { meQuery, milestonesQuery } from '#/lib/queries'
import { missingLifts, totalHistory } from '#/lib/totals'
import type { LiftTotal } from '#/lib/totals'
import { formatWeight } from '#/lib/units'
import { TotalBreakdown } from './TotalBreakdown'
import { TotalChart } from './TotalChart'

export function TotalCard({ liftTotal }: { liftTotal: LiftTotal }) {
  const { data: milestones } = useSuspenseQuery(milestonesQuery)
  const { data: me } = useSuspenseQuery(meQuery)
  const unit = me.weightUnit
  const history = totalHistory(milestones, liftTotal.lifts, unit)
  const current = history.at(-1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{liftTotal.name}</CardTitle>
        {current && (
          <CardAction className="text-right">
            <p className="font-heading text-xl whitespace-nowrap tabular-nums">
              {formatWeight(current.total, unit)}
            </p>
            <p className="text-xs whitespace-nowrap">
              {formatShortDateWithYear(new Date(current.achievedAt))}
            </p>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {current ? (
          <>
            <TotalBreakdown bests={current.bests} unit={unit} />
            {history.length > 1 && (
              <TotalChart
                history={history}
                label={liftTotal.name}
                unit={unit}
              />
            )}
          </>
        ) : (
          <p className="text-sm">
            Log a single for{' '}
            {formatList(missingLifts(milestones, liftTotal.lifts))} to see your{' '}
            {liftTotal.name}.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
