import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ExerciseNote } from '@/types/domain'

export function NoteList({
  notes,
  canDelete,
  onDelete,
}: {
  notes: ExerciseNote[]
  canDelete?: boolean
  onDelete?: (noteId: string) => void
}) {
  if (notes.length === 0) {
    return <p className="text-muted-foreground text-sm">No notes yet.</p>
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <div key={note.id} className="bg-muted/50 rounded-md p-2 text-sm">
          <div className="flex items-start justify-between gap-2">
            <p>{note.note}</p>
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 shrink-0"
                onClick={() => onDelete?.(note.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {format(new Date(note.created_at), 'PP')}
          </p>
        </div>
      ))}
    </div>
  )
}
