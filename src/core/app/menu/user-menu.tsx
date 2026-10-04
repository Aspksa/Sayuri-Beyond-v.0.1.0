import type { UserInfo } from '@/api/app'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { CircleHelp, LogOut, User, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { fetchUserInfo } from '@/api/app'
import { useAuthStore } from '@/store'
import { cn } from '@/lib/utils'
import http from '@/lib/http'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function UserAvatar({ user, className }: { user?: UserInfo; className?: string }) {
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={cn('rounded-full object-cover', className)}
      />
    )
  }
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium',
        className,
      )}
    >
      {user ? getInitials(user.name) : <User size={14} />}
    </span>
  )
}

export function UserMenu() {
  const { t } = useTranslation()
  const { accessToken, reset } = useAuthStore()
  const navigate = useNavigate()

  const { data: user } = useQuery<UserInfo>({
    queryKey: ['user', 'me'],
    queryFn: fetchUserInfo,
    enabled: !!accessToken,
  })

  const handleLogout = async () => {
    try {
      await http.delete('/api/auth/logout')
    } catch {
      // 服务端登出失败时仍执行本地登出
    }
    reset()
    navigate({ to: '/login' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="User menu"
        className="cursor-pointer hover:opacity-90 transition-opacity rounded-full"
      >
        <UserAvatar user={user} className="size-8 text-xs" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user && (
          <>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <UserAvatar user={user} className="size-10 shrink-0 text-sm" />
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold leading-none">{user.name}</span>
                  {user.role && (
                    <Badge
                      variant="outline"
                      className="h-4 px-1 py-0 text-[10px] capitalize leading-none"
                    >
                      {user.role}
                    </Badge>
                  )}
                </div>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuGroup>
          <DropdownMenuItem className="py-2">
            <UserRound size={14} />
            {t('userMenu.profile')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="py-2"
            onClick={() => window.open('https://github.com/authdoor/shadcn-admin', '_blank')}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-3.5 shrink-0"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </DropdownMenuItem>
          <DropdownMenuItem className="py-2">
            <CircleHelp size={14} />
            {t('userMenu.help')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="py-2" variant="destructive" onClick={handleLogout}>
          <LogOut size={14} />
          {t('userMenu.logout')}
          <DropdownMenuShortcut>⌥Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
