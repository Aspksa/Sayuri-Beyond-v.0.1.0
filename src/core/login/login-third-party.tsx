import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LoginThirdPartyProps {
  withGithub?: boolean
  withGoogle?: boolean
  i18n: {
    description: string
    github: string
    google: string
  }
}

export function LoginThirdParty({ withGithub, withGoogle, i18n }: LoginThirdPartyProps) {
  const handleLoginClick = async (_platform: string) => {
    // TODO: 接入第三方登录
  }

  return (
    <div className="flex flex-col justify-start items-center mb-4 gap-2">
      <div className="w-full relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          {i18n.description}
        </span>
      </div>
      <div className="flex justify-center gap-3 w-full">
        {withGithub && (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleLoginClick('github')}
            className={cn('flex text-sm gap-3 ring-offset-background', 'w-1/2')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M12,0.3C5.42,0.304 0.007,5.72 0.007,12.3C0.007,17.447 3.319,22.047 8.2,23.68C8.8,23.8 9.03,23.42 9.03,23.11L9,21.07C5.66,21.79 4.96,19.46 4.96,19.46C4.41,18.07 3.62,17.7 3.62,17.7C2.54,16.96 3.71,16.97 3.71,16.97C4.91,17.06 5.55,18.21 5.55,18.21C6.62,20.04 8.35,19.51 9.04,19.21C9.14,18.43 9.46,17.9 9.8,17.6C7.14,17.3 4.33,16.27 4.33,11.67C4.33,10.36 4.8,9.29 5.57,8.45C5.43,8.15 5.03,6.93 5.67,5.27C5.67,5.27 6.67,4.95 8.97,6.5C10.935,5.969 13.005,5.969 14.97,6.5C17.25,4.95 18.26,5.27 18.26,5.27C18.9,6.93 18.5,8.15 18.38,8.45C19.187,9.326 19.628,10.479 19.61,11.67C19.61,16.28 16.81,17.3 14.13,17.59C14.55,17.95 14.94,18.69 14.94,19.81L14.93,23.1C14.93,23.41 15.13,23.79 15.75,23.67C20.617,22.028 23.914,17.436 23.914,12.3C23.914,5.749 18.55,0.347 12,0.3"
              />
            </svg>
            {i18n.github}
          </Button>
        )}
        {withGoogle && (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleLoginClick('google')}
            className={cn('flex text-sm gap-3 ring-offset-background', 'w-1/2')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#EA4335"
                d="M5.27 9.76A7.08 7.08 0 0 1 16.42 6.5L19.9 3A11.97 11.97 0 0 0 1.24 6.65l4.03 3.11Z"
              />
              <path
                fill="#34A853"
                d="M16.04 18.01A7.4 7.4 0 0 1 12 19.1a7.08 7.08 0 0 1-6.72-4.82l-4.04 3.06A11.96 11.96 0 0 0 12 24a11.4 11.4 0 0 0 7.83-3l-3.79-2.99Z"
              />
              <path
                fill="#4A90E2"
                d="M19.83 21c2.2-2.05 3.62-5.1 3.62-9 0-.7-.1-1.47-.27-2.18H12v4.63h6.44a5.4 5.4 0 0 1-2.4 3.56l3.8 2.99Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27a7.12 7.12 0 0 1-.01-4.5L1.24 6.64A11.93 11.93 0 0 0 0 12c0 1.92.44 3.73 1.24 5.33l4.04-3.06Z"
              />
            </svg>
            {i18n.google}
          </Button>
        )}
      </div>
    </div>
  )
}
