## 2024-05-22 - Frontend Verification Patterns
**Learning:** Frontend verification with Playwright in this environment requires handling skeleton loading states explicitly. Elements like buttons inside `EmptyState` or `Modal` components might not be immediately interactive or visible. Modals in this project lack `role="dialog"`, necessitating selection by content (e.g., `get_by_role("heading")`).
**Action:** When verifying UI, always add explicit waits for transition from loading state (skeletons) to content state. Inspect component implementation for ARIA roles if standard locators fail.

## 2024-05-22 - Next.js Performance Optimization
**Learning:** The project uses `framer-motion` heavily. Wrapping list items (like `FileCard`) in `React.memo` and stabilizing parent callbacks is crucial to avoid massive re-renders during interactions like selection, especially with animation libraries involved.
**Action:** Always check for `React.memo` on list items in this codebase.
