import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Plan } from '@/types/domain'

export function PlanCard({
  plan,
  onClick,
  onDuplicate,
  duplicating,
}: {
  plan: Plan
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
        <CardTitle className="text-base">{plan.name}</CardTitle>
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
      {plan.description && (
        <CardContent>
          <p className="text-muted-foreground text-sm">{plan.description}</p>
        </CardContent>
      )}
    </Card>
  )
}
