## 2024-05-22 - Artificial Latency Anti-Pattern
**Learning:** Found usage of `setTimeout` to simulate network latency in `loadFiles` and `loadCourses`. This artificially slows down the application even though data fetching from `localStorage` is synchronous.
**Action:** Always check for `setTimeout` in data fetching functions when optimizing "mock" or "local storage" based apps. Remove them to provide instant feedback.
