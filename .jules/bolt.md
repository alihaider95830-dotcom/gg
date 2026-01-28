## 2025-02-12 - React Derived State Anti-pattern
**Learning:** Found usage of `useEffect` to synchronize state (`filteredFiles`) with props/other state (`files`, `searchQuery`), causing unnecessary double renders.
**Action:** Replace `useEffect` state synchronization with `useMemo` for derived data.
