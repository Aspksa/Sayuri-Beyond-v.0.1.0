import type {
  ColorTheme,
  LayoutMode,
  PageTransitionType,
  RadiusValue,
  SiderMenuType,
} from '@/store'
import { Check, CircleHelp, ClipboardCheck, Copy, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/store'
import { env2boolean } from '@/lib/env'
import {
  ColorPreviewCard,
  LangPreview,
  LayoutModePreview,
  RadiusPreview,
  SiderMenuPreview,
  ThemeModePreview,
  TransitionPreview,
} from './setting-drawer-previews'

function SettingOption({
  isSelected,
  onClick,
  tooltip,
  children,
}: {
  isSelected: boolean
  onClick: () => void
  tooltip: string
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onClick}
        className={cn(
          'relative cursor-pointer rounded-md border p-1.5 transition-colors hover:border-primary',
          isSelected ? 'border-primary' : 'border-border',
        )}
      >
        {children}
        {isSelected && (
          <div className="absolute right-1 top-1 flex size-3.5 items-center justify-center rounded-full bg-primary">
            <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
          </div>
        )}
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

const COLOR_PRESETS: { name: ColorTheme; color: string; label: string }[] = [
  { name: 'zinc', color: '#71717a', label: 'Zinc' },
  { name: 'blue', color: '#3b82f6', label: 'Blue' },
  { name: 'green', color: '#22c55e', label: 'Green' },
  { name: 'orange', color: '#f97316', label: 'Orange' },
  { name: 'rose', color: '#f43f5e', label: 'Rose' },
  { name: 'violet', color: '#8b5cf6', label: 'Violet' },
]

const RADIUS_OPTIONS: { value: RadiusValue; label: string }[] = [
  { value: '0', label: '0' },
  { value: '0.3', label: '0.3' },
  { value: '0.5', label: '0.5' },
  { value: '0.75', label: '0.75' },
  { value: '1', label: '1' },
]

// ─── Tab sub-components ────────────────────────────────────────────────────

function AppearanceTab() {
  const { t } = useTranslation()
  const theme = useSettingsStore((s) => s.theme)
  const colorTheme = useSettingsStore((s) => s.colorTheme)
  const radius = useSettingsStore((s) => s.radius)
  const grayscale = useSettingsStore((s) => s.grayscale)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const setColorTheme = useSettingsStore((s) => s.setColorTheme)
  const setRadius = useSettingsStore((s) => s.setRadius)
  const setGrayscale = useSettingsStore((s) => s.setGrayscale)

  return (
    <TabsContent value="appearance" className="flex flex-col gap-3 overflow-y-auto p-4">
      {/* Theme Mode */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">{t('customConfig.themeMode.label')}</p>
        <TooltipProvider delay={300}>
          <div className="grid grid-cols-4 gap-1.5">
            {(
              [
                { value: 'light', labelKey: 'customConfig.themeMode.light' },
                { value: 'dark', labelKey: 'customConfig.themeMode.dark' },
                { value: 'system', labelKey: 'customConfig.themeMode.system' },
              ] as { value: 'light' | 'dark' | 'system'; labelKey: string }[]
            ).map(({ value, labelKey }) => (
              <SettingOption
                key={value}
                isSelected={theme === value}
                onClick={() => setTheme(value)}
                tooltip={t(labelKey)}
              >
                <ThemeModePreview mode={value} />
              </SettingOption>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* Primary Color */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">{t('customConfig.color')}</p>
        <TooltipProvider delay={300}>
          <div className="grid grid-cols-6 gap-1.5">
            {COLOR_PRESETS.map((preset) => (
              <SettingOption
                key={preset.name}
                isSelected={colorTheme === preset.name}
                onClick={() => setColorTheme(preset.name)}
                tooltip={t(`customConfig.colors.${preset.name}`)}
              >
                <ColorPreviewCard color={preset.color} />
              </SettingOption>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* Radius */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">{t('customConfig.radius')}</p>
        <TooltipProvider delay={300}>
          <div className="grid grid-cols-5 gap-1.5">
            {RADIUS_OPTIONS.map((option) => (
              <SettingOption
                key={option.value}
                isSelected={radius === option.value}
                onClick={() => setRadius(option.value)}
                tooltip={option.label}
              >
                <RadiusPreview value={option.value} />
              </SettingOption>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* Other */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">{t('customConfig.other')}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm">{t('customConfig.grayscale')}</span>
          <Switch checked={grayscale} onCheckedChange={setGrayscale} />
        </div>
      </div>
    </TabsContent>
  )
}

function LayoutTab() {
  const { t } = useTranslation()
  const layoutMode = useSettingsStore((s) => s.layoutMode)
  const siderMenuType = useSettingsStore((s) => s.siderMenuType)
  const autoSplitMenu = useSettingsStore((s) => s.autoSplitMenu)
  const setLayoutMode = useSettingsStore((s) => s.setLayoutMode)
  const setSiderMenuType = useSettingsStore((s) => s.setSiderMenuType)
  const setAutoSplitMenu = useSettingsStore((s) => s.setAutoSplitMenu)

  return (
    <TabsContent value="layout" className="flex flex-col gap-3 overflow-y-auto p-4">
      {/* Layout Mode */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">{t('customConfig.layoutMode.label')}</p>
        <TooltipProvider delay={300}>
          <div className="grid grid-cols-4 gap-1.5">
            {(
              [
                { value: 'side', labelKey: 'customConfig.layoutMode.side' },
                { value: 'top', labelKey: 'customConfig.layoutMode.top' },
                { value: 'mix', labelKey: 'customConfig.layoutMode.mix' },
                { value: 'column', labelKey: 'customConfig.layoutMode.column' },
              ] as { value: LayoutMode; labelKey: string }[]
            ).map(({ value, labelKey }) => (
              <SettingOption
                key={value}
                isSelected={layoutMode === value}
                onClick={() => setLayoutMode(value)}
                tooltip={t(labelKey)}
              >
                <LayoutModePreview mode={value} />
              </SettingOption>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* Auto Split Menu */}
      <div
        className={cn(
          'flex items-center justify-between',
          layoutMode !== 'mix' && 'opacity-40 pointer-events-none',
        )}
      >
        <span className="text-sm">{t('customConfig.autoSplitMenu')}</span>
        <Switch
          checked={autoSplitMenu && layoutMode === 'mix'}
          disabled={layoutMode !== 'mix'}
          onCheckedChange={setAutoSplitMenu}
        />
      </div>

      {/* Sider Menu Type */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">
          {t('customConfig.siderMenuType.label')}
        </p>
        <TooltipProvider delay={300}>
          <div className="grid grid-cols-4 gap-1.5">
            {(
              [
                { value: 'sub', labelKey: 'customConfig.siderMenuType.sub' },
                { value: 'group', labelKey: 'customConfig.siderMenuType.group' },
              ] as { value: SiderMenuType; labelKey: string }[]
            ).map(({ value, labelKey }) => (
              <SettingOption
                key={value}
                isSelected={siderMenuType === value}
                onClick={() => setSiderMenuType(value)}
                tooltip={t(labelKey)}
              >
                <SiderMenuPreview mode={value} />
              </SettingOption>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </TabsContent>
  )
}

function GeneralTab() {
  const { t } = useTranslation()
  const language = useSettingsStore((s) => s.language)
  const navigationProgress = useSettingsStore((s) => s.navigationProgress)
  const pageTransition = useSettingsStore((s) => s.pageTransition)
  const pageTransitionType = useSettingsStore((s) => s.pageTransitionType)
  const routeLoading = useSettingsStore((s) => s.routeLoading)
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const setNavigationProgress = useSettingsStore((s) => s.setNavigationProgress)
  const setPageTransition = useSettingsStore((s) => s.setPageTransition)
  const setPageTransitionType = useSettingsStore((s) => s.setPageTransitionType)
  const setRouteLoading = useSettingsStore((s) => s.setRouteLoading)

  return (
    <TabsContent value="general" className="flex flex-col gap-3 overflow-y-auto p-4">
      {/* Language */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">{t('customConfig.language')}</p>
        <TooltipProvider delay={300}>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { code: 'zh', label: '🇨🇳 中文' },
              { code: 'en', label: '🇺🇸 English' },
            ].map(({ code, label }) => (
              <SettingOption
                key={code}
                isSelected={language === code}
                onClick={() => setLanguage(code)}
                tooltip={label}
              >
                <LangPreview code={code} />
              </SettingOption>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* Animation */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">{t('customConfig.animation.label')}</p>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('customConfig.animation.navigationProgress')}</span>
            <Switch checked={navigationProgress} onCheckedChange={setNavigationProgress} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm">{t('customConfig.animation.routeLoading')}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-pointer text-muted-foreground">
                    <CircleHelp size={13} />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-52">
                    {t('customConfig.animation.routeLoadingDesc')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch checked={routeLoading} onCheckedChange={setRouteLoading} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('customConfig.animation.pageTransition')}</span>
            <Switch checked={pageTransition} onCheckedChange={setPageTransition} />
          </div>
          <div className={cn(!pageTransition && 'pointer-events-none opacity-40')}>
            <TooltipProvider delay={300}>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { value: 'fade', labelKey: 'customConfig.animation.pageTransitionType.fade' },
                    {
                      value: 'slide-up',
                      labelKey: 'customConfig.animation.pageTransitionType.slideUp',
                    },
                    {
                      value: 'slide-right',
                      labelKey: 'customConfig.animation.pageTransitionType.slideRight',
                    },
                    { value: 'zoom', labelKey: 'customConfig.animation.pageTransitionType.zoom' },
                  ] as { value: PageTransitionType; labelKey: string }[]
                ).map(({ value, labelKey }) => (
                  <SettingOption
                    key={value}
                    isSelected={pageTransitionType === value}
                    onClick={() => setPageTransitionType(value)}
                    tooltip={t(labelKey)}
                  >
                    <TransitionPreview type={value} />
                  </SettingOption>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </TabsContent>
  )
}

// ─── Main component ────────────────────────────────────────────────────────

export function SettingDrawer() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    },
    [],
  )

  const handleCopy = () => {
    const s = useSettingsStore.getState()
    const f = (v: unknown) => (typeof v === 'string' ? `'${v}'` : String(v))
    const code = `{
  // Appearance
  theme: ${f(s.theme)},
  colorTheme: ${f(s.colorTheme)},
  radius: ${f(s.radius)},
  grayscale: ${f(s.grayscale)},
  language: ${f(s.language)},
  // Layout
  layoutMode: ${f(s.layoutMode)},
  siderMenuType: ${f(s.siderMenuType)},
  autoSplitMenu: ${f(s.autoSplitMenu)},
  // Animation
  navigationProgress: ${f(s.navigationProgress)},
  pageTransition: ${f(s.pageTransition)},
  pageTransitionType: ${f(s.pageTransitionType)},
  routeLoading: ${f(s.routeLoading)},
}`
    navigator.clipboard.writeText(code)
    setCopied(true)
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = setTimeout(() => setCopied(false), 2000)
    toast.success(t('customConfig.copySuccess'), {
      description: t('customConfig.copySuccessDesc'),
    })
  }

  const enableMock = env2boolean(import.meta.env.VITE_ENABLE_MOCK)
  if (!enableMock) return null

  return (
    <Sheet>
      <SheetTrigger
        aria-label="Open settings"
        className="fixed bottom-8 right-0 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-l-lg bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
      >
        <Settings size={18} />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-75 max-w-75! flex-col gap-0 p-0"
        showCloseButton={false}
      >
        <SheetHeader className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <SheetTitle className="text-sm font-semibold">{t('customConfig.title')}</SheetTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-pointer text-muted-foreground">
                    <CircleHelp size={13} />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-52">
                    {t('customConfig.titleDesc')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              title={t('customConfig.copySettings')}
              className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground"
            >
              {copied ? (
                <ClipboardCheck size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
              {t('customConfig.copySettings')}
            </Button>
          </div>
        </SheetHeader>

        <Tabs defaultValue="appearance" className="min-h-0 flex-1 gap-0">
          <TabsList
            variant="line"
            className="h-10! w-full justify-start rounded-none border-b px-4"
          >
            <TabsTrigger value="appearance" className="cursor-pointer px-3">
              {t('customConfig.settingTab.appearance')}
            </TabsTrigger>
            <TabsTrigger value="layout" className="cursor-pointer px-3">
              {t('customConfig.settingTab.layout')}
            </TabsTrigger>
            <TabsTrigger value="general" className="cursor-pointer px-3">
              {t('customConfig.settingTab.general')}
            </TabsTrigger>
          </TabsList>
          <AppearanceTab />
          <LayoutTab />
          <GeneralTab />
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
