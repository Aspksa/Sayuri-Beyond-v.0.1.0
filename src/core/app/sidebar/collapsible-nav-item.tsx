import type { AppSidebarNavItem } from '../types'

import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { memo, useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { isNavItemActive, isUrlMatch } from '../utils/nav-utils'
import { FlyoutNavItem } from './flyout-nav-item'
import { SIDEBAR_SUB_STYLE } from './styles'

function CollapsibleNavItemInner({ item, href }: { item: AppSidebarNavItem; href: string }) {
  const { state } = useSidebar()
  const isActive = isNavItemActive(href, item)
  const [open, setOpen] = useState(() => isActive)

  if (state === 'collapsed') {
    return <FlyoutNavItem item={item} href={href} />
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={SIDEBAR_SUB_STYLE.collapsible}>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={item.title}
          className={cn(
            SIDEBAR_SUB_STYLE.collapsibleButton,
            isActive && SIDEBAR_SUB_STYLE.activeCollapsibleButton,
          )}
          render={<CollapsibleTrigger />}
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
        </SidebarMenuButton>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items!.map((subItem) => {
              const isSubActive = isUrlMatch(href, subItem.url)
              return (
                <SidebarMenuSubItem key={subItem.url}>
                  <SidebarMenuSubButton isActive={isSubActive} render={<Link to={subItem.url} />}>
                    {subItem.icon && <subItem.icon />}
                    <span>{subItem.title}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export const CollapsibleNavItem = memo(CollapsibleNavItemInner)
