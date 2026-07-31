import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/features/auth/AuthContext'
import { useAssignedPlans, useDuplicatePlan, useOwnPlans } from '../hooks'
import { PlanCard } from '../components/PlanCard'

export function PlansListPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { data: ownPlans, isLoading: loadingOwn } = useOwnPlans(profile?.id)
  const { data: assignedPlans, isLoading: loadingAssigned } = useAssignedPlans(profile?.id)
  const duplicatePlan = useDuplicatePlan()

  async function handleDuplicate(planId: string) {
    try {
      const newPlanId = await duplicatePlan.mutateAsync(planId)
      toast.success('Plan duplicated')
      navigate(`/app/plans/${newPlanId}/edit`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to duplicate plan')
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Plans</h1>
        <Button size="sm" asChild>
          <Link to="/app/plans/new">
            <Plus className="mr-1 size-4" />
            New plan
          </Link>
        </Button>
      </div>
      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">My Plans</TabsTrigger>
          <TabsTrigger value="assigned">From Coach</TabsTrigger>
        </TabsList>
        <TabsContent value="mine" className="space-y-2">
          {loadingOwn && <p className="text-muted-foreground text-sm">Loading...</p>}
          {!loadingOwn && ownPlans?.length === 0 && (
            <p className="text-muted-foreground text-sm">No plans yet. Create your first one.</p>
          )}
          {ownPlans?.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onClick={() => navigate(`/app/plans/${plan.id}`)}
              onDuplicate={() => void handleDuplicate(plan.id)}
              duplicating={duplicatePlan.isPending}
            />
          ))}
        </TabsContent>
        <TabsContent value="assigned" className="space-y-2">
          {loadingAssigned && <p className="text-muted-foreground text-sm">Loading...</p>}
          {!loadingAssigned && assignedPlans?.length === 0 && (
            <p className="text-muted-foreground text-sm">No plans assigned by a coach yet.</p>
          )}
          {assignedPlans?.map((assignment) => (
            <PlanCard
              key={assignment.plan_id}
              plan={assignment.plans}
              onClick={() => navigate(`/app/plans/${assignment.plan_id}`)}
              onDuplicate={() => void handleDuplicate(assignment.plan_id)}
              duplicating={duplicatePlan.isPending}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
