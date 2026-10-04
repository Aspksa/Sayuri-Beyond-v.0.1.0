import { Check, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const localeOptions: Record<string, { title: string; icon: React.ReactNode }> = {
  en: {
    title: 'English',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width="18" height="18">
        <rect width="30" height="20" fill="#012169" />
        <path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" strokeWidth="4" />
        <path d="M15,0 V20 M0,10 H30" stroke="#fff" strokeWidth="6" />
        <path d="M15,0 V20 M0,10 H30" stroke="#C8102E" strokeWidth="4" />
      </svg>
    ),
  },
  zh: {
    title: '中文',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width="18" height="18">
        <defs>
          <path
            id="s"
            d="M0,-1 0.587785,0.809017 -0.951057,-0.309017H0.951057L-0.587785,0.809017z"
            fill="#ffde00"
          />
        </defs>
        <rect width="30" height="20" fill="#de2910" />
        <use xlinkHref="#s" transform="translate(5,5) scale(3)" />
        <use xlinkHref="#s" transform="translate(10,2) rotate(23.036243)" />
        <use xlinkHref="#s" transform="translate(12,4) rotate(45.869898)" />
        <use xlinkHref="#s" transform="translate(12,7) rotate(69.945396)" />
        <use xlinkHref="#s" transform="translate(10,9) rotate(20.659808)" />
      </svg>
    ),
  },
}

export function LocalSwitcher() {
  const { i18n } = useTranslation()
  const locales = (i18n.options.supportedLngs || []).filter((lng) => lng !== 'cimode')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Select language"
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Languages size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {locales.map((locale) => {
          const option = localeOptions[locale]
          if (!option) return null
          return (
            <DropdownMenuItem key={locale} onClick={() => i18n.changeLanguage(locale)}>
              <span className="flex items-center gap-2">
                {option.icon}
                {option.title}
              </span>
              {i18n.language === locale && <Check size={14} className="ml-auto text-primary" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
