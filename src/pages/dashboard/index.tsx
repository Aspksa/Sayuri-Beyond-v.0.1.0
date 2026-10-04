import { useQueries } from '@tanstack/react-query'
import { Key, Menu, TrendingUp, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PaginatedResponse {
  items: unknown[]
  pagination: { total: number }
}

async function fetchTotal(url: string): Promise<number> {
  const res = await fetch(`${url}?page=1&pageSize=1`)
  const json = await res.json()
  return (json.data as PaginatedResponse).pagination.total
}

async function fetchRecentUsers() {
  const res = await fetch('/api/setting/users?page=1&pageSize=5')
  const json = await res.json()
  return (json.data as PaginatedResponse).items as {
    id: number
    nick_name: string
    email: string
    status: number
    last_login: string
  }[]
}

const STATS = [
  { key: 'users', url: '/api/setting/users', icon: Users, color: 'text-blue-500' },
  { key: 'permissions', url: '/api/setting/permissions', icon: Key, color: 'text-orange-500' },
  { key: 'menus', url: '/api/setting/menus', icon: Menu, color: 'text-green-500' },
] as const

export function Dashboard() {
  const { t } = useTranslation()

  const results = useQueries({
    queries: [
      ...STATS.map((s) => ({
        queryKey: ['dashboard', s.key],
        queryFn: () => fetchTotal(s.url),
      })),
      {
        queryKey: ['dashboard', 'recent-users'],
        queryFn: fetchRecentUsers,
      },
    ],
  })

  const totals = STATS.map((s, i) => ({ ...s, total: results[i].data as number | undefined }))
  const recentUsers =
    (results[3].data as Awaited<ReturnType<typeof fetchRecentUsers>> | undefined) ?? []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {totals.map(({ key, icon: Icon, color, total }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{t(`dashboard.stats.${key}`)}</CardDescription>
              <Icon size={18} className={color} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{total ?? '—'}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp size={12} className="text-green-500" />
                {t('dashboard.stats.trend')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent users */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentUsers.title')}</CardTitle>
          <CardDescription>{t('dashboard.recentUsers.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-left">
                <th className="pb-2 font-medium">{t('dashboard.recentUsers.col.nick_name')}</th>
                <th className="pb-2 font-medium">{t('dashboard.recentUsers.col.email')}</th>
                <th className="pb-2 font-medium">{t('dashboard.recentUsers.col.status')}</th>
                <th className="pb-2 font-medium">{t('dashboard.recentUsers.col.last_login')}</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{user.nick_name}</td>
                  <td className="py-3 text-muted-foreground">{user.email}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.status === 1
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {user.status === 1
                        ? t('setting.users.status.enabled')
                        : t('setting.users.status.disabled')}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(user.last_login).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
