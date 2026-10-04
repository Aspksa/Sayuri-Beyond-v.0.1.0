export interface MockMenu {
  id: number
  name: string
  i18nKey: string | undefined
  iconKey: string | undefined
  path: string
  isLabel: boolean
  active: boolean
  sorting: number
  parentId: number | null
  enabled: boolean
  created_at: string
  updated_at: string
}

export const mockMenus: MockMenu[] = [
  {
    id: 1,
    name: 'Dashboard',
    i18nKey: 'sidebar.dashboard',
    iconKey: 'BarChart3',
    path: '/dashboard',
    isLabel: false,
    active: true,
    sorting: 1,
    parentId: null,
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '设置',
    i18nKey: 'sidebar.setting.title',
    iconKey: 'Settings2',
    path: '/setting',
    isLabel: false,
    active: true,
    sorting: 2,
    parentId: null,
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: '用户管理',
    i18nKey: 'sidebar.setting.users',
    iconKey: 'Users',
    path: '/setting/users',
    isLabel: false,
    active: true,
    sorting: 1,
    parentId: 2,
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 4,
    name: '角色管理',
    i18nKey: 'sidebar.setting.roles',
    iconKey: 'Shield',
    path: '/setting/roles',
    isLabel: false,
    active: true,
    sorting: 2,
    parentId: 2,
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 5,
    name: '权限管理',
    i18nKey: 'sidebar.setting.permissions',
    iconKey: 'Key',
    path: '/setting/permissions',
    isLabel: false,
    active: true,
    sorting: 3,
    parentId: 2,
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 6,
    name: '菜单管理',
    i18nKey: 'sidebar.setting.menus',
    iconKey: 'Menu',
    path: '/setting/menus',
    isLabel: false,
    active: true,
    sorting: 4,
    parentId: 2,
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
]
