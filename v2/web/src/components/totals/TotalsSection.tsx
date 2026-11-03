import { useSuspenseQuery } from '@tanstack/react-query'
import { milestonesQuery } from '#/lib/queries'
import { hasStarted, powerliftingTotal, weightliftingTotal } from '#/lib/totals'
import { TotalCard } from './TotalCard'

export function TotalsSection() {
  const { data: milestones } = useSuspenseQuery(milestonesQuery)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <TotalCard liftTotal={powerliftingTotal} />
      {hasStarted(milestones, weightliftingTotal.lifts) && (
        <TotalCard liftTotal={weightliftingTotal} />
      )}
    </div>
  )
}
