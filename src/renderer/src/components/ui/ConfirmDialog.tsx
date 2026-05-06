import React, { createContext, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ConfirmState = {
  message: string
  detail?: string
  confirmLabel?: string
  resolve: (value: boolean) => void
} | null

type ConfirmFn = (
  message: string,
  detail?: string,
  confirmLabel?: string
) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn>(async () => false)

export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext)
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>(null)

  const confirm: ConfirmFn = (message, detail, confirmLabel = 'Delete') => {
    return new Promise((resolve) => {
      setState({ message, detail, confirmLabel, resolve })
    })
  }

  function respond(value: boolean) {
    state?.resolve(value)
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {state && (
          <>
            <motion.div
              key="confirm-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 backdrop-blur-sm z-[100]"
              style={{ backgroundColor: 'var(--backdrop-color)' }}
              onClick={() => respond(false)}
            />
            <motion.div
              key="confirm-dialog"
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
            >
              <div
                className="pointer-events-auto w-[360px] rounded-2xl border shadow-2xl overflow-hidden theme-panel"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="h-0.5 w-full"
                  style={{ background: 'linear-gradient(to right, var(--danger), transparent)' }}
                />

                <div className="px-6 py-5">
                  <h3 className="text-base font-semibold theme-text-primary">{state.message}</h3>
                  {state.detail && (
                    <p className="text-sm theme-text-muted mt-1.5 leading-relaxed">{state.detail}</p>
                  )}
                </div>

                <div className="flex gap-2 px-6 pb-5">
                  <button
                    onClick={() => respond(false)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium transition-all theme-ghost-button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => respond(true)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium transition-all theme-danger-button"
                  >
                    {state.confirmLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  )
}
