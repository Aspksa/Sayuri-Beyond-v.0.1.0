import { Outlet } from '@tanstack/react-router'
import { AppFooter } from '../components/app-footer'
import { AppHeader } from '../components/app-header'

export function TopLayout() {
  return (
    <div className="flex h-svh flex-col">
      <AppHeader showLogo showNav />
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <Outlet />
      </div>
      <AppFooter />
    </div>
  )
}
