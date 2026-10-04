import { authHandlers } from './auth'
import { settingMenuHandlers, settingPermissionHandlers, settingUserHandlers } from './setting'
import { userHandlers } from './user'

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...settingUserHandlers,
  ...settingPermissionHandlers,
  ...settingMenuHandlers,
]
