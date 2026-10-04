import { http, HttpResponse } from 'msw'
import { mockUserMenus, mockUsers } from '../data'

export const userHandlers = [
  http.get('/api/user/me', ({ request }) => {
    const auth = request.headers.get('Authorization')
    const token = auth?.replace('Bearer ', '')
    const user =
      mockUsers.find(
        (u) => token === `mock-access-token-${u.role === 'admin' ? 'admin' : 'user'}`,
      ) ?? mockUsers[0]

    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    })
  }),

  http.get('/api/user/menus', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: mockUserMenus,
    })
  }),
]
