import { create } from 'zustand'

interface SayuriScreenContextState {
  module?: string
  title?: string
  selectedEntity?: string
  metadata: Record<string, unknown>
  setScreenContext: (
    context: Partial<
      Pick<SayuriScreenContextState, 'module' | 'title' | 'selectedEntity' | 'metadata'>
    >,
  ) => void
  clearScreenContext: () => void
}

export const useSayuriScreenContextStore = create<SayuriScreenContextState>((set) => ({
  module: undefined,
  title: undefined,
  selectedEntity: undefined,
  metadata: {},
  setScreenContext: (context) =>
    set((state) => ({
      ...state,
      ...context,
      metadata: context.metadata ?? state.metadata,
    })),
  clearScreenContext: () =>
    set({
      module: undefined,
      title: undefined,
      selectedEntity: undefined,
      metadata: {},
    }),
}))
