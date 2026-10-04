import type { LucideIcon } from 'lucide-react'
import { BarChart3, Key, Menu, Settings2, Shield, Users } from 'lucide-react'

export const iconMap = {
  BarChart3,
  Settings2,
  Users,
  Shield,
  Key,
  Menu,
} satisfies Record<string, LucideIcon>

export type IconKey = keyof typeof iconMap

/** 安全查找图标，未知 key 返回 undefined 而非类型谎言 */
export function getIcon(key: string): LucideIcon | undefined {
  return (iconMap as Record<string, LucideIcon | undefined>)[key]
}
