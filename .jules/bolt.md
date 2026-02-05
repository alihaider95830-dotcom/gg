## 2024-05-23 - Derive state with useMemo instead of useEffect
**Learning:** Synchronizing state with `useEffect` (e.g. updating `filteredFiles` when `files` changes) causes an unnecessary double render: one for the initial change and another for the state update inside the effect. This is especially costly for large lists.
**Action:** Use `useMemo` to derive values synchronously during render to avoid the extra render cycle. Combine this with `React.memo` for list items and stable `useCallback` handlers to maximize performance.
