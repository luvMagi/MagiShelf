import React, { useState } from 'react'

const PRESET_COLORS = [
  // violet / purple
  '#8b5cf6', '#7c3aed', '#a78bfa', '#6d28d9',
  // blue
  '#3b82f6', '#2563eb', '#60a5fa', '#1d4ed8',
  // cyan
  '#06b6d4', '#0891b2', '#67e8f9', '#0e7490',
  // teal / green
  '#10b981', '#059669', '#34d399', '#047857',
  // yellow / amber
  '#f59e0b', '#d97706', '#fbbf24', '#b45309',
  // orange
  '#f97316', '#ea580c', '#fb923c', '#c2410c',
  // red / rose
  '#ef4444', '#dc2626', '#f87171', '#b91c1c',
  // pink
  '#ec4899', '#db2777', '#f472b6', '#be185d',
  // slate / neutral
  '#64748b', '#475569', '#94a3b8', '#334155',
]

type Props = {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: Props) {
  const [tab, setTab] = useState<'preset' | 'custom'>('preset')

  return (
    <div className="flex flex-col gap-3">
      {/* tab bar */}
      <div className="flex gap-1 p-1 rounded-lg w-fit theme-card">
        <TabBtn active={tab === 'preset'} onClick={() => setTab('preset')}>Presets</TabBtn>
        <TabBtn active={tab === 'custom'} onClick={() => setTab('custom')}>Custom</TabBtn>
      </div>

      {tab === 'preset' && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-8 gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onChange(color)}
                title={color}
                className="w-7 h-7 rounded-lg transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                style={{ backgroundColor: color }}
              >
                {value === color && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          {/* preview */}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ backgroundColor: value }} />
            <span className="text-xs font-mono theme-text-muted">{value}</span>
          </div>
        </div>
      )}

      {tab === 'custom' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-12 rounded-xl border bg-transparent cursor-pointer p-0.5"
              style={{ borderColor: 'var(--border-subtle)' }}
            />
            <div className="flex flex-col gap-1">
              <span className="text-xs theme-text-muted">Click to open color picker</span>
              <span className="text-xs font-mono theme-text-secondary">{value}</span>
            </div>
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const v = e.target.value
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v)
            }}
            placeholder="#rrggbb"
            className="w-full px-3 py-2 rounded-lg text-sm font-mono theme-input"
          />
        </div>
      )}
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-xs font-medium transition-all
        ${active ? 'theme-card theme-text-primary' : 'theme-text-muted hover:text-[color:var(--text-secondary)]'}`}
    >
      {children}
    </button>
  )
}
