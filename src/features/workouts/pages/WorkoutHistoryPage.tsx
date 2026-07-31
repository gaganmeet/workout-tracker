import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/AuthContext'
import { useSessionHistory } from '../hooks'

export function WorkoutHistoryPage() {
  const { profile } = useAuth()
  const { data: sessions, isLoading } = useSessionHistory(profile?.id)
  const navigate = useNavigate()

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
              {!session.completed_at && <Badge variant="secondary">In progress</Badge>}
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
