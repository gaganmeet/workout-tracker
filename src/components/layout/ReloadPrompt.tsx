import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh && !offlineReady) return null

  function dismiss() {
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  return (
    <div className="bg-card text-card-foreground fixed inset-x-4 bottom-20 z-50 flex items-center justify-between gap-3 rounded-lg border p-3 shadow-lg sm:inset-x-auto sm:right-4 sm:w-80">
      <p className="text-sm">
        {needRefresh ? 'A new version is available.' : 'App ready to work offline.'}
      </p>
      <div className="flex gap-2">
        {needRefresh && (
          <Button size="sm" onClick={() => void updateServiceWorker(true)}>
            Reload
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={dismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}
