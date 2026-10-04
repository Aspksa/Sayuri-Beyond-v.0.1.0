import { useSettingsStore } from '@/store'
import { ColumnLayout } from './layout/column-layout'
import { MixLayout } from './layout/mix-layout'
import { SideLayout } from './layout/side-layout'
import { TopLayout } from './layout/top-layout'
import { NavigationProgress } from './components/navigation-progress'
import { SettingDrawer } from './settings/setting-drawer'
import { useApplySettings } from './hooks/use-apply-settings'

export function AppLayout() {
  useApplySettings()
  const layoutMode = useSettingsStore((s) => s.layoutMode)
  const navigationProgress = useSettingsStore((s) => s.navigationProgress)

  return (
    <>
      {navigationProgress && <NavigationProgress />}
      {layoutMode === 'top' && <TopLayout />}
      {layoutMode === 'mix' && <MixLayout />}
      {layoutMode === 'side' && <SideLayout />}
      {layoutMode === 'column' && <ColumnLayout />}
      <SettingDrawer />
    </>
  )
}
