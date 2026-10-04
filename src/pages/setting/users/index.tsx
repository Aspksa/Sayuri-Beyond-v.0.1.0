import type { SettingUser } from '@/api/setting/users'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { deleteUser, updateUser, usersQueryOptions } from '@/api/setting/users'

export function UsersPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [editUser, setEditUser] = useState<SettingUser | null>(null)
  const [editForm, setEditForm] = useState({ nick_name: '', status: '1' })
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(usersQueryOptions(page, pageSize))

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<SettingUser> }) => updateUser(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setting', 'users'] })
      setEditUser(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setting', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setDeleteId(null)
    },
  })

  const openEdit = (user: SettingUser) => {
    setEditUser(user)
    setEditForm({ nick_name: user.nick_name, status: String(user.status) })
  }

  const handleUpdate = () => {
    if (!editUser) return
    updateMutation.mutate({
      id: editUser.id,
      body: { nick_name: editForm.nick_name, status: Number(editForm.status) },
    })
  }

  const users = data?.items ?? []
  const total = data?.pagination.total ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('setting.users.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('setting.users.total', { count: total })}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">{t('setting.users.col.id')}</th>
              <th className="px-4 py-3 text-left font-medium">
                {t('setting.users.col.nick_name')}
              </th>
              <th className="px-4 py-3 text-left font-medium">
                {t('setting.users.col.user_name')}
              </th>
              <th className="px-4 py-3 text-left font-medium">{t('setting.users.col.email')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('setting.users.col.status')}</th>
              <th className="px-4 py-3 text-left font-medium">
                {t('setting.users.col.last_login')}
              </th>
              <th className="px-4 py-3 text-right font-medium">{t('setting.users.col.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? ['r1', 'r2', 'r3', 'r4', 'r5'].map((rk) => (
                  <tr key={rk} className="border-b">
                    {['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'].map((ck) => (
                      <td key={ck} className="px-4 py-3">
                        <div className="h-4 rounded bg-muted animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground">{user.id}</td>
                    <td className="px-4 py-3 font-medium">{user.nick_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.user_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.status === 1 ? 'default' : 'secondary'}>
                        {user.status === 1
                          ? t('setting.users.status.enabled')
                          : t('setting.users.status.disabled')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.last_login).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(user.id)}>
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('setting.users.pagination.page', { page, total: totalPages })}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t('setting.users.pagination.prev')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('setting.users.pagination.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Edit Sheet */}
      <Sheet open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <SheetContent side="right" className="w-96 p-0 gap-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>{t('setting.users.edit.title')}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-5 px-6 py-6">
            <div className="flex flex-col gap-1.5">
              <Label>{t('setting.users.edit.user_name')}</Label>
              <Input value={editUser?.user_name ?? ''} disabled className="bg-muted" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('setting.users.edit.email')}</Label>
              <Input value={editUser?.email ?? ''} disabled className="bg-muted" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nick_name">{t('setting.users.edit.nick_name')}</Label>
              <Input
                id="nick_name"
                value={editForm.nick_name}
                onChange={(e) => setEditForm((f) => ({ ...f, nick_name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('setting.users.edit.status')}</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) => v && setEditForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t('setting.users.status.enabled')}</SelectItem>
                  <SelectItem value="0">{t('setting.users.status.disabled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="px-6">
            <Button variant="outline" onClick={() => setEditUser(null)}>
              {t('setting.users.edit.cancel')}
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending
                ? t('setting.users.edit.saving')
                : t('setting.users.edit.save')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('setting.users.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('setting.users.delete.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('setting.users.delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}>
              {t('setting.users.delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
