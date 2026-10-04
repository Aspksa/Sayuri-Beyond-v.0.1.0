import { useTranslation } from 'react-i18next'

export function AppFooter() {
  const { t } = useTranslation()

  return (
    <footer className="px-6 py-3 text-xs text-muted-foreground text-center shrink-0">
      {t('global.copyright')}
    </footer>
  )
}
