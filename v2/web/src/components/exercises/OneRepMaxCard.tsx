import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '#/components/ui/chart'
import type { ChartConfig } from '#/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { formatShortDateWithYear } from '#/lib/format'
import { maxOneRepMaxReps } from '#/lib/lifts'
import { formatLiftWithRpe } from '#/lib/milestones'
import type { OneRepMaxPoint } from '#/lib/milestones'
import { roundWeight } from '#/lib/units'
import type { WeightUnit } from '#/types/api'

export function OneRepMaxCard({
  history,
  unit,
}: {
  history: OneRepMaxPoint[]
  unit: WeightUnit
}) {
  const config = {
    estimate: { label: `Estimated 1RM (${unit})`, color: 'var(--main)' },
  } satisfies ChartConfig
  const data = history.map(({ milestone, estimate }) => ({
    label: formatShortDateWithYear(new Date(milestone.achievedAt)),
    lift: formatLiftWithRpe(milestone, unit),
    estimate: roundWeight(estimate),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimated 1RM over time</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length < 2 ? (
          <p className="text-sm">
            Log at least two sets of {maxOneRepMaxReps} reps or fewer to see
            your trend.
          </p>
        ) : (
          <ChartContainer config={config} className="aspect-auto h-56 w-full">
            <LineChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={8}
              />
              <YAxis
                domain={['dataMin', 'auto']}
                padding={{ top: 8, bottom: 8 }}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) =>
                      `${payload[0]?.payload.label} · ${payload[0]?.payload.lift}`
                    }
                  />
                }
              />
              <Line
                dataKey="estimate"
                type="linear"
                stroke="var(--color-estimate)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-estimate)' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
