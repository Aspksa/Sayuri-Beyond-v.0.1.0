import { createFileRoute } from '@tanstack/react-router'
import { UsersPage } from '@/pages/setting/users'
import { usersQueryOptions } from '@/api/setting/users'
import { UsersSkeleton } from '@/pages/setting/users/skeleton'
import { useSettingsStore } from '@/store'
import { queryClient } from '@/lib/query-client'

export const Route = createFileRoute('/_auth/setting/users')({
  loader: () => {
    if (useSettingsStore.getState().routeLoading) {
      return queryClient.ensureQueryData(usersQueryOptions(1, 10))
    }
  },
  pendingComponent: UsersSkeleton,
  pendingMs: 200,
  component: UsersPage,
})
