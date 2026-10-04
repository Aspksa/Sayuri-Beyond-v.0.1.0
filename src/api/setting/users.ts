import { queryOptions } from '@tanstack/react-query'
import http from '@/lib/http'

export interface SettingUser {
  id: number
  email: string
  user_name: string
  nick_name: string
  status: number
  last_login: string
  created_at: string
  updated_at: string
}

interface UsersResponse {
  data: {
    items: SettingUser[]
    pagination: { page: number; pageSize: number; total: number }
  }
}

export async function fetchUsers(page: number, pageSize: number) {
  const res = await http.get<UsersResponse>('/api/setting/users', {
    params: { page, pageSize },
  })
  return res.data
}

export async function updateUser(id: number, data: Partial<SettingUser>) {
  const res = await http.patch<{ data: SettingUser }>(`/api/setting/users/${id}`, data)
  return res.data
}

export async function deleteUser(id: number) {
  await http.delete(`/api/setting/users/${id}`)
}

export function usersQueryOptions(page: number, pageSize: number) {
  return queryOptions({
    queryKey: ['setting', 'users', page],
    queryFn: () => fetchUsers(page, pageSize),
  })
}
