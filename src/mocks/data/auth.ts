export const mockUsers = [
  {
    id: '1',
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Admin',
    avatar: '',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@test.com',
    password: 'user123',
    name: 'User',
    avatar: '',
    role: 'user',
  },
]

export const mockTokens: Record<string, { accessToken: string; refreshToken: string }> = {
  'admin@test.com': {
    accessToken: 'mock-access-token-admin',
    refreshToken: 'mock-refresh-token-admin',
  },
  'user@test.com': {
    accessToken: 'mock-access-token-user',
    refreshToken: 'mock-refresh-token-user',
  },
}
