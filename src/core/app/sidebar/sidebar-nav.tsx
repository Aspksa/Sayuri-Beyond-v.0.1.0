import type { AppSidebarNavItem } from '../types'

import { Link, useLocation } from '@tanstack/react-router'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { useSettingsStore } from '@/store'
import { isUrlMatch } from '../utils/nav-utils'
import { GroupNavItem } from './group-nav-item'
import { SIDEBAR_SUB_STYLE } from './styles'
import { SubNavItem } from './sub-nav-item'

export function SidebarNav({ items }: { items: AppSidebarNavItem[] }) {
  const href = useLocation({ select: (location) => location.href })
  const siderMenuType = useSettingsStore((s) => s.siderMenuType)

  return (
    <SidebarMenu className={SIDEBAR_SUB_STYLE.menu}>
      {items.map((item) => {
        if (item.items) {
          if (siderMenuType === 'group')
            return <GroupNavItem key={item.title} item={item} href={href} />
          return <SubNavItem key={item.title} item={item} href={href} />
        }
        const isActive = isUrlMatch(href, item.url)
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={isActive}
              render={<Link to={item.url} />}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
