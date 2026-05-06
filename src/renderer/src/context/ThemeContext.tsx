import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { defaultThemeDefinitions } from '../../../shared/data/defaultThemes'
import { ThemeCatalog, ThemeDefinition } from '../../../shared/types/theme'
import { StoreContext } from './StoreContext'
import { getThemeCatalog } from '../services/themeService'

type ThemeContextValue = {
  themes: ThemeDefinition[]
  activeTheme: ThemeDefinition
  themeFilePath: string | null
  loading: boolean
  setTheme: (themeId: string) => Promise<void>
  refreshThemes: () => Promise<void>
}

const fallbackTheme = defaultThemeDefinitions[0]

export const ThemeContext = createContext<ThemeContextValue>({
  themes: defaultThemeDefinitions,
  activeTheme: fallbackTheme,
  themeFilePath: null,
  loading: true,
  setTheme: async () => {},
  refreshThemes: async () => {}
})

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { store, updateStore, loading: storeLoading } = useContext(StoreContext)
  const [catalog, setCatalog] = useState<ThemeCatalog | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshThemes = useCallback(async () => {
    setLoading(true)
    try {
      const nextCatalog = await getThemeCatalog()
      setCatalog(nextCatalog)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshThemes()
  }, [refreshThemes])

  const themes = catalog?.themes.length ? catalog.themes : defaultThemeDefinitions
  const activeTheme = useMemo(
    () =>
      themes.find((theme) => theme.id === store.appSettings.theme) ??
      themes.find((theme) => theme.id === 'dark') ??
      themes[0] ??
      fallbackTheme,
    [store.appSettings.theme, themes]
  )

  useEffect(() => {
    if (storeLoading || !activeTheme) return

    const root = document.documentElement
    root.dataset.theme = activeTheme.id

    for (const [token, value] of Object.entries(activeTheme.colors)) {
      const cssName = `--${toKebabCase(token)}`
      root.style.setProperty(cssName, value)
    }

    document.body.style.backgroundColor = activeTheme.colors.appBackground
    document.body.style.color = activeTheme.colors.textPrimary
  }, [activeTheme, storeLoading])

  const setTheme = useCallback(
    async (themeId: string) => {
      await updateStore((prev) => ({
        ...prev,
        appSettings: {
          ...prev.appSettings,
          theme: themeId
        }
      }))
    },
    [updateStore]
  )

  return (
    <ThemeContext.Provider
      value={{
        themes,
        activeTheme,
        themeFilePath: catalog?.filePath ?? null,
        loading,
        setTheme,
        refreshThemes
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
}
