import type { MockPermission } from '../../data'
import { http, HttpResponse } from 'msw'
import { mockPermissions } from '../../data'
import { getNextId } from '../../utils'

const permissions = [...mockPermissions]

export const settingPermissionHandlers = [
  http.get('/api/setting/permissions', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const resource = url.searchParams.get('resource')
    const action = url.searchParams.get('action')

    let filtered = permissions
    if (resource) filtered = filtered.filter((p) => p.resource.includes(resource))
    if (action) filtered = filtered.filter((p) => p.action.includes(action))

    const start = (page - 1) * pageSize
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        items: filtered.slice(start, start + pageSize),
        pagination: { page, pageSize, total: filtered.length },
      },
    })
  }),

  http.post('/api/setting/permissions', async ({ request }) => {
    const body = (await request.json()) as Omit<MockPermission, 'id' | 'created_at' | 'updated_at'>
    const now = new Date().toISOString()
    const newItem: MockPermission = {
      ...body,
      id: getNextId('permission', permissions.length + 1),
      created_at: now,
      updated_at: now,
    }
    permissions.push(newItem)
    return HttpResponse.json({ code: 0, message: 'success', data: newItem }, { status: 201 })
  }),

  http.patch('/api/setting/permissions/:id', async ({ params, request }) => {
    const idx = permissions.findIndex((p) => p.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ code: 404, message: '权限不存在' }, { status: 404 })
    const body = (await request.json()) as Partial<MockPermission>
    permissions[idx] = { ...permissions[idx], ...body, updated_at: new Date().toISOString() }
    return HttpResponse.json({ code: 0, message: 'success', data: permissions[idx] })
  }),

  http.delete('/api/setting/permissions/:id', ({ params }) => {
    const idx = permissions.findIndex((p) => p.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ code: 404, message: '权限不存在' }, { status: 404 })
    permissions.splice(idx, 1)
    return HttpResponse.json({ code: 0, message: 'success' })
  }),
]
