import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-8xl font-bold text-muted-foreground/30">404</span>
        <h1 className="text-2xl font-semibold">{t('notFound.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('notFound.description')}</p>
      </div>
      <Link
        to="/dashboard"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {t('notFound.back')}
      </Link>
    </div>
  )
}
