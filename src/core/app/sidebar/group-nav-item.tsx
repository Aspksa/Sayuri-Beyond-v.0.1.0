import type { AppSidebarNavItem } from '../types'

import { Link } from '@tanstack/react-router'
import { memo } from 'react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { isUrlMatch } from '../utils/nav-utils'
import { FlyoutNavItem } from './flyout-nav-item'
import { SIDEBAR_GROUP_STYLE } from './styles'

function GroupNavItemInner({ item, href }: { item: AppSidebarNavItem; href: string }) {
  const { state } = useSidebar()

  if (state === 'collapsed') {
    return <FlyoutNavItem item={item} href={href} />
  }

  return (
    <SidebarGroup className={SIDEBAR_GROUP_STYLE.innerGroup}>
      <SidebarGroupLabel className={SIDEBAR_GROUP_STYLE.groupLabel}>
        {item.icon && <item.icon className="mr-1.5 size-4" />}
        {item.title}
      </SidebarGroupLabel>
      <SidebarMenu className={SIDEBAR_GROUP_STYLE.menu}>
        {item.items!.map((subItem) => (
          <SidebarMenuItem key={subItem.title}>
            <SidebarMenuButton
              tooltip={subItem.title}
              isActive={isUrlMatch(href, subItem.url)}
              render={<Link to={subItem.url} />}
            >
              {subItem.icon && <subItem.icon />}
              <span>{subItem.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export const GroupNavItem = memo(GroupNavItemInner)
