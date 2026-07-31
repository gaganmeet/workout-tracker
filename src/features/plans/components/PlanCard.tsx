import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Plan } from '@/types/domain'

export function PlanCard({ plan, onClick }: { plan: Plan; onClick?: () => void }) {
  return (
    <Card
      className={onClick ? 'cursor-pointer transition-colors hover:bg-accent' : undefined}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-base">{plan.name}</CardTitle>
      </CardHeader>
      {plan.description && (
        <CardContent>
          <p className="text-muted-foreground text-sm">{plan.description}</p>
        </CardContent>
      )}
    </Card>
  )
}
