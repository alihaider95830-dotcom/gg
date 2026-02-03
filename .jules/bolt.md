## 2026-02-03 - Memoization in List Views
**Learning:** In Next.js applications with interactive lists (like file selection), passing unstable callback functions to list items causes the entire list to re-render on every interaction. This is O(N) performance for O(1) user action.
**Action:** Always wrap list item components in `React.memo` and ensure all passed props (especially event handlers) are stable using `useCallback`. Use functional state updates (e.g., `setSet(prev => ...)` to remove state dependencies from these callbacks.
