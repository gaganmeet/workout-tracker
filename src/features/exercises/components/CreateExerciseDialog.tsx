import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CreateExerciseForm } from './CreateExerciseForm'

export function CreateExerciseDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add custom exercise</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add custom exercise</DialogTitle>
        </DialogHeader>
        <CreateExerciseForm onCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
