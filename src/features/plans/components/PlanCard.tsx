import { Copy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Plan } from '@/types/domain'
import type { PlanDaySummary } from '../api'

export function PlanCard({
  plan,
  ownerLabel,
  startableDays,
  onClick,
  onDuplicate,
  duplicating,
}: {
  plan: Plan
  ownerLabel?: string
  startableDays?: PlanDaySummary[]
  onClick?: () => void
  onDuplicate?: () => void
  duplicating?: boolean
}) {
  return (
    <Card
      className={onClick ? 'cursor-pointer transition-colors hover:bg-accent' : undefined}
      onClick={onClick}
    >
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{plan.name}</CardTitle>
          {ownerLabel && <p className="text-muted-foreground text-xs">From {ownerLabel}</p>}
        </div>
        {onDuplicate && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            disabled={duplicating}
            onClick={(event) => {
              event.stopPropagation()
              onDuplicate()
            }}
            title="Duplicate plan"
          >
            <Copy className="size-4" />
          </Button>
        )}
      </CardHeader>
      {(plan.description || startableDays?.length) && (
        <CardContent className="space-y-2">
          {plan.description && <p className="text-muted-foreground text-sm">{plan.description}</p>}
          {startableDays && startableDays.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {startableDays.map((day) => (
                <Button
                  key={day.id}
                  size="sm"
                  variant="secondary"
                  asChild
                  onClick={(event) => event.stopPropagation()}
                >
                  <Link to={`/app/workout/start?planDayId=${day.id}`}>Start {day.name}</Link>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
