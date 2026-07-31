import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/AuthContext'

function initials(name: string | null | undefined) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function TopBar() {
  const { profile, signOut } = useAuth()
  const settingsPath = profile?.role === 'coach' ? '/coach/settings' : '/app/settings'
  const isAthlete = profile?.role !== 'coach'

  return (
    <header className="border-border bg-background sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4">
      <Link to={profile?.role === 'coach' ? '/coach/dashboard' : '/app/dashboard'} className="font-semibold">
        Workout Tracker
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="size-8">
              <AvatarFallback>{initials(profile?.display_name ?? profile?.username)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isAthlete && (
            <DropdownMenuItem asChild>
              <Link to="/app/exercises">Exercises</Link>
            </DropdownMenuItem>
          )}
          {isAthlete && (
            <DropdownMenuItem asChild>
              <Link to="/app/coach">Find a coach</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to={settingsPath}>Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void signOut()}>
            <LogOut className="mr-2 size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
