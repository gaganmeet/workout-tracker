import { Copy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StarButton } from '@/components/StarButton'
import { useAuth } from '@/features/auth/AuthContext'
import { useTogglePlanStar } from '../hooks'
import type { Plan } from '@/types/domain'
import type { PlanDaySummary, PlanStarRef } from '../api'

export function PlanCard({
  plan,
  ownerLabel,
  ownerId,
  startableDays,
  onClick,
  onDuplicate,
  duplicating,
}: {
  plan: Plan & { plan_stars?: PlanStarRef[] }
  ownerLabel?: string
  ownerId?: string
  startableDays?: PlanDaySummary[]
  onClick?: () => void
  onDuplicate?: () => void
  duplicating?: boolean
}) {
  const { profile } = useAuth()
  const toggleStar = useTogglePlanStar(plan.id)
  const stars = plan.plan_stars ?? []
  const isStarred = !!profile && stars.some((s) => s.user_id === profile.id)

  async function handleToggleStar() {
    if (!profile) return
    try {
      await toggleStar.mutateAsync({ userId: profile.id, isStarred: isStarred })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update star')
    }
  }

  return (
    <Card
      className={onClick ? 'cursor-pointer transition-colors hover:bg-accent' : undefined}
      onClick={onClick}
    >
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{plan.name}</CardTitle>
          {ownerLabel &&
            (ownerId ? (
              <Link
                to={`/${profile?.role === 'coach' ? 'coach' : 'app'}/profile/${ownerId}`}
                onClick={(event) => event.stopPropagation()}
                className="text-muted-foreground text-xs hover:underline"
              >
                From {ownerLabel}
              </Link>
            ) : (
              <p className="text-muted-foreground text-xs">From {ownerLabel}</p>
            ))}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <StarButton
            starred={isStarred}
            count={stars.length}
            disabled={toggleStar.isPending}
            onToggle={() => void handleToggleStar()}
            size="sm"
          />
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
        </div>
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
