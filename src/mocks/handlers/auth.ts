import { http, HttpResponse } from 'msw'
import { mockTokens, mockUsers } from '../data'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = (await request.json()) as { email: string; password: string }
    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return HttpResponse.json({ code: 401, message: '邮箱或密码错误' }, { status: 401 })
    }

    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
        ...mockTokens[email],
      },
    })
  }),

  http.delete('/api/auth/logout', () => {
    return HttpResponse.json({ code: 0, message: 'success' })
  }),
]
