import type { ReactNode } from 'react'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from './queryClient'

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'workout-tracker-query-cache',
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      {children}
      <Toaster richColors position="top-center" />
    </PersistQueryClientProvider>
  )
}
