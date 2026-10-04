import { createFileRoute, Link } from '@tanstack/react-router'
import { BarChart3, Bot, LayoutDashboard, Settings2, Shield, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { LocalSwitcher } from '@/core/app/components/local-switcher'
import { ThemeSwitcher } from '@/core/app/components/theme-switcher'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

const features = [
  {
    icon: LayoutDashboard,
    titleKey: 'home.features.dashboard.title',
    descKey: 'home.features.dashboard.desc',
  },
  {
    icon: Shield,
    titleKey: 'home.features.auth.title',
    descKey: 'home.features.auth.desc',
  },
  {
    icon: BarChart3,
    titleKey: 'home.features.analytics.title',
    descKey: 'home.features.analytics.desc',
  },
  {
    icon: Bot,
    titleKey: 'home.features.ai.title',
    descKey: 'home.features.ai.desc',
  },
  {
    icon: Settings2,
    titleKey: 'home.features.config.title',
    descKey: 'home.features.config.desc',
  },
  {
    icon: Zap,
    titleKey: 'home.features.performance.title',
    descKey: 'home.features.performance.desc',
  },
]

function RouteComponent() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <img src="/fast.svg" alt="logo" className="size-6" />
            <span className="font-semibold">{t('sidebar.brand')}</span>
          </div>
          <div className="flex items-center gap-2">
            <LocalSwitcher />
            <ThemeSwitcher />
            <Link to="/login">
              <Button size="sm">{t('auth.login.form.submit')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-accent px-3 py-1 text-xs text-muted-foreground">
            <Zap size={12} />
            {t('home.hero.badge')}
          </div>
          <h1 className="mb-4 max-w-2xl text-5xl font-bold tracking-tight">
            {t('home.hero.title')}
          </h1>
          <p className="mb-8 max-w-xl text-lg text-muted-foreground">
            {t('home.hero.description')}
          </p>
          <div className="flex gap-3">
            <Link to="/main">
              <Button size="lg">{t('home.hero.cta_primary')}</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                {t('home.hero.cta_secondary')}
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold">{t('home.features.title')}</h2>
            <p className="text-muted-foreground">{t('home.features.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, titleKey, descKey }) => (
              <div
                key={titleKey}
                className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="mb-1 font-semibold">{t(titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        {t('global.copyright')}
      </footer>
    </div>
  )
}
