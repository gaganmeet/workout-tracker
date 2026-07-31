import { useState } from 'react'
import { format } from 'date-fns'
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import {
  CHART_AXIS_COLOR,
  CHART_COLOR,
  CHART_GRID_COLOR,
  ChartContainer,
  chartTooltipStyle,
} from '@/components/charts/ChartContainer'
import type { SessionPoint } from '../api'

export function OneRepMaxChart({ data }: { data: SessionPoint[] }) {
  const [metric, setMetric] = useState<'estOneRepMax' | 'topWeight'>('estOneRepMax')

  const points = data.filter((point) => point[metric] !== null)

  if (points.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Log completed sets for this exercise to see progress here.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <Button
          size="sm"
          variant={metric === 'estOneRepMax' ? 'default' : 'outline'}
          onClick={() => setMetric('estOneRepMax')}
        >
          Est. 1RM
        </Button>
        <Button
          size="sm"
          variant={metric === 'topWeight' ? 'default' : 'outline'}
          onClick={() => setMetric('topWeight')}
        >
          Top set
        </Button>
      </div>
      <ChartContainer>
        <LineChart data={points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => format(new Date(value), 'MMM d')}
            stroke={CHART_AXIS_COLOR}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke={CHART_AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            {...chartTooltipStyle}
            labelFormatter={(value) => (value ? format(new Date(value as string), 'PPP') : '')}
            formatter={(value) => [`${value} kg`, metric === 'estOneRepMax' ? 'Est. 1RM' : 'Top set']}
          />
          <Line
            type="monotone"
            dataKey={metric}
            stroke={CHART_COLOR}
            strokeWidth={2}
            dot={{ r: 4, fill: CHART_COLOR, strokeWidth: 2, stroke: 'var(--background)' }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
