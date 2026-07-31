import type { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

export function AppShell({ role, children }: { role: 'athlete' | 'coach'; children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <TopBar />
      <main className="flex-1 pb-4">{children}</main>
      <BottomNav role={role} />
    </div>
  )
}
