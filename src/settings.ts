/**
 * 项目配置文件
 * 修改此处自定义应用默认值，刷新页面即可生效（无需清除缓存）
 */

export type ColorTheme = 'zinc' | 'blue' | 'green' | 'orange' | 'rose' | 'violet'
export type RadiusValue = '0' | '0.3' | '0.5' | '0.75' | '1'
export type SiderMenuType = 'sub' | 'group'
export type LayoutMode = 'side' | 'top' | 'mix' | 'column'
export type PageTransitionType = 'fade' | 'slide-up' | 'slide-right' | 'zoom'

export interface AppSettings {
  // Appearance
  theme: 'light' | 'dark' | 'system'
  colorTheme: ColorTheme
  radius: RadiusValue
  grayscale: boolean
  language: string
  // Layout
  layoutMode: LayoutMode
  siderMenuType: SiderMenuType
  autoSplitMenu: boolean
  // Animation
  navigationProgress: boolean
  pageTransition: boolean
  pageTransitionType: PageTransitionType
  // Loading
  routeLoading: boolean
}

export const settings: AppSettings = {
  // Appearance
  theme: 'light',
  colorTheme: 'violet',
  radius: '0.5',
  grayscale: false,
  language: 'en',
  // Layout
  layoutMode: 'side',
  siderMenuType: 'sub',
  autoSplitMenu: false,
  // Animation
  navigationProgress: true,
  pageTransition: true,
  pageTransitionType: 'slide-up',
  // Loading
  routeLoading: true,
}
