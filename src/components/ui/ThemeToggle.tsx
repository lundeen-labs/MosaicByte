import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme, type Theme } from '@/lib/theme'
import { cn } from '@/lib/utils'

const NEXT_LABEL: Record<Theme, string> = {
  light: 'Switch to dark theme',
  dark: 'Use system theme',
  system: 'Switch to light theme',
}

const STATE_DESCRIPTION: Record<Theme, string> = {
  light: 'Current theme: light',
  dark: 'Current theme: dark',
  system: 'Current theme: follow system preference',
}

const ICONS: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

interface ThemeToggleProps {
  className?: string
}

/**
 * Three-state cycling button: light → dark → system → light.
 *
 * The aria-label always describes the next action (so screen-reader users
 * hear "Switch to dark theme" not "light"), and we layer the current state
 * onto title + a visually-hidden description so SR users get both pieces
 * without making the visible button verbose.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, cycleTheme } = useTheme()
  const Icon = ICONS[theme]

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={NEXT_LABEL[theme]}
      title={STATE_DESCRIPTION[theme]}
      data-theme-state={theme}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center',
        'rounded-full border border-[var(--color-paper-3)] bg-[var(--color-paper-2)]',
        'text-[var(--color-ink)]',
        'transition-colors duration-[180ms]',
        'hover:border-[var(--color-rust)] hover:text-[var(--color-rust)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
        className,
      )}
    >
      <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
      <span className="sr-only">{STATE_DESCRIPTION[theme]}</span>
    </button>
  )
}

export default ThemeToggle
