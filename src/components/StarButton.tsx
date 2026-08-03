import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function StarButton({
  starred,
  count,
  disabled,
  onToggle,
  size = 'default',
}: {
  starred: boolean
  count: number
  disabled?: boolean
  onToggle: () => void
  size?: 'default' | 'sm'
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
      className="gap-1.5"
    >
      <Star className={cn('size-4', starred && 'fill-yellow-400 text-yellow-500')} />
      {count}
    </Button>
  )
}
