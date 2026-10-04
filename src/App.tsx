import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { router } from './router'
import { queryClient } from '@/lib/query-client'
import './styles/index.css'

function APP() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="bottom-left" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default APP
