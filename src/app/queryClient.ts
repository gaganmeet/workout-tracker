import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Dedupe by the feature-level query key segment so a page firing
      // several parallel queries that all fail (e.g. while offline) shows
      // one toast, not a stack of identical ones.
      const toastId = String(query.queryKey[0] ?? 'query-error')
      toast.error(error instanceof Error ? error.message : 'Failed to load data', { id: toastId })
    },
  }),
})
