export type SayuriRole = 'user' | 'assistant'

export interface SayuriTurn {
  role: SayuriRole
  content: string
}

export interface SayuriScreenContext {
  session_id: string
  route: string
  title?: string
  module?: string
  selected_entity?: string
  metadata?: Record<string, unknown>
}

export interface SayuriTimelineItem {
  id?: string
  created_at?: string
  category: string
  event: string
  label: string
  task_id?: string
  details: Record<string, unknown>
}

export interface SayuriChatResponse {
  task_id: string
  answer: string
  runtime: {
    provider: string
    model: string
    elapsed_ms: number
  }
  cognitive: {
    mode: string
    verification_required: boolean
    plan: Array<{ id: string; action: string; purpose: string }>
  }
  verification: {
    passed: boolean
    decision: string
    confidence: number
    blockers: string[]
    warnings: string[]
    scope: string
  }
  screen_context: SayuriScreenContext | null
  memory: {
    counts: {
      facts: number
      experiences: number
      strategies: number
      contradictions: number
    }
    references: Array<Record<string, unknown>>
  }
  skills: {
    available: number
    mcp_execution_enabled: boolean
  }
}

const SAYURI_CORE_URL =
  (import.meta.env.VITE_SAYURI_CORE_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://127.0.0.1:8765'

async function coreRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${SAYURI_CORE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let message = `SAYURI Core HTTP ${response.status}`
    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) message = body.detail
    } catch {
      // Keep the status-only error when the body is not JSON.
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export function updateSayuriScreenContext(context: SayuriScreenContext) {
  return coreRequest<SayuriScreenContext>('/v1/context/screen', {
    method: 'POST',
    body: JSON.stringify(context),
  })
}

export function sendSayuriMessage(input: {
  message: string
  session_id: string
  history: SayuriTurn[]
  context?: Record<string, unknown>
}) {
  return coreRequest<SayuriChatResponse>('/v1/chat', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function fetchSayuriTimeline(taskId?: string) {
  const query = new URLSearchParams({ limit: '30' })
  if (taskId) query.set('task_id', taskId)
  return coreRequest<{ items: SayuriTimelineItem[]; private_reasoning_exposed: boolean }>(
    `/v1/timeline?${query.toString()}`,
  )
}

export function fetchSayuriRuntimeStatus() {
  return coreRequest<{
    available: boolean
    provider: string
    model: string | null
    configured: boolean
    mode: string
  }>('/v1/runtime/status')
}
