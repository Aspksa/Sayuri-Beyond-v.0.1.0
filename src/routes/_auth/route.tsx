import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppLayout } from '@/core/app'
import { NotFound } from '@/core/not-found'
import { useAuthStore } from '@/store'

export const Route = createFileRoute('/_auth')({
  component: AppLayout,
  notFoundComponent: NotFound,
  beforeLoad() {
    const token = useAuthStore.getState().accessToken
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
})
