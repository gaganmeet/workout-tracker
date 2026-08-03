import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StarButton } from '@/components/StarButton'
import { useAuth } from '@/features/auth/AuthContext'
import { PlanCard } from '@/features/plans/components/PlanCard'
import { usePublicPlansByOwner } from '@/features/plans/hooks'
import { useActivity, useProfile, useProfileStars, useToggleProfileStar, useUpdateProfileBio } from '../hooks'
import { AvatarUpload } from '../components/AvatarUpload'
import { ActivityHeatmap } from '../components/ActivityHeatmap'

function BioEditor({ userId, initialBio }: { userId: string; initialBio: string | null }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialBio ?? '')
  const updateBio = useUpdateProfileBio(userId)

  async function handleSave() {
    try {
      await updateBio.mutateAsync(value)
      setEditing(false)
      toast.success('Bio updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update bio')
    }
  }

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-2">
        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
          {initialBio || 'No bio yet.'}
        </p>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Tell people a bit about your training..."
        className="min-h-20"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => void handleSave()} disabled={updateBio.isPending}>
          {updateBio.isPending ? 'Saving...' : 'Save'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { profile: viewer } = useAuth()
  const navigate = useNavigate()
  const { data: profile, isLoading } = useProfile(userId)
  const { data: activity } = useActivity(userId)
  const { data: publicPlans } = usePublicPlansByOwner(userId)
  const { data: stars } = useProfileStars(userId)
  const toggleStar = useToggleProfileStar(userId!)

  if (isLoading) {
    return <p className="text-muted-foreground p-4 text-sm">Loading...</p>
  }

  if (!profile) {
    return <p className="text-muted-foreground p-4 text-sm">Profile not found.</p>
  }

  const isOwnProfile = userId === viewer?.id
  const isStarred = !!viewer && !!stars?.some((s) => s.user_id === viewer.id)
  const basePath = viewer?.role === 'coach' ? '/coach/plans' : '/app/plans'

  async function handleToggleStar() {
    if (!viewer) return
    try {
      await toggleStar.mutateAsync({ userId: viewer.id, isStarred })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update star')
    }
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start justify-between gap-2">
            {isOwnProfile ? (
              <AvatarUpload
                userId={profile.id}
                avatarUrl={profile.avatar_url}
                displayName={profile.display_name}
              />
            ) : (
              <div className="flex items-center gap-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name ?? profile.username}
                    className="size-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="bg-muted text-muted-foreground flex size-20 items-center justify-center rounded-full text-xl">
                    {(profile.display_name ?? profile.username).slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            )}
            {!isOwnProfile && (
              <StarButton
                starred={isStarred}
                count={stars?.length ?? 0}
                disabled={toggleStar.isPending || !viewer}
                onToggle={() => void handleToggleStar()}
              />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{profile.display_name ?? profile.username}</h1>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>@{profile.username}</span>
              <Badge variant="outline" className="capitalize">
                {profile.role}
              </Badge>
              {isOwnProfile && (
                <span>
                  {stars?.length ?? 0} star{stars?.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </div>
          <BioEditor userId={profile.id} initialBio={profile.bio} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={activity ?? []} />
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Public plans</h2>
        {!publicPlans?.length && (
          <p className="text-muted-foreground text-sm">No public plans yet.</p>
        )}
        {publicPlans?.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onClick={() => navigate(`${basePath}/${plan.id}`)}
          />
        ))}
      </div>
    </div>
  )
}
