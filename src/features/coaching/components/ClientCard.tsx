import { Card, CardContent } from '@/components/ui/card'
import type { Profile } from '@/types/domain'

export function ClientCard({ client, onClick }: { client: Profile; onClick?: () => void }) {
  return (
    <Card
      className={onClick ? 'cursor-pointer transition-colors hover:bg-accent' : undefined}
      onClick={onClick}
    >
      <CardContent className="py-3">
        <p className="font-medium">{client.display_name ?? client.username}</p>
        <p className="text-muted-foreground text-xs">@{client.username}</p>
      </CardContent>
    </Card>
  )
}
