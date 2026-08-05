import { useId, useState } from 'react'
import { format } from 'date-fns'
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import {
  CHART_AXIS_COLOR,
  CHART_COLOR,
  CHART_GRID_COLOR,
  ChartContainer,
  ChartStat,
  chartTooltipStyle,
} from '@/components/charts/ChartContainer'
import type { SessionPoint } from '../api'

export function OneRepMaxChart({ data }: { data: SessionPoint[] }) {
  const [metric, setMetric] = useState<'estOneRepMax' | 'topWeight'>('estOneRepMax')
  const gradientId = useId()

  const points = data.filter((point) => point[metric] !== null)

  if (points.length === 0) {
    return <p className="text-muted-foreground text-sm">Log completed sets for this exercise to see progress here.</p>
  }

  const current = points[points.length - 1][metric]!
  const best = Math.max(...points.map((point) => point[metric]!))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <ChartStat label="Current" value={`${current} kg`} />
          <ChartStat label="Best" value={`${best} kg`} />
        </div>
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
      </div>
      <ChartContainer>
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.2} />
              <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey={metric}
            stroke={CHART_COLOR}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={{ r: 4, fill: CHART_COLOR, strokeWidth: 2, stroke: 'var(--background)' }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
