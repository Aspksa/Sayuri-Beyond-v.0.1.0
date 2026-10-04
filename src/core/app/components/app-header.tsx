import { Link, useLocation } from '@tanstack/react-router'
import { ChevronDown, Menu, X } from 'lucide-react'
import { memo, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ThemeSwitcher } from './theme-switcher'
import { cn } from '@/lib/utils'
import { LocalSwitcher } from './local-switcher'
import { AppLogo } from './app-logo'
import { MobileTreeNav } from '../menu/mobile-tree-nav'
import { isNavItemActive, isUrlMatch } from '../utils/nav-utils'
import { useNavMenus } from '../hooks/use-nav-menus'
import { UserMenu } from '../menu/user-menu'

const NAV_LINK_CLASS =
  'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'

interface HeaderNavProps {
  variant?: 'top' | 'mix'
}

const HeaderNav = memo(({ variant = 'top' }: HeaderNavProps) => {
  const { data: groups = [] } = useNavMenus()
  const href = useLocation({ select: (l) => l.href })
  const allItems = groups.flatMap((g) => g.items)

  return (
    <nav className="flex items-center gap-1">
      {allItems.map((item) => {
        const isActive = isNavItemActive(href, item)

        if (item.items?.length && variant === 'mix') {
          return (
            <Link
              key={item.url}
              to={item.items[0].url}
              className={cn(
                NAV_LINK_CLASS,
                isActive ? 'text-foreground font-medium' : 'text-muted-foreground',
              )}
            >
              {item.icon && <item.icon size={15} />}
              {item.title}
            </Link>
          )
        }

        if (item.items?.length) {
          return (
            <DropdownMenu key={item.url}>
              <DropdownMenuTrigger
                className={cn(
                  'inline-flex h-8 cursor-pointer items-center gap-1 rounded-md px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'text-foreground font-medium' : 'text-muted-foreground',
                )}
              >
                {item.icon && <item.icon size={15} />}
                {item.title}
                <ChevronDown size={13} className="opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {item.items.map((sub) => (
                  <DropdownMenuItem
                    key={sub.url}
                    render={<Link to={sub.url} />}
                    className={cn('gap-2', isUrlMatch(href, sub.url) && 'text-primary')}
                  >
                    {sub.icon && <sub.icon size={14} />}
                    {sub.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }

        return (
          <Link
            key={item.url}
            to={item.url}
            className={cn(
              NAV_LINK_CLASS,
              isActive ? 'text-foreground font-medium' : 'text-muted-foreground',
            )}
          >
            {item.icon && <item.icon size={15} />}
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
})

function MobileNav({ onClose }: { onClose: () => void }) {
  const { data: groups = [] } = useNavMenus()
  const allItems = groups.flatMap((g) => g.items)
  return <MobileTreeNav variant="header" items={allItems} onClose={onClose} />
}

interface AppHeaderProps {
  showLogo?: boolean
  showNav?: boolean
  navVariant?: 'top' | 'mix'
}

export function AppHeader({
  showLogo = false,
  showNav = false,
  navVariant = 'top',
}: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
      {showNav && (
        <button
          type="button"
          className="md:hidden flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="size-5" />
        </button>
      )}
      {showLogo && <AppLogo />}
      {showNav && (
        <div className="hidden md:flex">
          <HeaderNav variant={navVariant} />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <LocalSwitcher />
        <ThemeSwitcher />
        <UserMenu />
      </div>

      {showNav && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" showCloseButton={false} className="w-64 p-0">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <AppLogo />
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="size-4" />
              </button>
            </div>
            <MobileNav onClose={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      )}
    </header>
  )
}
