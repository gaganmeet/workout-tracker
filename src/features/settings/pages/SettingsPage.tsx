import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuth } from '@/features/auth/AuthContext'
import { useCreateGym, useDeleteGym, useGyms } from '@/features/gyms/hooks'
import { useDeleteOwnAccount, useUpdatePassword, useUpdateWeightUnit } from '../hooks'
import type { WeightUnit } from '@/types/domain'

const passwordSchema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type PasswordValues = z.infer<typeof passwordSchema>

function WeightUnitSection() {
  const { profile, refreshProfile } = useAuth()
  const updateWeightUnit = useUpdateWeightUnit()

  async function handleChange(value: string) {
    if (!profile) return
    try {
      await updateWeightUnit.mutateAsync({ profileId: profile.id, weightUnit: value as WeightUnit })
      await refreshProfile()
      toast.success('Weight unit updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update weight unit')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight unit</CardTitle>
        <CardDescription>Used across plans, logging, and progress charts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={profile?.weight_unit} onValueChange={handleChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kg">kg</SelectItem>
            <SelectItem value="lb">lbs</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}

function GymsSection() {
  const { profile } = useAuth()
  const { data: gyms } = useGyms(profile?.id)
  const createGym = useCreateGym()
  const deleteGym = useDeleteGym(profile?.id)
  const [newName, setNewName] = useState('')

  async function handleAdd() {
    if (!profile || !newName.trim()) return
    try {
      await createGym.mutateAsync({ ownerId: profile.id, name: newName })
      setNewName('')
      toast.success('Gym added')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add gym')
    }
  }

  async function handleDelete(gymId: string) {
    if (!confirm('Remove this gym? Past workouts tagged with it will just show no gym.')) return
    try {
      await deleteGym.mutateAsync(gymId)
      toast.success('Gym removed')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove gym')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gyms</CardTitle>
        <CardDescription>
          Tag a workout with the gym you're at so weight placeholders and progress can account for
          different machines/plates across locations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {gyms?.map((gym) => (
          <div key={gym.id} className="flex items-center justify-between gap-2">
            <span className="text-sm">{gym.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={deleteGym.isPending}
              onClick={() => void handleDelete(gym.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {!gyms?.length && <p className="text-muted-foreground text-sm">No gyms added yet.</p>}
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="e.g. Gold's Gym"
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleAdd()
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={createGym.isPending || !newName.trim()}
            onClick={() => void handleAdd()}
          >
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ChangePasswordSection() {
  const [submitting, setSubmitting] = useState(false)
  const updatePassword = useUpdatePassword()

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onSubmit(values: PasswordValues) {
    setSubmitting(true)
    try {
      await updatePassword.mutateAsync(values.password)
      toast.success('Password updated')
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function DeleteAccountSection() {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const deleteAccount = useDeleteOwnAccount()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleDelete() {
    try {
      await deleteAccount.mutateAsync()
      await signOut()
      toast.success('Account deleted')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account')
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
        <CardDescription>
          Permanently deletes your account and everything tied to it: plans, workout history, custom
          exercises, coach links, and notes. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete my account
        </Button>
      </CardContent>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setConfirmText('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            This permanently deletes your account and all of its data. Type{' '}
            <span className="text-foreground font-semibold">DELETE</span> to confirm.
          </p>
          <Input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="DELETE"
            autoFocus
          />
          <Button
            variant="destructive"
            disabled={confirmText !== 'DELETE' || deleteAccount.isPending}
            onClick={() => void handleDelete()}
          >
            {deleteAccount.isPending ? 'Deleting...' : 'Permanently delete my account'}
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export function SettingsPage() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <WeightUnitSection />
      <GymsSection />
      <ChangePasswordSection />
      <DeleteAccountSection />
    </div>
  )
}
