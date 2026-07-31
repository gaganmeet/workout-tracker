import { format } from 'date-fns'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import {
  CHART_AXIS_COLOR,
  CHART_COLOR,
  CHART_GRID_COLOR,
  ChartContainer,
  chartTooltipStyle,
} from '@/components/charts/ChartContainer'
import type { SessionPoint } from '../api'

export function VolumeChart({ data }: { data: SessionPoint[] }) {
  const points = data.filter((point) => point.volume > 0)

  if (points.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Log completed sets for this exercise to see volume here.
      </p>
    )
  }

  return (
    <ChartContainer>
      <BarChart data={points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="20%">
        <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => format(new Date(value), 'MMM d')}
          stroke={CHART_AXIS_COLOR}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke={CHART_AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} width={48} />
        <Tooltip
          {...chartTooltipStyle}
          labelFormatter={(value) => (value ? format(new Date(value as string), 'PPP') : '')}
          formatter={(value) => [`${Number(value).toLocaleString()} kg`, 'Volume']}
        />
        <Bar dataKey="volume" fill={CHART_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ChartContainer>
  )
}
