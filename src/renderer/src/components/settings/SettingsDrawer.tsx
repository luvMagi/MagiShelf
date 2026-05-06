import React from 'react'

type Props = {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function SettingsDrawer({ open, title, onClose, children }: Props) {
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 backdrop-blur-sm z-40 transition-opacity duration-200"
        style={{
          backgroundColor: 'var(--backdrop-color)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none'
        }}
      />

      <div
        className="fixed right-0 top-0 bottom-0 w-[420px] border-l z-50 flex flex-col shadow-2xl transition-transform duration-200 ease-out theme-panel"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="font-semibold theme-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors theme-ghost-button"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {open && children}
        </div>
      </div>
    </>
  )
}
