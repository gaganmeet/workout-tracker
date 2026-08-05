import type { ReactNode } from 'react'
import { ResponsiveContainer } from 'recharts'

export function ChartContainer({ children, height = 220 }: { children: ReactNode; height?: number }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as never}
      </ResponsiveContainer>
    </div>
  )
}

// Shared Recharts tooltip styled with the app's design tokens rather than
// Recharts' defaults, so it matches light/dark theme instead of a hardcoded
// white box.
export const chartTooltipStyle = {
  contentStyle: {
    background: 'var(--popover)',
    color: 'var(--popover-foreground)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 13,
  },
  labelStyle: { color: 'var(--muted-foreground)' },
}

export const CHART_COLOR = 'var(--chart-1)'
export const CHART_GRID_COLOR = 'var(--border)'
export const CHART_AXIS_COLOR = 'var(--muted-foreground)'

// A label/value pair for the small stat readout above a chart -- e.g.
// "Current" and "Best" -- so the headline numbers don't require hovering.
export function ChartStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}
