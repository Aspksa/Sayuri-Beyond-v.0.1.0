import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/main')({
  beforeLoad() {
    throw redirect({ to: '/dashboard' })
  },
  component: () => null,
})
