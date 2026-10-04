import { useLocation } from '@tanstack/react-router'
import * as React from 'react'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { ThemeSwitcher } from './components/theme-switcher'
import { useSettingsStore } from '@/store'
import { LocalSwitcher } from './components/local-switcher'
import { AppLogo } from './components/app-logo'
import { SIDEBAR_GROUP_STYLE, SidebarNav } from './sidebar'
import { useNavMenus } from './hooks/use-nav-menus'
import { UserMenu } from './menu/user-menu'

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { data: groups = [] } = useNavMenus()
  const siderMenuType = useSettingsStore((s) => s.siderMenuType)
  const layoutMode = useSettingsStore((s) => s.layoutMode)
  const autoSplitMenu = useSettingsStore((s) => s.autoSplitMenu)
  const href = useLocation({ select: (l) => l.href })
  const { state } = useSidebar()

  // mix + autoSplitMenu: 只显示当前激活一级菜单的子项
  if (layoutMode === 'mix' && autoSplitMenu) {
    const allItems = groups.flatMap((g) => g.items)
    const activeParent = allItems.find((item) =>
      item.items?.some((sub) => sub.url === href || href.startsWith(sub.url)),
    )

    if (!activeParent?.items?.length) return null

    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarNav items={activeParent.items} />
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    )
  }

  const showHeader = layoutMode === 'side'

  return (
    <Sidebar collapsible="icon" {...props}>
      {showHeader && (
        <SidebarHeader className="h-14 gap-0 p-0">
          <div className="flex flex-1 items-center px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <AppLogo className="px-2 py-1 group-data-[collapsible=icon]:px-0 [&>span]:group-data-[collapsible=icon]:hidden [&>div:last-child]:group-data-[collapsible=icon]:hidden" />
          </div>
        </SidebarHeader>
      )}
      <SidebarContent>
        {groups.map((group, index) => (
          <React.Fragment key={group.label ?? index}>
            {index > 0 && siderMenuType === 'group' && state === 'expanded' && (
              <Separator className={SIDEBAR_GROUP_STYLE.separator} />
            )}
            <SidebarGroup>
              <SidebarNav items={group.items} />
            </SidebarGroup>
          </React.Fragment>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {layoutMode === 'side' && (
          <div className="flex items-center gap-1 px-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:w-full">
            <UserMenu />
            <div className="flex-1 group-data-[collapsible=icon]:hidden" />
            <LocalSwitcher />
            <ThemeSwitcher />
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
