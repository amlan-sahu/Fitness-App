import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { AppLayout } from '../layouts/AppLayout'
import { AuthPage } from '../pages/AuthPage'
import { AssistantPage } from '../pages/AssistantPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ExerciseLibraryPage } from '../pages/ExerciseLibraryPage'
import { GoalsPage } from '../pages/GoalsPage'
import { ProfilePage } from '../pages/ProfilePage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { NewWorkoutPage } from '../pages/NewWorkoutPage'
import { NutritionPage } from '../pages/NutritionPage'
import { SupplementsPage } from '../pages/SupplementsPage'
import { WorkoutHistoryPage } from '../pages/WorkoutHistoryPage'
import { WorkoutDetailPage } from '../pages/WorkoutDetailPage'

const pageContent = {
  home: {
    eyebrow: 'FitTrack AI',
    title: 'A clearer way to build your strongest self.',
    description: 'Your fitness workspace is ready. Start by exploring the dashboard and make this space your own.',
  },
  dashboard: {
    eyebrow: 'Dashboard',
    title: 'Your daily picture, at a glance.',
    description: 'This is where your workouts, goals, and progress will come together in one calm, focused view.',
  },
  workouts: {
    eyebrow: 'Training',
    title: 'Workouts that move you forward.',
    description: 'Your workout library and training history will live here in a future phase.',
  },
  nutrition: {
    eyebrow: 'Nutrition',
    title: 'Fuel the work.',
    description: 'Nutrition tracking and meal planning will be added in a future phase.',
  },
  progress: {
    eyebrow: 'Progress',
    title: 'Small steps. Visible change.',
    description: 'Charts and progress milestones will appear here once tracking is connected.',
  },
  goals: {
    eyebrow: 'Goals',
    title: 'Give your effort a direction.',
    description: 'Goal setting and milestones will be available in a future phase.',
  },
  supplements: {
    eyebrow: 'Supplements',
    title: 'Keep your routine in view.',
    description: 'Supplement tracking will be added in a future phase.',
  },
  profile: {
    eyebrow: 'Profile',
    title: 'Make FitTrack feel like yours.',
    description: 'Profile preferences and fitness details will be available in a future phase.',
  },
}

function Page({ content }) {
  return <PlaceholderPage {...content} />
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
          <Route path="/" element={<Page content={pageContent.home} />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/workouts" element={<WorkoutHistoryPage />} />
          <Route path="/workouts/new" element={<NewWorkoutPage />} />
          <Route path="/workouts/:workoutId" element={<WorkoutDetailPage />} />
          <Route path="/exercises" element={<ExerciseLibraryPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/progress" element={<Page content={pageContent.progress} />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/supplements" element={<SupplementsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
