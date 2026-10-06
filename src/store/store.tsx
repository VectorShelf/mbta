import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Activity, DemoState } from '../data/types'
import { createSeed } from '../data/seed'

const KEY = 'fgti-demo-state-v1'

function load(): DemoState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState
      if (parsed.version === 1) return parsed
    }
  } catch {
    /* تخزين غير متاح — نبدأ من البيانات الأصلية */
  }
  return createSeed()
}

export interface Toast { id: number; text: string; tone: 'success' | 'error' }
type Log = Omit<Activity, 'id' | 'at'>

interface Store {
  state: DemoState
  mutate: (fn: (draft: DemoState) => void, log?: Log) => void
  toast: (text: string, tone?: Toast['tone']) => void
  reset: () => void
  toasts: Toast[]
}

const Ctx = createContext<Store | null>(null)
let uid = Date.now()
export const newId = (p: string) => `${p}-${(uid++).toString(36)}`

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(load)
  const [toasts, setToasts] = useState<Toast[]>([])
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const mutate = useCallback((fn: (d: DemoState) => void, log?: Log) => {
    setState((prev) => {
      const draft = structuredClone(prev)
      fn(draft)
      if (log) draft.activity.unshift({ id: newId('AC'), at: new Date().toISOString(), ...log })
      return draft
    })
  }, [])

  const toast = useCallback((text: string, tone: Toast['tone'] = 'success') => {
    const id = uid++
    setToasts((t) => [...t, { id, text, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])

  const reset = useCallback(() => {
    const fresh = createSeed()
    setState(fresh)
    toast('أُعيدت بيانات الديمو إلى حالتها الأصلية')
  }, [toast])

  const value = useMemo(() => ({ state, mutate, toast, reset, toasts }), [state, mutate, toast, reset, toasts])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('StoreProvider missing')
  return s
}
