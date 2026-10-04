import http from '@/lib/http'

export interface UserMenu {
  id: number
  path: string
  i18nKey: string
  iconKey: string
  isLabel: boolean
  sorting: number
  parentId: number | null
}

export interface UserInfo {
  id: string
  email: string
  name: string
  avatar: string
  role: string
}

export async function fetchUserMenus(): Promise<UserMenu[]> {
  const res = await http.get<{ data: UserMenu[] }>('/api/user/menus')
  return res.data
}

export async function fetchUserInfo(): Promise<UserInfo> {
  const res = await http.get<{ data: UserInfo }>('/api/user/me')
  return res.data
}
