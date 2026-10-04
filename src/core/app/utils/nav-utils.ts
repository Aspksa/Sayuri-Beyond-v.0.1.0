import type { AppSidebarNavItem } from '../types'

/**
 * Exact URL match, ignoring query string.
 * e.g. isUrlMatch('/setting/users?page=2', '/setting/users') → true
 */
export function isUrlMatch(href: string, url: string): boolean {
  return href.split('?')[0].split('#')[0] === url
}

/**
 * Active check for a nav item.
 * - Leaf nodes: exact match (ignoring query string)
 * - Parent nodes: prefix match OR any child matches exactly
 */
export function isNavItemActive(
  href: string,
  item: Pick<AppSidebarNavItem, 'url' | 'items'>,
): boolean {
  if (item.items?.length) {
    return (
      href.startsWith(item.url) ||
      item.items.some((sub: AppSidebarNavItem) => isUrlMatch(href, sub.url))
    )
  }
  return isUrlMatch(href, item.url)
}
