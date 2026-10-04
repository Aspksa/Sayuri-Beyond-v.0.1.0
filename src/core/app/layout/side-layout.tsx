import { Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppFooter } from '../components/app-footer'
import { AppSidebar } from '../app-sidebar'

export function SideLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </div>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  )
}
