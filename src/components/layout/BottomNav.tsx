import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Dumbbell, History, TrendingUp, Users, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}

const athleteItems: NavItem[] = [
  { to: '/app/dashboard', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/app/plans', label: 'Plans', icon: ClipboardList },
  { to: '/app/workout/start', label: 'Workout', icon: Dumbbell },
  { to: '/app/history', label: 'History', icon: History },
  { to: '/app/progress', label: 'Progress', icon: TrendingUp },
]

const coachItems: NavItem[] = [
  { to: '/coach/dashboard', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/coach/requests', label: 'Requests', icon: Inbox },
  { to: '/coach/plans', label: 'Templates', icon: ClipboardList },
  { to: '/coach/dashboard', label: 'Clients', icon: Users },
]

export function BottomNav({ role }: { role: 'athlete' | 'coach' }) {
  const items = role === 'coach' ? coachItems : athleteItems

  return (
    <nav className="border-border bg-background sticky bottom-0 z-10 border-t">
      <div className="mx-auto flex h-16 max-w-2xl items-stretch">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full transition-colors',
                    isActive && 'bg-primary/15',
                  )}
                >
                  <item.icon className="size-5" />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
