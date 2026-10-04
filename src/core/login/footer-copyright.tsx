import { cn } from '@/lib/utils'

interface FooterCopyrightProps {
  className?: string
  copyright: string
}

export function FooterCopyright({ className, copyright }: FooterCopyrightProps) {
  return (
    <footer className={cn('py-3 text-xs', className)}>
      <div className="text-center">
        <p className="text-muted-foreground">{copyright}</p>
      </div>
    </footer>
  )
}
