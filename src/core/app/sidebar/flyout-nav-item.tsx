import type { AppSidebarNavItem } from '../types'

import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { isNavItemActive, isUrlMatch } from '../utils/nav-utils'

export function FlyoutNavItem({ item, href }: { item: AppSidebarNavItem; href: string }) {
  const isActive = isNavItemActive(href, item)
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => setOpen(false), 80)
  }

  return (
    <SidebarMenuItem>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton
              tooltip={item.title}
              className={cn(isActive && 'text-sidebar-primary')}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          }
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          className="min-w-40"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {item.items!.map((subItem) => (
              <DropdownMenuItem
                key={subItem.url}
                render={<Link to={subItem.url} />}
                className={cn('h-8 gap-2 px-3', isUrlMatch(href, subItem.url) && 'text-primary')}
              >
                {subItem.icon && <subItem.icon className="size-4" />}
                {subItem.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
