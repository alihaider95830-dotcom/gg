## 2024-05-22 - Next.js/React Optimization Patterns
**Learning:** Found an anti-pattern where synchronous `localStorage` operations were artificially delayed using `setTimeout` in `loadFiles` functions, causing unnecessary perceived latency. Also observed `useEffect` being used to sync derived state (`filteredFiles`) causing double renders.
**Action:** Always verify if async simulation (setTimeout) is necessary for local data. Prefer `useMemo` for derived state (filtering/sorting) over `useState` + `useEffect` to eliminate render cycles.
