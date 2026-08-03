import { useRef } from 'react'
import { toast } from 'sonner'
import { Camera, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useRemoveAvatar, useUploadAvatar } from '../hooks'

function initials(name: string | null | undefined) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function AvatarUpload({
  userId,
  avatarUrl,
  displayName,
}: {
  userId: string
  avatarUrl: string | null
  displayName: string | null
}) {
  const uploadAvatar = useUploadAvatar(userId)
  const removeAvatar = useRemoveAvatar(userId)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    try {
      await uploadAvatar.mutateAsync(file)
      toast.success('Profile picture updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    }
  }

  async function handleRemove() {
    try {
      await removeAvatar.mutateAsync()
      toast.success('Profile picture removed')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove image')
    }
  }

  const busy = uploadAvatar.isPending || removeAvatar.isPending

  return (
    <div className="flex items-center gap-4">
      <Avatar size="lg" className="size-20">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName ?? 'Profile picture'} />}
        <AvatarFallback className="text-xl">{initials(displayName)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void handleFileChange(event)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="mr-1 size-4" />
          {uploadAvatar.isPending ? 'Uploading...' : avatarUrl ? 'Change photo' : 'Add photo'}
        </Button>
        {avatarUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => void handleRemove()}
          >
            <X className="mr-1 size-4" />
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}
