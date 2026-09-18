import { createBrowserRouter, Navigate } from 'react-router-dom'
import { GITHUB_PAGES_BASENAME } from '../utils/githubPages'
import StarLayout from '../components/layout/Layout'
import StarHomePage from '../pages/Home'
// Demo pages are code-split per route so the landing page only ships the shell.
// `StarLayout` provides the Suspense boundary for these children.
import {
  StarButtonDemoPage,
  StarCalendarDemoPage,
  StarCardDemoPage,
  StarComponentsPage,
  StarDatePickerDemoPage,
  StarDialogDemoPage,
  StarEmptyStateDemoPage,
  StarGapBorderDemoPage,
  StarGuidePage,
  StarLoadingDemoPage,
  StarMessageDemoPage,
  StarPixelButtonDemoPage,
  StarPopupDemoPage,
  StarProgressDemoPage,
  StarRatingDemoPage,
  StarTabDemoPage,
  StarTitleDemoPage,
  StarTypewriterDemoPage,
} from './lazyPages'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <StarLayout />,
      children: [
        { index: true, element: <StarHomePage /> },
        { path: 'guide', element: <StarGuidePage /> },
        { path: 'components', element: <StarComponentsPage /> },
        { path: 'components/button', element: <StarButtonDemoPage /> },
        { path: 'components/calendar', element: <StarCalendarDemoPage /> },
        { path: 'components/title', element: <StarTitleDemoPage /> },
        { path: 'components/card', element: <StarCardDemoPage /> },
        { path: 'components/date-picker', element: <StarDatePickerDemoPage /> },
        { path: 'components/dialog', element: <StarDialogDemoPage /> },
        { path: 'components/empty-state', element: <StarEmptyStateDemoPage /> },
        { path: 'components/popup', element: <StarPopupDemoPage /> },
        { path: 'components/typewriter', element: <StarTypewriterDemoPage /> },
        { path: 'components/loading', element: <StarLoadingDemoPage /> },
        { path: 'components/message', element: <StarMessageDemoPage /> },
        { path: 'components/tab', element: <StarTabDemoPage /> },
        { path: 'components/gap-border', element: <StarGapBorderDemoPage /> },
        { path: 'components/pixel-button', element: <StarPixelButtonDemoPage /> },
        { path: 'components/rating', element: <StarRatingDemoPage /> },
        { path: 'components/progress', element: <StarProgressDemoPage /> },
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
