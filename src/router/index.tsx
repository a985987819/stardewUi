import { createBrowserRouter, Navigate } from 'react-router-dom'
import StarLayout from '../components/layout/Layout'
import StarHomePage from '../pages/Home'
import StarGuidePage from '../pages/Guide'
import StarComponentsPage from '../pages/Components'
import StarButtonDemoPage from '../pages/ButtonDemo'
import StarCardDemoPage from '../pages/CardDemo'
import StarDialogDemoPage from '../pages/DialogDemo'
import StarEmptyStateDemoPage from '../pages/EmptyStateDemo'
import StarPopupDemoPage from '../pages/PopupDemo'
import StarTypewriterDemoPage from '../pages/TypewriterDemo'
import StarMessageDemoPage from '../pages/MessageDemo'
import StarTitleDemoPage from '../pages/TitleDemo'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <StarLayout />,
    children: [
      { index: true, element: <StarHomePage /> },
      { path: 'guide', element: <StarGuidePage /> },
      { path: 'components', element: <StarComponentsPage /> },
      { path: 'components/button', element: <StarButtonDemoPage /> },
      { path: 'components/title', element: <StarTitleDemoPage /> },
      { path: 'components/card', element: <StarCardDemoPage /> },
      { path: 'components/dialog', element: <StarDialogDemoPage /> },
      { path: 'components/empty-state', element: <StarEmptyStateDemoPage /> },
      { path: 'components/popup', element: <StarPopupDemoPage /> },
      { path: 'components/typewriter', element: <StarTypewriterDemoPage /> },
      { path: 'components/message', element: <StarMessageDemoPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
