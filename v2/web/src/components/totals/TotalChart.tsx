import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '#/components/ui/chart'
import type { ChartConfig } from '#/components/ui/chart'
import { formatShortDateWithYear } from '#/lib/format'
import type { TotalPoint } from '#/lib/totals'
import { roundWeight } from '#/lib/units'
import type { WeightUnit } from '#/types/api'

export function TotalChart({
  history,
  label,
  unit,
}: {
  history: TotalPoint[]
  label: string
  unit: WeightUnit
}) {
  const config = {
    total: { label: `${label} (${unit})`, color: 'var(--main)' },
  } satisfies ChartConfig
  const data = history.map((point) => ({
    label: formatShortDateWithYear(new Date(point.achievedAt)),
    total: roundWeight(point.total),
  }))

  return (
    <ChartContainer config={config} className="aspect-auto h-48 w-full">
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
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Line
          dataKey="total"
          type="stepAfter"
          stroke="var(--color-total)"
          strokeWidth={2}
          dot={{ fill: 'var(--color-total)' }}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
