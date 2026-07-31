import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { useDeleteSession, useSessionHistory } from '../hooks'

export function WorkoutHistoryPage() {
  const { profile } = useAuth()
  const { data: sessions, isLoading } = useSessionHistory(profile?.id)
  const deleteSession = useDeleteSession()
  const navigate = useNavigate()

  async function handleDelete(event: MouseEvent, sessionId: string) {
    event.stopPropagation()
    if (!confirm('Delete this workout? This cannot be undone.')) return
    try {
      await deleteSession.mutateAsync(sessionId)
      toast.success('Workout deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete workout')
    }
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">History</h1>
      {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
      {!isLoading && sessions?.length === 0 && (
        <p className="text-muted-foreground text-sm">No workouts logged yet.</p>
      )}
      <div className="space-y-2">
        {sessions?.map((session) => (
          <Card
            key={session.id}
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => navigate(`/app/history/${session.id}`)}
          >
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{session.name ?? 'Workout'}</CardTitle>
              <div className="flex items-center gap-2">
                {!session.completed_at && <Badge variant="secondary">In progress</Badge>}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={deleteSession.isPending}
                  onClick={(event) => void handleDelete(event, session.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {format(new Date(session.started_at), 'PPP p')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
