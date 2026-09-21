import { lazy } from 'react'

/**
 * Route-level code splitting for the demo pages.
 *
 * These live outside `router/index.tsx` because that module exports the router
 * itself: mixing component and non-component exports in one file disables Vite's
 * Fast Refresh for it and forces a full page reload on every edit.
 *
 * Naming contract: `Star<Component>DemoPage` -> `../pages/<Component>Demo`.
 * `COMPONENT_ROUTES` in `./componentRegistry` references these exports, and
 * `./componentRegistry.sync.test.tsx` fails the suite when the two drift apart.
 * Append new entries at the end with `bun run gen:component <Name>`.
 */
export const StarGuidePage = lazy(() => import('../pages/Guide'))
export const StarComponentsPage = lazy(() => import('../pages/Components'))
export const StarNineSliceButtonDemoPage = lazy(() => import('../pages/NineSliceButtonDemo'))
export const StarCalendarDemoPage = lazy(() => import('../pages/CalendarDemo'))
export const StarCardDemoPage = lazy(() => import('../pages/CardDemo'))
export const StarDatePickerDemoPage = lazy(() => import('../pages/DatePickerDemo'))
export const StarDialogDemoPage = lazy(() => import('../pages/DialogDemo'))
export const StarEmptyStateDemoPage = lazy(() => import('../pages/EmptyStateDemo'))
export const StarPopupDemoPage = lazy(() => import('../pages/PopupDemo'))
export const StarTypewriterDemoPage = lazy(() => import('../pages/TypewriterDemo'))
export const StarMessageDemoPage = lazy(() => import('../pages/MessageDemo'))
export const StarLoadingDemoPage = lazy(() => import('../pages/LoadingDemo'))
export const StarTabDemoPage = lazy(() => import('../pages/TabDemo'))
export const StarRatingDemoPage = lazy(() => import('../pages/RatingDemo'))
export const StarProgressDemoPage = lazy(() => import('../pages/ProgressDemo'))
export const StarSwitchDemoPage = lazy(() => import('../pages/SwitchDemo'))
export const StarInputDemoPage = lazy(() => import('../pages/InputDemo'))
export const StarDisplayFrameDemoPage = lazy(() => import('../pages/DisplayFrameDemo'))
export const StarAvatarDemoPage = lazy(() => import('../pages/AvatarDemo'))
export const StarDividerDemoPage = lazy(() => import('../pages/DividerDemo'))
