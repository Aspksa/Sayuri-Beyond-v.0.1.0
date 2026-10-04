import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Trans, useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FooterCopyright } from '@/core/login/footer-copyright'
import { LocalSwitcher } from '@/core/app/components/local-switcher'
import { LoginLayout } from '@/core/login/login-layout'
import { ThemeSwitcher } from '@/core/app/components/theme-switcher'
import { useAuthStore } from '@/store'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { setAccessToken, setRefreshToken } = useAuthStore()
  const { t } = useTranslation()

  const i18nValues = {
    header: {
      title: t('auth.login.header.title'),
      description: t('auth.login.header.description'),
    },
    form: {
      email: {
        label: t('auth.login.form.email'),
        placeholder: t('auth.login.form.email_placeholder'),
      },
      password: {
        label: t('auth.login.form.password'),
        placeholder: t('auth.login.form.password_placeholder'),
      },
      submit: {
        label: t('auth.login.form.submit'),
      },
    },
    thirdParty: {
      description: t('auth.login.third_party.description'),
      github: t('auth.login.third_party.github'),
      google: t('auth.login.third_party.google'),
    },
    footer: {
      description: (
        <Trans
          i18nKey="auth.login.footer.description"
          values={{
            service: t('auth.login.footer.service_text'),
            privacy: t('auth.login.footer.privacy_text'),
          }}
          components={[
            <a href={t('auth.login.footer.service_link')} key={0} />,
            <a href={t('auth.login.footer.privacy_link')} key={1} />,
          ]}
        />
      ),
    },
  }

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.code === 401) toast.error(t('auth.login.error_invalid_credentials'))
        else toast.error(t('auth.login.error_default'))
        throw new Error(data)
      }

      const { data } = await res.json()
      setAccessToken(data.accessToken)
      setRefreshToken(data.refreshToken)
      toast.success(t('auth.login.success'))
      navigate({ to: '/main' })
    } catch {}
  }

  return (
    <LoginLayout
      i18n={i18nValues}
      onFormSubmit={handleLogin}
      footerChildren={
        <>
          <div className="flex items-center justify-center gap-2">
            <LocalSwitcher />
            <ThemeSwitcher />
          </div>
          <FooterCopyright copyright={t('global.copyright')} />
        </>
      }
    />
  )
}
