import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { LinkWithClient } from '../api'

export function LinkRequestRow({
  link,
  onApprove,
  onReject,
  pending,
}: {
  link: LinkWithClient
  onApprove: () => void
  onReject: () => void
  pending?: boolean
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium">{link.client.display_name ?? link.client.username}</p>
          <p className="text-muted-foreground text-xs">@{link.client.username}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onReject} disabled={pending}>
            Decline
          </Button>
          <Button size="sm" onClick={onApprove} disabled={pending}>
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
