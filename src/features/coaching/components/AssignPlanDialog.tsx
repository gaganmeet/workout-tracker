import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/features/auth/AuthContext'
import { useOwnPlans } from '@/features/plans/hooks'
import { useAssignPlanToClient } from '../hooks'

export function AssignPlanDialog({ clientId }: { clientId: string }) {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)
  const { data: templates, isLoading } = useOwnPlans(profile?.id)
  const assignPlan = useAssignPlanToClient()

  async function handleAssign(planId: string) {
    if (!profile) return
    try {
      await assignPlan.mutateAsync({ planId, clientId, assignedBy: profile.id })
      toast.success('Plan assigned')
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to assign plan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Assign existing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a template</DialogTitle>
        </DialogHeader>
        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
          {!isLoading && templates?.length === 0 && (
            <p className="text-muted-foreground text-sm">
              You don't have any templates yet. Create one from Plan Templates.
            </p>
          )}
          {templates?.map((plan) => (
            <Button
              key={plan.id}
              variant="ghost"
              className="h-auto w-full justify-start px-3 py-2"
              disabled={assignPlan.isPending}
              onClick={() => void handleAssign(plan.id)}
            >
              <div className="text-left">
                <p className="font-medium">{plan.name}</p>
                {plan.description && (
                  <p className="text-muted-foreground text-xs">{plan.description}</p>
                )}
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
