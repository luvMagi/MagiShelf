import React, { useContext } from 'react'
import { Book } from '../../../../shared/types/book'
import { StoreContext } from '../../context/StoreContext'

type Props = {
  book: Book
  onEditSettings: () => void
}

export function BookHeader({ book, onEditSettings }: Props) {
  const { store } = useContext(StoreContext)
  const accentColor = book.color ?? '#8b5cf6'
  const iconAsset = store.icons.find((icon) => icon.id === book.icon)
  const fallbackLabel = book.name.slice(0, 1).toUpperCase()

  return (
    <div className="px-6 py-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className="w-16 h-16 rounded-[22px] overflow-hidden flex items-center justify-center text-xl font-semibold flex-shrink-0"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            {iconAsset ? (
              <img
                src={iconAsset.previewDataUrl}
                alt={iconAsset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              fallbackLabel
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold theme-text-primary">{book.name}</h1>
            {book.subtitle && <p className="text-sm theme-text-muted mt-0.5">{book.subtitle}</p>}
            {book.description && <p className="text-sm theme-text-faint mt-2 max-w-2xl">{book.description}</p>}

            <div className="flex flex-wrap gap-3 mt-3 text-xs theme-text-muted">
              {book.settings.defaultWorkingDir && (
                <span className="flex items-center gap-1">
                  <span className="theme-text-muted">dir</span>
                  <span className="font-mono theme-text-secondary truncate max-w-xs">{book.settings.defaultWorkingDir}</span>
                </span>
              )}
              {book.settings.defaultShell && (
                <span className="flex items-center gap-1">
                  <span className="theme-text-muted">shell</span>
                  <span className="theme-text-secondary">{book.settings.defaultShell}</span>
                </span>
              )}
              {book.settings.defaultRunMode && (
                <span className="flex items-center gap-1">
                  <span className="theme-text-muted">mode</span>
                  <span className="theme-text-secondary">{book.settings.defaultRunMode}</span>
                </span>
              )}
            </div>

            <div className="flex gap-1.5 mt-3 flex-wrap">
              {book.tagIds.map((tid) => {
                const tag = store.tags.find((t) => t.id === tid)
                if (!tag) return null
                return (
                  <span
                    key={tid}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${tag.color ?? accentColor}20`, color: tag.color ?? accentColor }}
                  >
                    {tag.name}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        <button
          onClick={onEditSettings}
          className="flex-shrink-0 px-3 py-2 rounded-xl text-sm transition-all theme-ghost-button"
        >
          Settings
        </button>
      </div>
    </div>
  )
}
