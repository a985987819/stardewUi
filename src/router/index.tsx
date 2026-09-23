import { createBrowserRouter, Navigate } from 'react-router-dom'
import { GITHUB_PAGES_BASENAME } from '../utils/githubPages'
import StarLayout from '../components/layout/Layout'
import StarHomePage from '../pages/Home'
// Demo pages are code-split per route so the landing page only ships the shell.
// `StarLayout` provides the Suspense boundary for these children.
import {
  StarComponentsPage,
  StarGuideAgentUsePage,
  StarGuideDesignSystemPage,
  StarGuideLicensePage,
  StarGuideSelfUsePage,
} from './lazyPages'
import { COMPONENT_ROUTES } from './componentRegistry'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <StarLayout />,
      children: [
        { index: true, element: <StarHomePage /> },
        { path: 'guide', element: <Navigate to="/guide/self-use" replace /> },
        { path: 'guide/self-use', element: <StarGuideSelfUsePage /> },
        { path: 'guide/agent-use', element: <StarGuideAgentUsePage /> },
        { path: 'guide/design-system', element: <StarGuideDesignSystemPage /> },
        { path: 'guide/license', element: <StarGuideLicensePage /> },
        { path: 'components', element: <StarComponentsPage /> },
        ...COMPONENT_ROUTES.map(({ routePath, element: Component }) => ({
          path: `components/${routePath}`,
          element: <Component />,
        })),
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
