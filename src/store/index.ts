import type {
  ColorTheme,
  LayoutMode,
  PageTransitionType,
  RadiusValue,
  SiderMenuType,
} from '@/settings'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import i18n from '@/i18n'
import { settings } from '@/settings'

// Re-export types for backwards compatibility
export type {
  ColorTheme,
  LayoutMode,
  PageTransitionType,
  RadiusValue,
  SiderMenuType,
} from '@/settings'

interface SettingsState {
  theme: string
  colorTheme: ColorTheme
  radius: RadiusValue
  grayscale: boolean
  siderMenuType: SiderMenuType
  layoutMode: LayoutMode
  autoSplitMenu: boolean
  language: string
  navigationProgress: boolean
  pageTransition: boolean
  pageTransitionType: PageTransitionType
  routeLoading: boolean
  setTheme: (theme: string) => void
  setColorTheme: (colorTheme: ColorTheme) => void
  setRadius: (radius: RadiusValue) => void
  setGrayscale: (grayscale: boolean) => void
  setSiderMenuType: (siderMenuType: SiderMenuType) => void
  setLayoutMode: (layoutMode: LayoutMode) => void
  setAutoSplitMenu: (autoSplitMenu: boolean) => void
  setLanguage: (language: string) => void
  setNavigationProgress: (navigationProgress: boolean) => void
  setPageTransition: (pageTransition: boolean) => void
  setPageTransitionType: (pageTransitionType: PageTransitionType) => void
  setRouteLoading: (routeLoading: boolean) => void
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  theme: settings.theme,
  colorTheme: settings.colorTheme,
  radius: settings.radius,
  grayscale: settings.grayscale,
  siderMenuType: settings.siderMenuType,
  layoutMode: settings.layoutMode,
  autoSplitMenu: settings.autoSplitMenu,
  language: settings.language,
  navigationProgress: settings.navigationProgress,
  pageTransition: settings.pageTransition,
  pageTransitionType: settings.pageTransitionType,
  routeLoading: settings.routeLoading,
  setTheme: (theme) => set({ theme }),
  setColorTheme: (colorTheme) => set({ colorTheme }),
  setRadius: (radius) => set({ radius }),
  setGrayscale: (grayscale) => set({ grayscale }),
  setSiderMenuType: (siderMenuType) => set({ siderMenuType }),
  setLayoutMode: (layoutMode) => set({ layoutMode }),
  setAutoSplitMenu: (autoSplitMenu) => set({ autoSplitMenu }),
  setLanguage: (language) => {
    i18n.changeLanguage(language)
    set({ language })
  },
  setNavigationProgress: (navigationProgress) => set({ navigationProgress }),
  setPageTransition: (pageTransition) => set({ pageTransition }),
  setPageTransitionType: (pageTransitionType) => set({ pageTransitionType }),
  setRouteLoading: (routeLoading) => set({ routeLoading }),
}))

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  setAccessToken: (accessToken: string | null) => void
  setRefreshToken: (refreshToken: string | null) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set) => ({
        accessToken: null,
        refreshToken: null,
        setAccessToken: (accessToken) => set({ accessToken }),
        setRefreshToken: (refreshToken) => set({ refreshToken }),
        reset: () => set({ accessToken: null, refreshToken: null }),
      })),
      {
        name: 'auth.store',
        partialize: (state) => ({
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
        }),
      },
    ),
    {
      name: 'Auth Store',
      enabled: import.meta.env.DEV,
    },
  ),
)
