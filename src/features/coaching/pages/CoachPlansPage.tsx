import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { useOwnPlans } from '@/features/plans/hooks'
import { PlanCard } from '@/features/plans/components/PlanCard'

export function CoachPlansPage() {
  const { profile } = useAuth()
  const { data: plans, isLoading } = useOwnPlans(profile?.id)
  const navigate = useNavigate()

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Plan templates</h1>
        <Button size="sm" asChild>
          <Link to="/coach/plans/new">
            <Plus className="mr-1 size-4" />
            New template
          </Link>
        </Button>
      </div>
      {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
      {!isLoading && plans?.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No templates yet. Create one to reuse across clients.
        </p>
      )}
      <div className="space-y-2">
        {plans?.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onClick={() => navigate(`/coach/plans/${plan.id}`)} />
        ))}
      </div>
    </div>
  )
}
