## 2024-05-22 - React List Performance Optimization
**Learning:** In interactive lists with selection, passing a new function reference to every item on every render (due to changing parent state) breaks `React.memo`. Using `useCallback` with functional state updates (e.g., `setIds(prev => ...)`) allows handlers to remain stable even when state changes, preserving memoization benefits.
**Action:** When implementing selection logic in lists, always use functional state updates in handlers and wrap list items in `React.memo` to ensure O(1) re-renders instead of O(N) when selecting an item.
