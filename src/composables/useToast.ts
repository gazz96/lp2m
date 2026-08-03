import { reactive } from 'vue'

export interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

const state = reactive({
  toasts: [] as ToastItem[],
  _nextId: 0
})

export function useToast() {
  function add(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = ++state._nextId
    state.toasts.push({ id, message, type })
    setTimeout(() => {
      const idx = state.toasts.findIndex((t: ToastItem) => t.id === id)
      if (idx !== -1) state.toasts.splice(idx, 1)
    }, 3500)
  }

  function success(msg: string) { add(msg, 'success') }
  function error(msg: string) { add(msg, 'error') }
  function info(msg: string) { add(msg, 'info') }
  function remove(id: number) {
    const idx = state.toasts.findIndex((t: ToastItem) => t.id === id)
    if (idx !== -1) state.toasts.splice(idx, 1)
  }

  return { toasts: state.toasts, add, success, error, info, remove }
}
