import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Pencil, Play, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useSetExerciseVideoUrl } from '../hooks'

const schema = z.object({
  videoUrl: z.string().url('Enter a valid URL'),
})

type FormValues = z.infer<typeof schema>

export function TutorialVideoLink({
  exerciseId,
  exerciseName,
  videoUrl,
}: {
  exerciseId: string
  exerciseName: string
  videoUrl: string | null
}) {
  const [open, setOpen] = useState(false)
  const setVideoUrl = useSetExerciseVideoUrl()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { videoUrl: videoUrl ?? '' },
  })

  async function onSubmit(values: FormValues) {
    try {
      await setVideoUrl.mutateAsync({ exerciseId, videoUrl: values.videoUrl })
      toast.success('Tutorial video saved')
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save video')
    }
  }

  return (
    <div className="flex items-center gap-1">
      {videoUrl ? (
        <>
          <Button variant="link" size="sm" className="h-auto p-0" asChild>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
              <Play className="mr-1 size-3.5" />
              Tutorial
            </a>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => setOpen(true)}
          >
            <Pencil className="size-3" />
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-auto p-0"
          onClick={() => setOpen(true)}
        >
          <Plus className="mr-1 size-3.5" />
          Add tutorial
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tutorial video for {exerciseName}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtu.be/..." autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={setVideoUrl.isPending}>
                {setVideoUrl.isPending ? 'Saving...' : 'Save'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
