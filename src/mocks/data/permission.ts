export interface MockPermission {
  id: number
  resource: string
  action: string
  description: string
  enabled: boolean
  created_at: string
  updated_at: string
}

export const mockPermissions: MockPermission[] = [
  {
    id: 1,
    resource: 'user',
    action: 'read',
    description: '查看用户',
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    resource: 'user',
    action: 'create',
    description: '创建用户',
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 3,
    resource: 'user',
    action: 'update',
    description: '更新用户',
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 4,
    resource: 'user',
    action: 'delete',
    description: '删除用户',
    enabled: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 5,
    resource: 'role',
    action: 'read',
    description: '查看角色',
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 6,
    resource: 'role',
    action: 'create',
    description: '创建角色',
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 7,
    resource: 'role',
    action: 'update',
    description: '更新角色',
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 8,
    resource: 'role',
    action: 'delete',
    description: '删除角色',
    enabled: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 9,
    resource: 'menu',
    action: 'read',
    description: '查看菜单',
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 10,
    resource: 'menu',
    action: 'create',
    description: '创建菜单',
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
]
