import { createBrowserRouter, Navigate } from 'react-router-dom'
import { GITHUB_PAGES_BASENAME } from '../utils/githubPages'
import StarLayout from '../components/layout/Layout'
import StarHomePage from '../pages/Home'
import StarGuidePage from '../pages/Guide'
import StarComponentsPage from '../pages/Components'
import StarButtonDemoPage from '../pages/ButtonDemo'
import StarCalendarDemoPage from '../pages/CalendarDemo'
import StarCardDemoPage from '../pages/CardDemo'
import StarDatePickerDemoPage from '../pages/DatePickerDemo'
import StarDialogDemoPage from '../pages/DialogDemo'
import StarEmptyStateDemoPage from '../pages/EmptyStateDemo'
import StarPopupDemoPage from '../pages/PopupDemo'
import StarTypewriterDemoPage from '../pages/TypewriterDemo'
import StarMessageDemoPage from '../pages/MessageDemo'
import StarTitleDemoPage from '../pages/TitleDemo'
import StarLoadingDemoPage from '../pages/LoadingDemo'

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
        { path: 'components/star-date-picker', element: <StarDatePickerDemoPage /> },
        { path: 'components/dialog', element: <StarDialogDemoPage /> },
        { path: 'components/empty-state', element: <StarEmptyStateDemoPage /> },
        { path: 'components/popup', element: <StarPopupDemoPage /> },
        { path: 'components/typewriter', element: <StarTypewriterDemoPage /> },
        { path: 'components/loading', element: <StarLoadingDemoPage /> },
        { path: 'components/message', element: <StarMessageDemoPage /> },
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
