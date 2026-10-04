export interface MockSettingUser {
  id: number
  email: string
  user_name: string
  nick_name: string
  status: number
  last_login: string
  created_at: string
  updated_at: string
}

export const mockSettingUsers: MockSettingUser[] = [
  {
    id: 1,
    email: 'admin@test.com',
    user_name: 'admin',
    nick_name: 'Admin',
    status: 1,
    last_login: '2025-03-20T10:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-03-20T10:00:00Z',
  },
  {
    id: 2,
    email: 'user@test.com',
    user_name: 'user01',
    nick_name: 'User 01',
    status: 1,
    last_login: '2025-03-19T08:30:00Z',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-03-19T08:30:00Z',
  },
  {
    id: 3,
    email: 'editor@test.com',
    user_name: 'editor01',
    nick_name: 'Editor 01',
    status: 0,
    last_login: '2025-02-20T14:00:00Z',
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-20T14:00:00Z',
  },
  {
    id: 4,
    email: 'alice@test.com',
    user_name: 'alice',
    nick_name: 'Alice',
    status: 1,
    last_login: '2025-03-18T09:00:00Z',
    created_at: '2025-02-10T00:00:00Z',
    updated_at: '2025-03-18T09:00:00Z',
  },
  {
    id: 5,
    email: 'bob@test.com',
    user_name: 'bob',
    nick_name: 'Bob',
    status: 1,
    last_login: '2025-03-17T16:45:00Z',
    created_at: '2025-02-15T00:00:00Z',
    updated_at: '2025-03-17T16:45:00Z',
  },
  {
    id: 6,
    email: 'charlie@test.com',
    user_name: 'charlie',
    nick_name: 'Charlie',
    status: 0,
    last_login: '2025-03-01T11:20:00Z',
    created_at: '2025-02-20T00:00:00Z',
    updated_at: '2025-03-01T11:20:00Z',
  },
  {
    id: 7,
    email: 'diana@test.com',
    user_name: 'diana',
    nick_name: 'Diana',
    status: 1,
    last_login: '2025-03-16T13:10:00Z',
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-16T13:10:00Z',
  },
  {
    id: 8,
    email: 'eve@test.com',
    user_name: 'eve',
    nick_name: 'Eve',
    status: 1,
    last_login: '2025-03-15T10:55:00Z',
    created_at: '2025-03-05T00:00:00Z',
    updated_at: '2025-03-15T10:55:00Z',
  },
]
