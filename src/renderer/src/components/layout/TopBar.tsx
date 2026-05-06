import React, { useContext } from 'react'
import { NavContext } from '../../context/NavContext'
import { StoreContext } from '../../context/StoreContext'
import { WorkspaceContext } from '../../context/WorkspaceContext'

const noDrag = { WebkitAppRegion: 'no-drag' } as React.CSSProperties
const drag = { WebkitAppRegion: 'drag' } as React.CSSProperties

export function TopBar() {
  const { page, currentShelfId, currentBookId, goBack } = useContext(NavContext)
  const { store } = useContext(StoreContext)
  const { activeWorkspace } = useContext(WorkspaceContext)

  const shelf = store.shelves.find((s) => s.id === currentShelfId)
  const book = store.books.find((b) => b.id === currentBookId)

  return (
    <div
      className="flex items-center h-12 border-b flex-shrink-0 theme-panel"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center px-3" style={noDrag}>
        {page !== 'home' ? (
          <button
            onClick={goBack}
            className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors theme-ghost-button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <div className="w-7 h-7" />
        )}
      </div>

      <div className="flex-1 flex items-center gap-2 text-sm min-w-0" style={drag}>
        <span className="font-medium select-none theme-text-muted">MagiShelf</span>
        {activeWorkspace && (
          <>
            <span className="select-none theme-text-faint">/</span>
            <span className="truncate select-none" style={{ color: 'var(--success)' }}>
              {activeWorkspace.name}
            </span>
          </>
        )}
        {shelf && (
          <>
            <span className="select-none theme-text-faint">/</span>
            <span className="truncate select-none theme-text-secondary">{shelf.name}</span>
          </>
        )}
        {book && (
          <>
            <span className="select-none theme-text-faint">/</span>
            <span className="font-medium truncate select-none theme-text-primary">{book.name}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1 px-2" style={noDrag}>
        <WinButton onClick={() => window.magiShelf.window.minimize()} label="-" />
        <WinButton onClick={() => window.magiShelf.window.close()} label="X" danger />
      </div>
    </div>
  )
}

function WinButton({
  onClick,
  label,
  danger
}: {
  onClick: () => void
  label: string
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`min-w-8 h-7 px-2 flex items-center justify-center rounded text-xs font-medium transition-colors ${
        danger
          ? 'hover:bg-red-500/80 theme-text-muted hover:text-white'
          : 'theme-ghost-button'
      }`}
    >
      {label}
    </button>
  )
}
