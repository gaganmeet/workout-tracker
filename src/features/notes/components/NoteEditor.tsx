import { useState } from 'react'
import { toast } from 'sonner'
import { MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useCreateNote } from '../hooks'

export function NoteEditor({
  coachId,
  clientId,
  exerciseId,
  planDayExerciseId,
  workoutExerciseId,
}: {
  coachId: string
  clientId: string
  exerciseId: string
  planDayExerciseId?: string
  workoutExerciseId?: string
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const createNote = useCreateNote()

  async function handleSave() {
    if (!text.trim()) return
    try {
      await createNote.mutateAsync({
        coachId,
        clientId,
        exerciseId,
        planDayExerciseId,
        workoutExerciseId,
        note: text.trim(),
      })
      toast.success('Note added')
      setText('')
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add note')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="size-7">
          <MessageSquarePlus className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a note</DialogTitle>
        </DialogHeader>
        <Textarea
          autoFocus
          placeholder="e.g. Keep elbows tucked, add 2.5kg next time"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <Button onClick={() => void handleSave()} disabled={createNote.isPending || !text.trim()}>
          {createNote.isPending ? 'Saving...' : 'Save note'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
