import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppProviders } from '@/app/providers'
import { AuthProvider, useAuth } from '@/features/auth/AuthContext'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { RequireRole } from '@/features/auth/RequireRole'
import { AppShell } from '@/components/layout/AppShell'
import { ReloadPrompt } from '@/components/layout/ReloadPrompt'
import { OfflineBanner } from '@/components/layout/OfflineBanner'
import { ComingSoonPage } from '@/pages/ComingSoonPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

const SignInPage = lazy(() => import('@/features/auth/pages/SignInPage').then((m) => ({ default: m.SignInPage })))
const SignUpPage = lazy(() => import('@/features/auth/pages/SignUpPage').then((m) => ({ default: m.SignUpPage })))
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)
const AthleteDashboardPage = lazy(() =>
  import('@/features/workouts/pages/AthleteDashboardPage').then((m) => ({ default: m.AthleteDashboardPage })),
)
const CoachDashboardPage = lazy(() =>
  import('@/features/coaching/pages/CoachDashboardPage').then((m) => ({ default: m.CoachDashboardPage })),
)
const ExerciseLibraryPage = lazy(() =>
  import('@/features/exercises/pages/ExerciseLibraryPage').then((m) => ({ default: m.ExerciseLibraryPage })),
)
const ExerciseDetailPage = lazy(() =>
  import('@/features/exercises/pages/ExerciseDetailPage').then((m) => ({ default: m.ExerciseDetailPage })),
)
const PlansListPage = lazy(() =>
  import('@/features/plans/pages/PlansListPage').then((m) => ({ default: m.PlansListPage })),
)
const PlanEditorPage = lazy(() =>
  import('@/features/plans/pages/PlanEditorPage').then((m) => ({ default: m.PlanEditorPage })),
)
const PlanDetailPage = lazy(() =>
  import('@/features/plans/pages/PlanDetailPage').then((m) => ({ default: m.PlanDetailPage })),
)
const StartWorkoutPage = lazy(() =>
  import('@/features/workouts/pages/StartWorkoutPage').then((m) => ({ default: m.StartWorkoutPage })),
)
const ActiveWorkoutPage = lazy(() =>
  import('@/features/workouts/pages/ActiveWorkoutPage').then((m) => ({ default: m.ActiveWorkoutPage })),
)
const WorkoutHistoryPage = lazy(() =>
  import('@/features/workouts/pages/WorkoutHistoryPage').then((m) => ({ default: m.WorkoutHistoryPage })),
)
const WorkoutDetailPage = lazy(() =>
  import('@/features/workouts/pages/WorkoutDetailPage').then((m) => ({ default: m.WorkoutDetailPage })),
)
const ProgressPage = lazy(() =>
  import('@/features/progress/pages/ProgressPage').then((m) => ({ default: m.ProgressPage })),
)
const FindCoachPage = lazy(() =>
  import('@/features/coaching/pages/FindCoachPage').then((m) => ({ default: m.FindCoachPage })),
)
const PendingRequestsPage = lazy(() =>
  import('@/features/coaching/pages/PendingRequestsPage').then((m) => ({ default: m.PendingRequestsPage })),
)
const ClientDetailPage = lazy(() =>
  import('@/features/coaching/pages/ClientDetailPage').then((m) => ({ default: m.ClientDetailPage })),
)
const CoachPlansPage = lazy(() =>
  import('@/features/coaching/pages/CoachPlansPage').then((m) => ({ default: m.CoachPlansPage })),
)
const NewClientPlanPage = lazy(() =>
  import('@/features/coaching/pages/NewClientPlanPage').then((m) => ({ default: m.NewClientPlanPage })),
)

function PageFallback() {
  return <p className="text-muted-foreground p-4 text-sm">Loading...</p>
}

function AthleteLayout() {
  return (
    <RequireRole role="athlete">
      <AppShell role="athlete">
        <Outlet />
      </AppShell>
    </RequireRole>
  )
}

function CoachLayout() {
  return (
    <RequireRole role="coach">
      <AppShell role="coach">
        <Outlet />
      </AppShell>
    </RequireRole>
  )
}

function RootRedirect() {
  const { session, profile, loading } = useAuth()

  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return null

  return <Navigate to={profile.role === 'coach' ? '/coach/dashboard' : '/app/dashboard'} replace />
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<RequireAuth><AthleteLayout /></RequireAuth>}>
          <Route path="/app/dashboard" element={<AthleteDashboardPage />} />
          <Route path="/app/plans" element={<PlansListPage />} />
          <Route path="/app/plans/new" element={<PlanEditorPage />} />
          <Route path="/app/plans/:planId" element={<PlanDetailPage />} />
          <Route path="/app/plans/:planId/edit" element={<PlanEditorPage />} />
          <Route path="/app/workout/start" element={<StartWorkoutPage />} />
          <Route path="/app/workout/active/:sessionId" element={<ActiveWorkoutPage />} />
          <Route path="/app/history" element={<WorkoutHistoryPage />} />
          <Route path="/app/history/:sessionId" element={<WorkoutDetailPage />} />
          <Route path="/app/exercises" element={<ExerciseLibraryPage />} />
          <Route path="/app/exercises/:exerciseId" element={<ExerciseDetailPage />} />
          <Route path="/app/progress" element={<ProgressPage />} />
          <Route path="/app/coach" element={<FindCoachPage />} />
          <Route path="/app/settings" element={<ComingSoonPage title="Settings" />} />
        </Route>

        <Route element={<RequireAuth><CoachLayout /></RequireAuth>}>
          <Route path="/coach/dashboard" element={<CoachDashboardPage />} />
          <Route path="/coach/requests" element={<PendingRequestsPage />} />
          <Route path="/coach/clients/:clientId" element={<ClientDetailPage />} />
          <Route path="/coach/clients/:clientId/sessions/:sessionId" element={<WorkoutDetailPage />} />
          <Route path="/coach/clients/:clientId/plans/new" element={<NewClientPlanPage />} />
          <Route
            path="/coach/clients/:clientId/plans/:planId"
            element={<PlanDetailPage basePath="/coach/plans" />}
          />
          <Route path="/coach/plans" element={<CoachPlansPage />} />
          <Route path="/coach/plans/new" element={<PlanEditorPage />} />
          <Route path="/coach/plans/:planId" element={<PlanDetailPage basePath="/coach/plans" />} />
          <Route path="/coach/plans/:planId/edit" element={<PlanEditorPage />} />
          <Route path="/coach/settings" element={<ComingSoonPage title="Settings" />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AuthProvider>
          <OfflineBanner />
          <AppRoutes />
          <ReloadPrompt />
        </AuthProvider>
      </BrowserRouter>
    </AppProviders>
  )
}

export default App
