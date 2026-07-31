import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

const DURATION_STORAGE_KEY = 'workout-tracker-rest-timer-duration'
const DEFAULT_SECONDS = 90

function playBeep() {
  try {
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioContextClass()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.2)
  } catch {
    // Audio unavailable/blocked -- vibration + toast still cover it.
  }
}

export function useRestTimer() {
  const [duration, setDurationState] = useState(() => {
    const stored = localStorage.getItem(DURATION_STORAGE_KEY)
    return stored ? Number(stored) : DEFAULT_SECONDS
  })
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [running, setRunning] = useState(false)

  // Ticks the countdown down every second while running.
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  // Fires exactly once when the countdown reaches zero while running.
  useEffect(() => {
    if (running && secondsLeft === 0) {
      setRunning(false)
      if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      playBeep()
      toast.success('Rest complete')
    }
  }, [secondsLeft, running])

  const start = useCallback(
    (seconds?: number) => {
      setSecondsLeft(seconds ?? duration)
      setRunning(true)
    },
    [duration],
  )
  const pause = useCallback(() => setRunning(false), [])
  const resume = useCallback(() => setRunning(true), [])
  const addTime = useCallback((delta: number) => setSecondsLeft((prev) => Math.max(0, prev + delta)), [])
  const skip = useCallback(() => {
    setRunning(false)
    setSecondsLeft(0)
  }, [])

  function setDuration(seconds: number) {
    setDurationState(seconds)
    localStorage.setItem(DURATION_STORAGE_KEY, String(seconds))
  }

  return { secondsLeft, running, duration, start, pause, resume, addTime, skip, setDuration }
}
