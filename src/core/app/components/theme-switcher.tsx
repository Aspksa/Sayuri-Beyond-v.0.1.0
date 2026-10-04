import { MoonStar, SunMedium, SunMoon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSettingsStore } from '@/store'

const themes = ['light', 'dark', 'system'] as const

export function ThemeSwitcher() {
  const { theme = 'system', setTheme } = useTheme()
  const setStoreTheme = useSettingsStore((s) => s.setTheme)

  const handleClick = () => {
    const idx = themes.indexOf(theme as (typeof themes)[number])
    const next = themes[(idx + 1) % themes.length]
    setTheme(next)
    setStoreTheme(next)
  }

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={handleClick}
      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {theme === 'light' && <SunMedium size={16} />}
      {theme === 'dark' && <MoonStar size={16} />}
      {theme === 'system' && <SunMoon size={16} />}
    </button>
  )
}
