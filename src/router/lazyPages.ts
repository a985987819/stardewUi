import { lazy } from 'react'

/**
 * Route-level code splitting for the demo pages.
 *
 * These live outside `router/index.tsx` because that module exports the router
 * itself: mixing component and non-component exports in one file disables Vite's
 * Fast Refresh for it and forces a full page reload on every edit.
 */
export const StarGuidePage = lazy(() => import('../pages/Guide'))
export const StarComponentsPage = lazy(() => import('../pages/Components'))
export const StarButtonDemoPage = lazy(() => import('../pages/ButtonDemo'))
export const StarCalendarDemoPage = lazy(() => import('../pages/CalendarDemo'))
export const StarCardDemoPage = lazy(() => import('../pages/CardDemo'))
export const StarDatePickerDemoPage = lazy(() => import('../pages/DatePickerDemo'))
export const StarDialogDemoPage = lazy(() => import('../pages/DialogDemo'))
export const StarEmptyStateDemoPage = lazy(() => import('../pages/EmptyStateDemo'))
export const StarPopupDemoPage = lazy(() => import('../pages/PopupDemo'))
export const StarTypewriterDemoPage = lazy(() => import('../pages/TypewriterDemo'))
export const StarMessageDemoPage = lazy(() => import('../pages/MessageDemo'))
export const StarTitleDemoPage = lazy(() => import('../pages/TitleDemo'))
export const StarLoadingDemoPage = lazy(() => import('../pages/LoadingDemo'))
export const StarTabDemoPage = lazy(() => import('../pages/TabDemo'))
export const StarGapBorderDemoPage = lazy(() => import('../pages/GapBorderDemo'))
export const StarPixelButtonDemoPage = lazy(() => import('../pages/PixelButtonDemo'))
export const StarRatingDemoPage = lazy(() => import('../pages/RatingDemo'))
export const StarProgressDemoPage = lazy(() => import('../pages/ProgressDemo'))
