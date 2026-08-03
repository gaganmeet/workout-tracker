import { eachDayOfInterval, format, startOfWeek, subWeeks } from 'date-fns'
import { cn } from '@/lib/utils'
import type { DayActivity } from '../api'

const WEEKS = 53

const LEVEL_CLASSES = ['bg-muted', 'bg-primary/25', 'bg-primary/50', 'bg-primary/75', 'bg-primary']

function levelFor(count: number) {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count === 3) return 3
  return 4
}

export function ActivityHeatmap({ data }: { data: DayActivity[] }) {
  const counts = new Map(data.map((d) => [d.date, d.count]))
  const today = new Date()
  const gridStart = startOfWeek(subWeeks(today, WEEKS - 1))
  const days = eachDayOfInterval({ start: gridStart, end: today })

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  let lastMonth = ''
  const monthLabels = weeks.map((week) => {
    const month = format(week[0], 'MMM')
    if (month !== lastMonth) {
      lastMonth = month
      return month
    }
    return null
  })

  const totalDays = data.reduce((sum, d) => sum + (d.count > 0 ? 1 : 0), 0)

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1">
          <div className="flex gap-1 pl-0 text-xs text-muted-foreground">
            {monthLabels.map((label, index) => (
              <div key={index} className="w-3 shrink-0">
                {label}
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day) => {
                  const dateKey = format(day, 'yyyy-MM-dd')
                  const count = counts.get(dateKey) ?? 0
                  const isFuture = day > today
                  return (
                    <div
                      key={dateKey}
                      title={
                        isFuture
                          ? undefined
                          : `${count} workout${count === 1 ? '' : 's'} on ${format(day, 'PPP')}`
                      }
                      className={cn(
                        'size-3 rounded-sm',
                        isFuture ? 'bg-transparent' : LEVEL_CLASSES[levelFor(count)],
                      )}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{totalDays} days active in the last year</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {LEVEL_CLASSES.map((cls, index) => (
            <div key={index} className={cn('size-3 rounded-sm', cls)} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
