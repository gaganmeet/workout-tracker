import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateGym, useGyms } from '../hooks'

const NONE_VALUE = '__none__'
const ADD_VALUE = '__add__'

export function GymSelect({
  ownerId,
  value,
  onChange,
}: {
  ownerId: string
  value: string | null
  onChange: (gymId: string | null) => void
}) {
  const { data: gyms } = useGyms(ownerId)
  const createGym = useCreateGym()
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')

  function handleValueChange(next: string) {
    if (next === ADD_VALUE) {
      setAddOpen(true)
      return
    }
    onChange(next === NONE_VALUE ? null : next)
  }

  async function handleCreate() {
    if (!newName.trim()) return
    try {
      const gym = await createGym.mutateAsync({ ownerId, name: newName })
      onChange(gym.id)
      setNewName('')
      setAddOpen(false)
      toast.success('Gym added')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add gym')
    }
  }

  return (
    <>
      <Select value={value ?? NONE_VALUE} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="No gym" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE}>No gym</SelectItem>
          {gyms?.map((gym) => (
            <SelectItem key={gym.id} value={gym.id}>
              {gym.name}
            </SelectItem>
          ))}
          <SelectItem value={ADD_VALUE}>+ Add new gym</SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a gym</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="e.g. Gold's Gym"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleCreate()
            }}
          />
          <Button onClick={() => void handleCreate()} disabled={createGym.isPending || !newName.trim()}>
            {createGym.isPending ? 'Adding...' : 'Add gym'}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
