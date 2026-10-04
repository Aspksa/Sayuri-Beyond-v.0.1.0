import type { AppSidebarNavItem } from '../types'
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { isNavItemActive, isUrlMatch } from '../utils/nav-utils'

/**
 * header variant: static sections — parent items show as labels, children always visible.
 * column variant: accordion — parent items are buttons that expand/collapse children.
 */
interface MobileTreeNavProps {
  variant: 'header' | 'column'
  items: AppSidebarNavItem[]
  onClose: () => void
  initialExpandedTitle?: string | null
}

export function MobileTreeNav({
  variant,
  items,
  onClose,
  initialExpandedTitle,
}: MobileTreeNavProps) {
  const href = useLocation({ select: (l) => l.href })
  const [expandedTitle, setExpandedTitle] = useState<string | null>(initialExpandedTitle ?? null)

  return (
    <nav
      className={cn(
        'flex flex-col',
        variant === 'header' ? 'gap-0.5 p-2' : 'flex-1 overflow-y-auto',
      )}
    >
      {items.map((item) => {
        const isActive = isNavItemActive(href, item)
        const hasChildren = !!item.items?.length

        if (hasChildren) {
          if (variant === 'header') {
            return (
              <div key={item.url}>
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                    isActive ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {item.icon && <item.icon size={15} />}
                  {item.title}
                </div>
                <div className="ml-4 flex flex-col gap-0.5">
                  {item.items!.map((sub) => (
                    <Link
                      key={sub.url}
                      to={sub.url}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                        isUrlMatch(href, sub.url) ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {sub.icon && <sub.icon size={14} />}
                      {sub.title}
                    </Link>
                  ))}
                </div>
              </div>
            )
          }

          // column variant: accordion
          const isExpanded = expandedTitle === item.title
          return (
            <div key={item.url}>
              <button
                type="button"
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isExpanded ? 'text-primary font-medium' : 'text-sidebar-foreground',
                )}
                onClick={() => setExpandedTitle(isExpanded ? null : item.title)}
              >
                {item.icon && <item.icon className="size-4 shrink-0" />}
                <span className="flex-1 text-left">{item.title}</span>
                <ChevronRight
                  className={cn(
                    'size-3.5 opacity-50 transition-transform',
                    isExpanded && 'rotate-90',
                  )}
                />
              </button>
              {isExpanded && (
                <div className="border-l ml-4 pl-2 flex flex-col gap-0.5 pb-1">
                  {item.items!.map((sub) => (
                    <Link
                      key={sub.url}
                      to={sub.url}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        isUrlMatch(href, sub.url) ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {sub.icon && <sub.icon className="size-3.5 shrink-0" />}
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        }

        // Leaf item
        if (variant === 'header') {
          return (
            <Link
              key={item.title}
              to={item.url}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive ? 'text-foreground font-medium' : 'text-muted-foreground',
              )}
            >
              {item.icon && <item.icon size={15} />}
              {item.title}
            </Link>
          )
        }

        return (
          <Link
            key={item.url}
            to={item.url}
            onClick={onClose}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              isActive ? 'text-primary font-medium' : 'text-sidebar-foreground',
            )}
          >
            {item.icon && <item.icon className="size-4 shrink-0" />}
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
