import type { AppSidebarNavItem } from '../types'
import { CollapsibleNavItem } from './collapsible-nav-item'

export function SubNavItem({ item, href }: { item: AppSidebarNavItem; href: string }) {
  return <CollapsibleNavItem item={item} href={href} />
}
