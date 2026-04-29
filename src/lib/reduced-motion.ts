import { useEffect, useState } from 'react'

/**
 * usePrefersReducedMotion — returns true when the user has requested
 * reduced motion at the OS level. Re-renders on preference change.
 *
 * Used to gate any expensive animation (R3F canvases, autoplaying
 * carousels). Cheap CSS transitions are already neutralized by the
 * `@media (prefers-reduced-motion: reduce)` block in `src/index.css`.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduce
}
