interface LoginHeaderProps {
  i18n: {
    title: string
    description: string
  }
}

export function LoginHeader({ i18n }: LoginHeaderProps) {
  return (
    <div className="flex flex-col gap-2 mb-4 items-center justify-center">
      <div className="flex items-center gap-2">
        <img src="/fast.svg" alt="logo" className="size-8" />
        <h1 className="text-2xl font-bold">{i18n.title}</h1>
      </div>
      <p className="text-sm text-muted-foreground">{i18n.description}</p>
    </div>
  )
}
