## 2026-01-19 - Memory vs Code Reality
**Learning:** The memory stated components `CourseCard` and `FileCard` were memoized, but the code showed they were not.
**Action:** Always verify memory claims against the actual codebase before assuming optimizations exist. Trust code over documentation/memory.

## 2026-01-19 - Derived State Anti-Pattern
**Learning:** The codebase used `useEffect` to sync `filteredFiles` state with `files` and search query, causing double renders.
**Action:** Replace state syncing `useEffect`s with `useMemo` for derived data to eliminate unnecessary render cycles.
