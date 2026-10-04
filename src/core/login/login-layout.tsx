import type { ReactNode } from 'react'
import { LoginFooter } from './login-footer'
import { LoginForm } from './login-form'
import { LoginHeader } from './login-header'
import { LoginThirdParty } from './login-third-party'

interface LoginLayoutProps {
  footerChildren?: ReactNode
  onFormSubmit: ({ email, password }: { email: string; password: string }) => void
  i18n: {
    header: {
      title: string
      description: string
    }
    form: {
      email: {
        label: string
        placeholder: string
      }
      password: {
        label: string
        placeholder: string
      }
      submit: {
        label: string
      }
    }
    thirdParty: {
      description: string
      github: string
      google: string
    }
    footer: {
      description: ReactNode
    }
  }
}

function LoginLayout({ i18n, onFormSubmit, footerChildren }: LoginLayoutProps) {
  return (
    <div className="h-screen flex flex-col">
      <section className="h-full">
        <div className="flex h-full w-full flex-col justify-center items-center py-6">
          <div className="mx-auto flex h-full w-95 flex-col justify-center">
            <LoginHeader i18n={i18n.header} />
            <LoginForm i18n={i18n.form} onFormSubmit={onFormSubmit} />
            <LoginThirdParty withGithub withGoogle i18n={i18n.thirdParty} />
            <LoginFooter i18n={i18n.footer} />
          </div>
          {footerChildren && (
            <footer className="flex flex-col gap-4 mt-10 w-95">{footerChildren}</footer>
          )}
        </div>
      </section>
    </div>
  )
}

export { LoginLayout }
