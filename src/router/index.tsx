import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { GITHUB_PAGES_BASENAME } from '../utils/githubPages'
import StarLayout from '../components/layout/Layout'

const StarHomePage = lazy(() => import('../pages/Home'))
const StarGuidePage = lazy(() => import('../pages/Guide'))
const StarComponentsPage = lazy(() => import('../pages/Components'))
const StarButtonDemoPage = lazy(() => import('../pages/ButtonDemo'))
const StarCalendarDemoPage = lazy(() => import('../pages/CalendarDemo'))
const StarCardDemoPage = lazy(() => import('../pages/CardDemo'))
const StarDatePickerDemoPage = lazy(() => import('../pages/DatePickerDemo'))
const StarDialogDemoPage = lazy(() => import('../pages/DialogDemo'))
const StarEmptyStateDemoPage = lazy(() => import('../pages/EmptyStateDemo'))
const StarPopupDemoPage = lazy(() => import('../pages/PopupDemo'))
const StarTypewriterDemoPage = lazy(() => import('../pages/TypewriterDemo'))
const StarMessageDemoPage = lazy(() => import('../pages/MessageDemo'))
const StarTitleDemoPage = lazy(() => import('../pages/TitleDemo'))
const StarLoadingDemoPage = lazy(() => import('../pages/LoadingDemo'))
const StarTabDemoPage = lazy(() => import('../pages/TabDemo'))
const StarStepBtnDemoPage = lazy(() => import('../pages/StepBtnDemo'))

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: '#6d3a10', fontFamily: 'Stardew, sans-serif' }}>Loading...</div>}>
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <StarLayout />,
      children: [
        { index: true, element: <LazyPage><StarHomePage /></LazyPage> },
        { path: 'guide', element: <LazyPage><StarGuidePage /></LazyPage> },
        { path: 'components', element: <LazyPage><StarComponentsPage /></LazyPage> },
        { path: 'components/button', element: <LazyPage><StarButtonDemoPage /></LazyPage> },
        { path: 'components/calendar', element: <LazyPage><StarCalendarDemoPage /></LazyPage> },
        { path: 'components/title', element: <LazyPage><StarTitleDemoPage /></LazyPage> },
        { path: 'components/card', element: <LazyPage><StarCardDemoPage /></LazyPage> },
        { path: 'components/date-picker', element: <LazyPage><StarDatePickerDemoPage /></LazyPage> },
        { path: 'components/dialog', element: <LazyPage><StarDialogDemoPage /></LazyPage> },
        { path: 'components/empty-state', element: <LazyPage><StarEmptyStateDemoPage /></LazyPage> },
        { path: 'components/popup', element: <LazyPage><StarPopupDemoPage /></LazyPage> },
        { path: 'components/typewriter', element: <LazyPage><StarTypewriterDemoPage /></LazyPage> },
        { path: 'components/loading', element: <LazyPage><StarLoadingDemoPage /></LazyPage> },
        { path: 'components/message', element: <LazyPage><StarMessageDemoPage /></LazyPage> },
        { path: 'components/tab', element: <LazyPage><StarTabDemoPage /></LazyPage> },
        { path: 'components/step-btn', element: <LazyPage><StarStepBtnDemoPage /></LazyPage> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ],
  {
    basename: GITHUB_PAGES_BASENAME,
  },
)
