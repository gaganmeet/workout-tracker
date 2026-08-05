import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { useAssignedPlans, useOwnPlans } from '@/features/plans/hooks'
import { PlanCard } from '@/features/plans/components/PlanCard'

export function AthleteDashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { data: ownPlans, isLoading: loadingOwn } = useOwnPlans(profile?.id)
  const { data: assignedPlans, isLoading: loadingAssigned } = useAssignedPlans(profile?.id)
  const loadingPlans = loadingOwn || loadingAssigned
  const hasPlans = (ownPlans?.length ?? 0) > 0 || (assignedPlans?.length ?? 0) > 0

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-semibold">
          Welcome back{profile ? `, ${profile.display_name ?? profile.username}` : ''}
        </h1>
        <p className="text-muted-foreground text-sm">Ready to train?</p>
      </div>
      <Card className="border-primary/30 from-primary/10 via-card to-card bg-gradient-to-br">
        <CardHeader>
          <CardTitle>Start a workout</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <Link to="/app/workout/start">Start workout</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your plans</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/plans">View all</Link>
          </Button>
        </div>
        {loadingPlans && <p className="text-muted-foreground text-sm">Loading...</p>}
        {!loadingPlans && !hasPlans && (
          <p className="text-muted-foreground text-sm">
            No plans yet.{' '}
            <Link to="/app/plans/new" className="underline">
              Create one
            </Link>{' '}
            or ask your coach to assign one.
          </p>
        )}
        {ownPlans?.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            ownerLabel="You"
            startableDays={plan.plan_days}
            onClick={() => navigate(`/app/plans/${plan.id}`)}
          />
        ))}
        {assignedPlans?.map((assignment) => (
          <PlanCard
            key={assignment.plan_id}
            plan={assignment.plans}
            ownerLabel={assignment.plans.profiles?.display_name ?? assignment.plans.profiles?.username ?? 'your coach'}
            ownerId={assignment.plans.owner_id}
            startableDays={assignment.plans.plan_days}
            onClick={() => navigate(`/app/plans/${assignment.plan_id}`)}
          />
        ))}
      </div>
    </div>
  )
}
