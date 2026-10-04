import type { MockMenu } from '../../data'
import { http, HttpResponse } from 'msw'
import { mockMenus } from '../../data'
import { getNextId } from '../../utils'

const menus = [...mockMenus]

export const settingMenuHandlers = [
  http.get('/api/setting/menus', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const start = (page - 1) * pageSize

    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        items: menus.slice(start, start + pageSize),
        pagination: { page, pageSize, total: menus.length },
      },
    })
  }),

  http.post('/api/setting/menus', async ({ request }) => {
    const body = (await request.json()) as Omit<MockMenu, 'id' | 'created_at' | 'updated_at'>
    const now = new Date().toISOString()
    const newItem: MockMenu = {
      ...body,
      id: getNextId('menu', menus.length + 1),
      created_at: now,
      updated_at: now,
    }
    menus.push(newItem)
    return HttpResponse.json({ code: 0, message: 'success', data: newItem }, { status: 201 })
  }),

  http.patch('/api/setting/menus/:id', async ({ params, request }) => {
    const idx = menus.findIndex((m) => m.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ code: 404, message: '菜单不存在' }, { status: 404 })
    const body = (await request.json()) as Partial<MockMenu>
    menus[idx] = { ...menus[idx], ...body, updated_at: new Date().toISOString() }
    return HttpResponse.json({ code: 0, message: 'success', data: menus[idx] })
  }),

  http.delete('/api/setting/menus/:id', ({ params }) => {
    const idx = menus.findIndex((m) => m.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ code: 404, message: '菜单不存在' }, { status: 404 })
    menus.splice(idx, 1)
    return HttpResponse.json({ code: 0, message: 'success' })
  }),
]
