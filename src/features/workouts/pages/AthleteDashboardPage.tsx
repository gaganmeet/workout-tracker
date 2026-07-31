import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { Link } from 'react-router-dom'

export function AthleteDashboardPage() {
  const { profile } = useAuth()

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-semibold">Welcome back{profile ? `, ${profile.display_name ?? profile.username}` : ''}</h1>
        <p className="text-muted-foreground text-sm">Ready to train?</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Start a workout</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/app/workout/start">Start workout</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
