import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import i18n from '@/i18n'
import { useSettingsStore } from '@/store'

export function useApplySettings() {
  const theme = useSettingsStore((s) => s.theme)
  const colorTheme = useSettingsStore((s) => s.colorTheme)
  const radius = useSettingsStore((s) => s.radius)
  const language = useSettingsStore((s) => s.language)
  const grayscale = useSettingsStore((s) => s.grayscale)
  const { setTheme: setNextTheme } = useTheme()

  useEffect(() => {
    setNextTheme(theme)
  }, [theme, setNextTheme])

  useEffect(() => {
    i18n.changeLanguage(language)
  }, [language])

  useEffect(() => {
    const root = document.documentElement
    if (colorTheme === 'zinc') {
      root.removeAttribute('data-color-theme')
    } else {
      root.setAttribute('data-color-theme', colorTheme)
    }
    root.style.setProperty('--radius', `${radius}rem`)
  }, [colorTheme, radius])

  useEffect(() => {
    document.documentElement.style.filter = grayscale ? 'grayscale(1)' : ''
  }, [grayscale])
}
