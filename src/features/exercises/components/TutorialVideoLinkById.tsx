import { useExercise } from '../hooks'
import { TutorialVideoLink } from './TutorialVideoLink'

// Fetches the exercise first -- for contexts (like a draft plan being built)
// that only have an exercise id/name on hand, not the full row with
// video_url already loaded.
export function TutorialVideoLinkById({
  exerciseId,
  exerciseName,
}: {
  exerciseId: string
  exerciseName: string
}) {
  const { data: exercise } = useExercise(exerciseId)

  return (
    <TutorialVideoLink
      exerciseId={exerciseId}
      exerciseName={exerciseName}
      videoUrl={exercise?.video_url ?? null}
    />
  )
}
