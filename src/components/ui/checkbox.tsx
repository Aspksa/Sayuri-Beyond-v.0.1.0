'use client'

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { CheckIcon, MinusIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface CheckboxProps {
  checked?: boolean | 'indeterminate'
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

function Checkbox({ checked, onCheckedChange, disabled, className, id }: CheckboxProps) {
  const isIndeterminate = checked === 'indeterminate'

  return (
    <CheckboxPrimitive.Root
      id={id}
      data-slot="checkbox"
      checked={isIndeterminate ? false : (checked ?? false)}
      indeterminate={isIndeterminate}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        'peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center [border-radius:calc(var(--radius)/2)] border border-input bg-background shadow-xs transition-colors outline-none',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
        'data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground',
        className,
      )}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        {isIndeterminate ? (
          <MinusIcon className="size-3" strokeWidth={3} />
        ) : (
          <CheckIcon className="size-3" strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
