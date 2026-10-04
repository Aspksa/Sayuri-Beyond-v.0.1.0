import { Outlet, useLocation } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { AppFooter } from '../components/app-footer'
import { AppHeader } from '../components/app-header'
import { AppLogo } from '../components/app-logo'
import { AppSidebarColumn } from '../app-sidebar-column'
import { MobileTreeNav } from '../menu/mobile-tree-nav'
import { isUrlMatch } from '../utils/nav-utils'
import { useNavMenus } from '../hooks/use-nav-menus'

export function ColumnLayout() {
  const { data: groups = [] } = useNavMenus()
  const href = useLocation({ select: (l) => l.href })
  const allTopItems = useMemo(() => groups.flatMap((g) => g.items), [groups])

  // 子项 URL 命中 → 取父级；直接项 URL 命中 → 取该项；否则取第一项
  const selectedTitle = useMemo(() => {
    const urlParentFromSub = allTopItems.find((item) =>
      item.items?.some((sub) => isUrlMatch(href, sub.url)),
    )
    const urlDirectItem = allTopItems.find(
      (item) => !item.items?.length && isUrlMatch(href, item.url),
    )
    return urlParentFromSub?.title ?? urlDirectItem?.title ?? allTopItems[0]?.title ?? null
  }, [allTopItems, href])

  const [subCollapsed, setSubCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const subItems = useMemo(() => {
    const selectedItem = allTopItems.find((i) => i.title === selectedTitle)
    return selectedItem?.items ?? []
  }, [allTopItems, selectedTitle])

  return (
    <div className="flex h-svh flex-col">
      <AppHeader showLogo />
      <div className="flex flex-1 min-h-0">
        <>
          <div className="hidden md:contents">
            <AppSidebarColumn
              items={allTopItems}
              selectedTitle={selectedTitle}
              onSelect={() => setSubCollapsed(false)}
            />
            {subItems.length > 0 && (
              <div
                className={cn(
                  'relative flex shrink-0 flex-col overflow-hidden bg-sidebar transition-[width] duration-200 ease-linear',
                  !subCollapsed && 'border-r',
                )}
                style={{ width: subCollapsed ? 0 : '13rem' }}
              >
                <div className="flex h-full w-52 flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 p-2">
                    {subItems.map((item) => {
                      const isActive = isUrlMatch(href, item.url)
                      return (
                        <Link key={item.url} to={item.url}>
                          <div
                            className={cn(
                              'flex items-center gap-2 px-3 text-sm text-sidebar-foreground rounded-md py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              isActive && 'bg-sidebar-accent font-medium text-sidebar-primary',
                            )}
                          >
                            {item.icon && <item.icon className="size-4 shrink-0" />}
                            <span>{item.title}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
            {subItems.length > 0 && (
              <button
                type="button"
                aria-label="Toggle Sidebar"
                onClick={() => setSubCollapsed((v) => !v)}
                className="-ml-2 relative z-20 hidden w-4 shrink-0 cursor-w-resize after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 hover:after:bg-sidebar-border data-[collapsed=true]:cursor-e-resize md:flex"
                data-collapsed={subCollapsed}
              />
            )}
          </div>
        </>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex h-10 shrink-0 items-center border-b px-2 md:hidden">
            <button
              type="button"
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </div>
          <AppFooter />
        </div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" showCloseButton={false} className="p-0 w-64 flex flex-col gap-0">
          <div className="flex h-14 shrink-0 items-center border-b px-4">
            <AppLogo />
          </div>
          <MobileTreeNav
            key={String(mobileNavOpen)}
            variant="column"
            items={allTopItems}
            onClose={() => setMobileNavOpen(false)}
            initialExpandedTitle={selectedTitle}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
