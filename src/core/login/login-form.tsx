import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  onFormSubmit: ({ email, password }: { email: string; password: string }) => void
  i18n: {
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
}

export function LoginForm({ className, onFormSubmit, i18n, ...props }: LoginFormProps) {
  const [, formAction, isPending] = useActionState(async (_prevState: null, formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    onFormSubmit({ email, password })
    return null
  }, null)

  return (
    <div className={cn('flex flex-col gap-6 mb-4', className)} {...props}>
      <form action={formAction}>
        <fieldset disabled={isPending}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">{i18n.email.label}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={i18n.email.placeholder}
                required
                defaultValue="admin@test.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{i18n.password.label}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={i18n.password.placeholder}
                required
                defaultValue="admin123"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {i18n.submit.label}
            </Button>
          </div>
        </fieldset>
      </form>
    </div>
  )
}
