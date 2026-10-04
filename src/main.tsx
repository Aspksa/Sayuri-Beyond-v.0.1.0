import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import APP from './App.tsx'
import { env2boolean } from '@/lib/env'
import '@/i18n'

const ENABLE_MOCK = env2boolean(import.meta.env.VITE_ENABLE_MOCK)

// 是否启动 MSW 由环境变量控制，默认仅在开发环境开启
async function enableMocking() {
  if (!ENABLE_MOCK) {
    return
  }

  const { worker } = await import('./mocks')

  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <APP />
    </StrictMode>,
  )
})
