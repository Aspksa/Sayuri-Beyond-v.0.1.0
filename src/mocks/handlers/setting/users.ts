import { http, HttpResponse } from 'msw'
import { mockSettingUsers } from '../../data'

// 运行时可变副本
const users = [...mockSettingUsers]

export const settingUserHandlers = [
  http.get('/api/setting/users', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const start = (page - 1) * pageSize

    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        items: users.slice(start, start + pageSize),
        pagination: { page, pageSize, total: users.length },
      },
    })
  }),

  http.get('/api/setting/users/:id', ({ params }) => {
    const user = users.find((u) => u.id === Number(params.id))
    if (!user) return HttpResponse.json({ code: 404, message: '用户不存在' }, { status: 404 })
    return HttpResponse.json({ code: 0, message: 'success', data: user })
  }),

  http.patch('/api/setting/users/:id', async ({ params, request }) => {
    const idx = users.findIndex((u) => u.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ code: 404, message: '用户不存在' }, { status: 404 })
    const body = (await request.json()) as Partial<(typeof users)[0]>
    users[idx] = { ...users[idx], ...body, updated_at: new Date().toISOString() }
    return HttpResponse.json({ code: 0, message: 'success', data: users[idx] })
  }),

  http.delete('/api/setting/users/:id', ({ params }) => {
    const idx = users.findIndex((u) => u.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ code: 404, message: '用户不存在' }, { status: 404 })
    users.splice(idx, 1)
    return HttpResponse.json({ code: 0, message: 'success' })
  }),
]
