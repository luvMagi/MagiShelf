import React from 'react'
import { useTheme } from '../../context/ThemeContext'

export function ThemePanel() {
  const { themes, activeTheme, themeFilePath, loading, setTheme, refreshThemes } = useTheme()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium theme-text-primary">Theme Library</p>
          <p className="text-xs theme-text-muted mt-1">
            Switch between built-in themes or edit the JSON file to define your own colors.
          </p>
        </div>
        <button
          onClick={() => void refreshThemes()}
          className="px-3 py-2 rounded-xl text-sm font-medium theme-ghost-button"
        >
          {loading ? 'Reloading...' : 'Reload Themes'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {themes.map((theme) => {
          const selected = theme.id === activeTheme.id
          return (
            <button
              key={theme.id}
              onClick={() => void setTheme(theme.id)}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                selected
                  ? 'theme-card border-[color:var(--border-accent)] shadow-lg'
                  : 'theme-card theme-card-interactive'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium theme-text-primary">{theme.name}</p>
                  <p className="text-xs theme-text-muted mt-1">{theme.id}</p>
                </div>
                {selected && (
                  <span className="px-2 py-1 rounded-full text-[10px] font-medium theme-accent-pill">
                    Active
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <ThemeSwatch color={theme.colors.appBackground} label="App" />
                <ThemeSwatch color={theme.colors.panelBackground} label="Panel" />
                <ThemeSwatch color={theme.colors.surfaceBackground} label="Surface" />
                <ThemeSwatch color={theme.colors.accent} label="Accent" />
                <ThemeSwatch color={theme.colors.textPrimary} label="Text" />
              </div>
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border p-4 theme-panel-alt">
        <p className="text-xs font-medium uppercase tracking-wide theme-text-muted">Theme JSON</p>
        <p className="text-sm theme-text-secondary mt-2">
          Edit this file to customize built-in themes or add your own theme IDs.
        </p>
        {themeFilePath && (
          <code className="mt-3 block rounded-xl px-3 py-2 text-xs break-all theme-code-block">
            {themeFilePath}
          </code>
        )}
        <p className="text-xs theme-text-muted mt-3">
          After saving the JSON file, click Reload Themes to refresh the list.
        </p>
      </div>
    </div>
  )
}

function ThemeSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full px-2.5 py-1 theme-swatch-pill">
      <span
        className="block h-3 w-3 rounded-full border theme-swatch-dot"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] font-medium theme-text-muted">{label}</span>
    </div>
  )
}
