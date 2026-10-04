export const SIDEBAR_SUB_STYLE = {
  menu: 'gap-0.5',
  collapsible: 'group/collapsible',
  collapsibleButton: 'cursor-pointer',
  activeCollapsibleButton: 'text-sidebar-primary',
} as const

export const SIDEBAR_GROUP_STYLE = {
  menu: 'gap-0.5',
  innerGroup: 'p-0',
  groupLabel: 'px-2 text-sidebar-foreground/70',
  separator: 'mx-3 w-auto! bg-sidebar-border',
} as const
