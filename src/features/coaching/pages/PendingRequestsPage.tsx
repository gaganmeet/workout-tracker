import { toast } from 'sonner'
import { useAuth } from '@/features/auth/AuthContext'
import { usePendingRequests, useRespondToRequest } from '../hooks'
import { LinkRequestRow } from '../components/LinkRequestRow'

export function PendingRequestsPage() {
  const { profile } = useAuth()
  const { data: requests, isLoading } = usePendingRequests(profile?.id)
  const respond = useRespondToRequest()

  async function handleRespond(linkId: string, status: 'approved' | 'rejected') {
    try {
      await respond.mutateAsync({ linkId, status })
      toast.success(status === 'approved' ? 'Client approved' : 'Request declined')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update request')
    }
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Requests</h1>
      {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
      {!isLoading && requests?.length === 0 && (
        <p className="text-muted-foreground text-sm">No pending requests.</p>
      )}
      <div className="space-y-2">
        {requests?.map((link) => (
          <LinkRequestRow
            key={link.id}
            link={link}
            pending={respond.isPending}
            onApprove={() => void handleRespond(link.id, 'approved')}
            onReject={() => void handleRespond(link.id, 'rejected')}
          />
        ))}
      </div>
    </div>
  )
}
