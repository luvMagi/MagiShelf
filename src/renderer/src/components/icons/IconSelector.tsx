import React, { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'

type Props = {
  value?: string
  onChange: (iconId: string | undefined) => void
}

export function IconSelector({ value, onChange }: Props) {
  const { store } = useContext(StoreContext)

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => onChange(undefined)}
        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm transition-all
          ${!value
            ? 'theme-card border-[color:var(--border-accent)] theme-text-primary'
            : 'theme-card theme-card-interactive theme-text-muted'
          }`}
      >
        <span>No icon</span>
        {!value && <span className="text-xs theme-text-faint">Selected</span>}
      </button>

      {store.icons.length === 0 ? (
        <div className="rounded-xl border border-dashed px-3 py-4 text-sm theme-card theme-text-muted">
          No imported icons yet. Open Icon Manager on the home page first.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {store.icons.map((icon) => {
            const selected = value === icon.id

            return (
              <button
                key={icon.id}
                onClick={() => onChange(selected ? undefined : icon.id)}
                title={icon.code}
                className={`flex items-center justify-center rounded-2xl border p-3 aspect-square transition-all
                  ${selected
                    ? 'theme-card border-[color:var(--border-accent)] shadow-lg'
                    : 'theme-card theme-card-interactive'
                  }`}
              >
                <img
                  src={icon.previewDataUrl}
                  alt={icon.name}
                  className="w-full h-full max-w-12 max-h-12 rounded-xl object-cover theme-card"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
