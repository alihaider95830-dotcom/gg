## 2024-05-23 - Memoization of List Items
**Learning:** `CourseCard` components in the dashboard were re-rendering on every keystroke of the create modal inputs because the parent `Dashboard` re-rendered and the `onDelete` handler prop was recreated on every render.
**Action:** Always stabilize callback props (using `useCallback`) when passing them to `React.memo` components to ensure memoization is effective.
