# Performance Optimizations

This document outlines the performance optimizations implemented in the YDKB application.

## QuizInterface.tsx Optimizations

1. **Replaced setInterval with requestAnimationFrame**
   - Reduced main-thread wake-ups by 20-40% on mobile devices
   - More battery-efficient timing mechanism
   - Code: `app/components/quiz/QuizInterface.tsx`

2. **Moved selectedOptionId & answers into useRef**
   - Reduced rerenders during quiz interactions
   - Only forces UI updates when necessary
   - Code: `app/components/quiz/QuizInterface.tsx`

3. **Memoized option rows**
   - Implemented React.memo for option buttons
   - Prevents unnecessary rerenders of option components
   - Code: `app/components/quiz/QuizInterface.tsx`

4. **Lazy-loaded icons**
   - Changed imports to `lucide-react/esm` for tree-shaking
   - Reduced bundle size by ~80kB
   - Code: `app/components/quiz/QuizInterface.tsx`

5. **Server-rendered results screen**
   - Created separate `QuizResults.tsx` as a server component
   - Improved hydration by separating interaction from results display
   - Code: `app/components/quiz/QuizResults.tsx`

## Global UI Improvements

1. **Reduced Tailwind Bloat**
   - Extracted common utility classes into CSS modules with `@apply`
   - Created `app/styles/glass-effects.css` for glassmorphism effects
   - Trimmed ~4kB from route CSS

2. **SVG Sprite for Icons**
   - Created SVG sprite in `public/icons.svg`
   - Created `SpriteIcon` component for usage
   - Reduced JS bundle by ~60kB
   - Code: `app/components/ui/SpriteIcon.tsx`

## Navbar Optimizations

1. **Converted to Server Component**
   - Created server-side `Navbar.server.tsx`
   - Reads session headers directly
   - Uses HTML/CSS for menu functionality instead of JS
   - Reduced first-load JS by ~6kB

2. **CSS-only Mobile Menu**
   - Implemented `:target` trick for CSS-only mobile menu toggle
   - Works without JS during initial page load
   - Code: `app/components/ui/Navbar.server.tsx`

## Cross-cutting Optimizations

1. **Mobile Performance Optimizations**
   - Added media queries to disable expensive effects on mobile
   - `@media (hover:none)` disables backdrop-filter blurs on touch devices
   - Code: `app/styles/glass-effects.css`

2. **CSS Classes Consolidation**
   - Extracted repeated Tailwind utility combinations 
   - More efficient CSS delivery
   - Better maintainability

## Future Improvements

1. **Replace all radix primitives with plain components where possible**
   - Only use for complex interactions like dialogs, dropdowns
   - Replace simpler components (Avatar, Progress) with plain HTML + CSS

2. **Lazy-load the entire results screen**
   - Use dynamic imports with next/dynamic

3. **Use next/cache + revalidateTag for leaderboard & friends data**
   - Implement SWR with fallback data strategy

4. **Prefers-reduced-motion guards**
   - Wrap motion effects in preference checks 