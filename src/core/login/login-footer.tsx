import type { ReactNode } from 'react'

interface LoginFooterProps {
  i18n: {
    description: ReactNode
  }
}

export function LoginFooter({ i18n }: LoginFooterProps) {
  return (
    <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
      {i18n.description}
    </div>
  )
}
