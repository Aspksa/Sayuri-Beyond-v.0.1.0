import type { LucideIcon } from 'lucide-react'

export interface AppSidebarNavItem {
  title: string
  url: string
  icon?: LucideIcon
  items?: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}

export interface AppSidebarNavGroup {
  label?: string
  items: AppSidebarNavItem[]
}
