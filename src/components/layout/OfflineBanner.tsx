import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()

  if (online) return null

  return (
    <div className="bg-destructive text-destructive-foreground flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium">
      <WifiOff className="size-3.5" />
      You're offline — changes won't save until you're back online.
    </div>
  )
}
