import { useState } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/AuthContext'
import { useCancelLink, useCoachSearch, useMyLinks, useSendLinkRequest } from '../hooks'

const statusLabel: Record<string, string> = {
  pending: 'Request pending',
  approved: 'Connected',
  rejected: 'Not connected',
  revoked: 'Not connected',
}

export function FindCoachPage() {
  const { profile } = useAuth()
  const [query, setQuery] = useState('')
  const { data: results, isLoading } = useCoachSearch(query)
  const { data: myLinks } = useMyLinks(profile?.id)
  const sendRequest = useSendLinkRequest()
  const cancelLink = useCancelLink()

  function linkFor(coachId: string) {
    return myLinks?.find((link) => link.coach_id === coachId)
  }

  async function handleRequest(coachId: string) {
    if (!profile) return
    try {
      await sendRequest.mutateAsync({ coachId, clientId: profile.id })
      toast.success('Request sent')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send request')
    }
  }

  async function handleCancel(linkId: string) {
    try {
      await cancelLink.mutateAsync(linkId)
      toast.success('Request cancelled')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel')
    }
  }

  const activeLinks = myLinks?.filter((link) => link.status === 'approved' || link.status === 'pending')

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Find a coach</h1>

      {activeLinks && activeLinks.length > 0 && (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium">Your coaches</p>
          {activeLinks.map((link) => (
            <Card key={link.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{link.coach.display_name ?? link.coach.username}</p>
                  <p className="text-muted-foreground text-xs">@{link.coach.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={link.status === 'approved' ? 'default' : 'secondary'}>
                    {statusLabel[link.status]}
                  </Badge>
                  {link.status === 'pending' && (
                    <Button size="sm" variant="outline" onClick={() => void handleCancel(link.id)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search by username or name..."
          className="pl-8"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-muted-foreground text-sm">Searching...</p>}
        {query && !isLoading && results?.length === 0 && (
          <p className="text-muted-foreground text-sm">No coaches found.</p>
        )}
        {results?.map((coach) => {
          const link = linkFor(coach.id)
          return (
            <Card key={coach.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{coach.display_name ?? coach.username}</CardTitle>
                {!link && (
                  <Button size="sm" onClick={() => void handleRequest(coach.id)} disabled={sendRequest.isPending}>
                    Request
                  </Button>
                )}
                {link && <Badge variant="secondary">{statusLabel[link.status]}</Badge>}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">@{coach.username}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
