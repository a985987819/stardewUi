# Public component catalog

Use public root exports only. The installed package's declaration files are the authoritative
source for exact props and valid values.

| Need | Prefer |
| --- | --- |
| Framed content, content panels, rich item display | `StarCard`, `StarDisplayFrame`, `StarAvatar`, `StarDivider`, `StarEmptyState`, `StarLoading` |
| Primary actions and simple input | `StarNineSliceButton`, `StarInput`, `StarSwitch`, `StarCheckbox`, `StarRating`, `StarProgress` |
| Dialogs, drawers, notices, contextual help | `StarDialog`, `StarDrawer`, `StarPopup`, `message`, `StarTypewriter` |
| Date selection and segmented navigation | `StarCalendar`, `StarDatePicker`, `StarTab` |
| Reusable interaction helpers | `useToggle`, `useClipboard`, `useLocalStorage`, `useNineSliceBackground` |
| Pixel/canvas implementation helpers | `calculateNineSliceLayout`, `drawNineSlice`, pixel-shape helpers, `createGapBorderCorners` |

## Component selection notes

- Use `StarNineSliceButton` for user-triggered actions. Mark destructive actions with the
  documented dangerous visual treatment and ask for confirmation before applying them.
- Use `StarDialog` for a focused decision or a multi-page in-game style conversation;
  `StarDrawer` for contextual details that should preserve the underlying task.
- Use `StarCard` to group a meaningful unit of information. Avoid nesting many framed
  containers merely to imitate a dashboard.
- Prefer `StarEmptyState` and `StarLoading` rather than plain text when data is absent or
  loading, so status remains visually consistent.
