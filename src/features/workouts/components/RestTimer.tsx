import { Pause, Play, SkipForward, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { useRestTimer } from '../useRestTimer'

const DURATION_PRESETS = [30, 60, 90, 120, 180]

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Idle control: pick a default rest duration and start it manually. Lives
// inline in the page flow (not fixed), since it's not urgent until running.
export function RestTimerIdleControl({ timer }: { timer: ReturnType<typeof useRestTimer> }) {
  return (
    <div className="flex items-center gap-1">
      <Button type="button" variant="outline" size="sm" onClick={() => timer.start()}>
        <Timer className="mr-1 size-4" />
        Start rest ({formatTime(timer.duration)})
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm">
            Change
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {DURATION_PRESETS.map((seconds) => (
            <DropdownMenuItem key={seconds} onClick={() => timer.setDuration(seconds)}>
              {formatTime(seconds)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Running/paused bar: fixed above the bottom nav so it stays visible while
// scrolling through exercises.
export function RestTimerBar({ timer }: { timer: ReturnType<typeof useRestTimer> }) {
  if (timer.secondsLeft <= 0) return null

  return (
    <div className="bg-card text-card-foreground fixed inset-x-0 bottom-16 z-10 border-t shadow-lg">
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-3 p-3">
        <span className="min-w-14 text-center text-lg font-semibold tabular-nums">{formatTime(timer.secondsLeft)}</span>
        <Button type="button" variant="outline" size="sm" onClick={() => timer.addTime(-15)}>
          -15s
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => timer.addTime(15)}>
          +15s
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => (timer.running ? timer.pause() : timer.resume())}
        >
          {timer.running ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={timer.skip}>
          <SkipForward className="size-4" />
        </Button>
      </div>
    </div>
  )
}
