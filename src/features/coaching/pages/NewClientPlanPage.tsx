import { useParams } from 'react-router-dom'
import { PlanEditorPage } from '@/features/plans/pages/PlanEditorPage'

export function NewClientPlanPage() {
  const { clientId } = useParams<{ clientId: string }>()
  return <PlanEditorPage assignClientId={clientId} />
}
