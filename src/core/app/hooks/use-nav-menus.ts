import type { UserMenu } from '@/api/app'
import type { AppSidebarNavGroup, AppSidebarNavItem } from '../types'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchUserMenus } from '@/api/app'
import { getIcon } from '../utils/icon-map'

function toNavItem(
  menu: UserMenu,
  allMenus: UserMenu[],
  t: (key: string) => string,
): AppSidebarNavItem {
  const children = allMenus
    .filter((m) => m.parentId === menu.id)
    .sort((a, b) => a.sorting - b.sorting)
  return {
    title: t(menu.i18nKey),
    url: menu.path,
    icon: getIcon(menu.iconKey),
    items:
      children.length > 0
        ? children.map((c) => ({ title: t(c.i18nKey), url: c.path, icon: getIcon(c.iconKey) }))
        : undefined,
  }
}

function buildNavGroups(menus: UserMenu[], t: (key: string) => string): AppSidebarNavGroup[] {
  const groups: AppSidebarNavGroup[] = []
  const rootItems = menus.filter((m) => m.parentId === null).sort((a, b) => a.sorting - b.sorting)

  const standaloneItems = rootItems.filter((m) => !m.isLabel)
  if (standaloneItems.length > 0) {
    groups.push({ items: standaloneItems.map((m) => toNavItem(m, menus, t)) })
  }

  for (const labelNode of rootItems.filter((m) => m.isLabel)) {
    const children = menus
      .filter((m) => m.parentId === labelNode.id)
      .sort((a, b) => a.sorting - b.sorting)
    groups.push({
      label: t(labelNode.i18nKey),
      items: children.map((m) => toNavItem(m, menus, t)),
    })
  }

  return groups
}

export function useNavMenus() {
  const { t } = useTranslation()
  const { data: rawMenus, ...rest } = useQuery({
    queryKey: ['user', 'menus'],
    queryFn: fetchUserMenus,
  })
  const data = useMemo(() => (rawMenus ? buildNavGroups(rawMenus, t) : undefined), [rawMenus, t])
  return { data, ...rest }
}
