import type { AppSidebarNavItem } from './types'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

interface AppSidebarColumnProps {
  items: AppSidebarNavItem[]
  selectedTitle: string | null
  onSelect?: () => void
}

export function AppSidebarColumn({ items, selectedTitle, onSelect }: AppSidebarColumnProps) {
  const navigate = useNavigate()

  const handleClick = (item: AppSidebarNavItem) => {
    if (item.items?.length) {
      navigate({ to: item.items[0].url })
    } else {
      navigate({ to: item.url })
    }
    onSelect?.()
  }

  return (
    <div className="flex w-16 shrink-0 flex-col border-r bg-sidebar">
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-1">
        {items.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => handleClick(item)}
            className={cn(
              'flex w-full cursor-pointer flex-col items-center gap-1 rounded-md px-1 py-2.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              selectedTitle === item.title && 'bg-sidebar-accent text-sidebar-primary',
            )}
          >
            {item.icon && <item.icon className="size-5" />}
            <span className="w-full truncate text-center text-[10px] leading-tight">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
