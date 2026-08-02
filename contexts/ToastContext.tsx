'use client'

import { createContext, useContext, useState, useCallback } from 'react'

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: ToastMessage[]
  showToast: (message: string, type?: ToastMessage['type'], duration?: number) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  showToast: () => {},
  dismissToast: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success', duration = 3000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type, duration }])
    setTimeout(() => dismissToast(id), duration)
  }, [dismissToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
