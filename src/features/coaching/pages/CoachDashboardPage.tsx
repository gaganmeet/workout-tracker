import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/AuthContext'
import { useApprovedClients, usePendingRequests } from '../hooks'
import { ClientCard } from '../components/ClientCard'

export function CoachDashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { data: clients, isLoading: loadingClients } = useApprovedClients(profile?.id)
  const { data: pending } = usePendingRequests(profile?.id)

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-semibold">
          Welcome back{profile ? `, ${profile.display_name ?? profile.username}` : ''}
        </h1>
        <p className="text-muted-foreground text-sm">Here's how your clients are doing.</p>
      </div>

      {!!pending?.length && (
        <Card className="cursor-pointer" onClick={() => navigate('/coach/requests')}>
          <CardContent className="flex items-center justify-between py-3">
            <p className="font-medium">Pending requests</p>
            <Badge>{pending.length}</Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingClients && <p className="text-muted-foreground text-sm">Loading...</p>}
          {!loadingClients && clients?.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No linked clients yet. Share your username so clients can{' '}
              <Link to="/coach/requests" className="underline underline-offset-4">
                request to link
              </Link>
              .
            </p>
          )}
          {clients?.map((link) => (
            <ClientCard
              key={link.id}
              client={link.client}
              onClick={() => navigate(`/coach/clients/${link.client.id}`)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
