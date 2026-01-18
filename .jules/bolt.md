## 2026-01-18 - Double Render Anti-Pattern in CoursePage
**Learning:** Found `useEffect` used to synchronize state (`filteredFiles`) with props/other state (`files`, `searchQuery`), causing unnecessary double renders.
**Action:** Always prefer deriving state with `useMemo` when the value can be computed from existing props/state.
