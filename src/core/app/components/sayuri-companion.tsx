import { useEffect, useMemo, useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import {
  Activity,
  BrainCircuit,
  Database,
  LoaderCircle,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import {
  fetchSayuriRuntimeStatus,
  fetchSayuriTimeline,
  sendSayuriMessage,
  updateSayuriScreenContext,
  type SayuriTimelineItem,
  type SayuriTurn,
} from '@/api/sayuri'
import { useSayuriScreenContextStore } from '@/store/sayuri'

interface UiMessage extends SayuriTurn {
  id: string
  meta?: {
    mode?: string
    verified?: boolean
    provider?: string
    memory?: number
  }
}

function getSessionId() {
  const key = 'sayuri.session.id'
  const existing = window.sessionStorage.getItem(key)
  if (existing) return existing
  const value = `sayuri-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  window.sessionStorage.setItem(key, value)
  return value
}

function compactDetails(details: Record<string, unknown>) {
  const text = JSON.stringify(details)
  return text.length > 140 ? `${text.slice(0, 139)}…` : text
}

export function SayuriCompanion() {
  const href = useLocation({ select: (location) => location.href })
  const sessionId = useMemo(getSessionId, [])
  const screen = useSayuriScreenContextStore()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [timeline, setTimeline] = useState<SayuriTimelineItem[]>([])
  const [runtime, setRuntime] = useState<{
    available: boolean
    provider: string
    model: string | null
    configured: boolean
    mode: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const routeModule =
    screen.module ??
    href
      .split('?')[0]
      .split('/')
      .filter(Boolean)[0] ??
    'home'

  useEffect(() => {
    void updateSayuriScreenContext({
      session_id: sessionId,
      route: href,
      title: screen.title ?? document.title,
      module: routeModule,
      selected_entity: screen.selectedEntity,
      metadata: screen.metadata,
    }).catch(() => {
      // The UI shell must remain usable even when the local Core is offline.
    })
  }, [
    href,
    routeModule,
    screen.metadata,
    screen.selectedEntity,
    screen.title,
    sessionId,
  ])

  async function refreshPanel(taskId?: string) {
    const [runtimeResult, timelineResult] = await Promise.allSettled([
      fetchSayuriRuntimeStatus(),
      fetchSayuriTimeline(taskId),
    ])

    if (runtimeResult.status === 'fulfilled') {
      setRuntime(runtimeResult.value)
    }
    if (timelineResult.status === 'fulfilled') {
      setTimeline(timelineResult.value.items)
    }
  }

  useEffect(() => {
    if (open) void refreshPanel()
  }, [open])

  async function submit() {
    const message = input.trim()
    if (!message || pending) return

    const history = messages.slice(-12).map(({ role, content }) => ({ role, content }))
    const userMessage: UiMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: message,
    }

    setMessages((current) => [...current, userMessage])
    setInput('')
    setPending(true)
    setError(null)

    try {
      const result = await sendSayuriMessage({
        message,
        session_id: sessionId,
        history,
        context: {
          module: routeModule,
          selected_entity: screen.selectedEntity,
        },
      })

      const memoryCount = Object.values(result.memory.counts).reduce(
        (total, value) => total + value,
        0,
      )

      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: result.answer,
          meta: {
            mode: result.cognitive.mode,
            verified: result.verification.passed,
            provider: result.runtime.provider,
            memory: memoryCount,
          },
        },
      ])
      await refreshPanel(result.task_id)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'SAYURI Core недоступен')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[80]">
      {open ? (
        <section
          className="flex h-[min(720px,calc(100vh-2rem))] w-[min(430px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          aria-label="Sayuri assistant"
        >
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <strong className="text-sm">Sayuri</strong>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  {runtime?.provider ?? 'core'}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {routeModule} · {href}
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setOpen(false)}
              aria-label="Закрыть Sayuri"
            >
              <X size={17} />
            </button>
          </header>

          <div className="grid grid-cols-3 gap-2 border-b border-border bg-muted/20 px-3 py-2 text-[11px]">
            <div className="flex items-center gap-1.5 truncate text-muted-foreground">
              <BrainCircuit size={13} />
              {runtime?.model ?? 'runtime'}
            </div>
            <div className="flex items-center gap-1.5 truncate text-muted-foreground">
              <Database size={13} />
              context on
            </div>
            <div className="flex items-center gap-1.5 truncate text-muted-foreground">
              <ShieldCheck size={13} />
              verifier on
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
                  <p className="text-sm font-medium">Я вижу текущий раздел проекта.</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Спросите о том, что открыто сейчас. Контекст экрана используется
                    временно и сам по себе не становится долговременной памятью.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={
                        message.role === 'user'
                          ? 'ml-10 rounded-2xl rounded-br-md bg-primary px-3 py-2.5 text-sm text-primary-foreground'
                          : 'mr-6 rounded-2xl rounded-bl-md border border-border bg-card px-3 py-2.5 text-sm'
                      }
                    >
                      <p className="whitespace-pre-wrap leading-5">{message.content}</p>
                      {message.meta && (
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                          <span>{message.meta.mode}</span>
                          <span>·</span>
                          <span>{message.meta.provider}</span>
                          <span>·</span>
                          <span>memory {message.meta.memory ?? 0}</span>
                          <span>·</span>
                          <span>{message.meta.verified ? 'verified' : 'review'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {pending && (
                    <div className="mr-16 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-xs text-muted-foreground">
                      <LoaderCircle className="animate-spin" size={14} />
                      Sayuri обрабатывает запрос…
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}

              {timeline.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium">
                    <Activity size={14} />
                    Cognitive Timeline
                  </div>
                  <div className="space-y-2">
                    {timeline.slice(0, 6).map((item) => (
                      <div key={item.id ?? `${item.event}-${item.created_at}`} className="text-[11px]">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">{item.label}</span>
                          <span className="shrink-0 text-muted-foreground">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>
                        {Object.keys(item.details).length > 0 && (
                          <div className="mt-0.5 truncate text-muted-foreground">
                            {compactDetails(item.details)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form
              className="border-t border-border p-3"
              onSubmit={(event) => {
                event.preventDefault()
                void submit()
              }}
            >
              <div className="rounded-xl border border-border bg-card p-2 focus-within:ring-2 focus-within:ring-ring/30">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void submit()
                    }
                  }}
                  rows={3}
                  placeholder="Спросить Sayuri…"
                  className="w-full resize-none bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="px-1 text-[10px] text-muted-foreground">
                    Enter — отправить · Shift+Enter — строка
                  </span>
                  <button
                    type="submit"
                    disabled={pending || !input.trim()}
                    className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Отправить сообщение"
                  >
                    {pending ? <LoaderCircle className="animate-spin" size={15} /> : <Send size={15} />}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-14 items-center justify-center rounded-2xl border border-border bg-background text-primary shadow-xl transition-transform hover:scale-[1.03]"
          aria-label="Открыть Sayuri"
          title="Sayuri"
        >
          <Sparkles size={23} />
        </button>
      )}
    </div>
  )
}
