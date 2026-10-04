import { Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useSettingsStore } from '@/store'
import { AppFooter } from '../components/app-footer'
import { AppHeader } from '../components/app-header'
import { AppSidebar } from '../app-sidebar'

const MIX_SIDEBAR_STYLE = { top: '3.5rem', height: 'calc(100svh - 3.5rem)' }

export function MixLayout() {
  const autoSplitMenu = useSettingsStore((s) => s.autoSplitMenu)

  return (
    <div className="flex h-svh flex-col">
      <AppHeader showLogo showNav={autoSplitMenu} navVariant="mix" />
      <SidebarProvider className="flex-1 min-h-0">
        <AppSidebar style={MIX_SIDEBAR_STYLE} />
        <SidebarInset>
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </div>
          <AppFooter />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
