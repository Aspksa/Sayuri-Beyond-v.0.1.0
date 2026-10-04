import { createFileRoute } from '@tanstack/react-router'
import { NotFound } from '@/core/not-found'

export const Route = createFileRoute('/_auth/$')({
  component: NotFound,
})
