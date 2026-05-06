import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { defaultThemeDefinitions } from '../../shared/data/defaultThemes'
import { ThemeCatalog, ThemeColors, ThemeDefinition } from '../../shared/types/theme'

type ThemeFileData = {
  themes?: ThemeDefinition[]
}

const themeColorKeys = Object.keys(defaultThemeDefinitions[0].colors) as Array<keyof ThemeColors>
const legacyBuiltinLightTextColors = {
  textSecondary: 'rgba(15, 23, 42, 0.78)',
  textMuted: 'rgba(15, 23, 42, 0.56)',
  textFaint: 'rgba(15, 23, 42, 0.36)'
} satisfies Partial<ThemeColors>

export async function initializeWorkspaceThemes(workspacePath: string): Promise<void> {
  const filePath = getWorkspaceThemeFilePath(workspacePath)
  if (!existsSync(filePath)) {
    await writeThemeFile(filePath, defaultThemeDefinitions)
  }
}

export async function getWorkspaceThemeCatalog(workspacePath: string): Promise<ThemeCatalog> {
  const filePath = getWorkspaceThemeFilePath(workspacePath)
  const themes = await loadThemes(filePath)

  return {
    filePath,
    themes
  }
}

function getWorkspaceThemeFilePath(workspacePath: string): string {
  return join(workspacePath, 'themes.json')
}

async function loadThemes(filePath: string): Promise<ThemeDefinition[]> {
  if (!existsSync(filePath)) {
    await writeThemeFile(filePath, defaultThemeDefinitions)
    return cloneDefaultThemes()
  }

  try {
    const raw = await readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as ThemeFileData
    const normalized = normalizeThemes(parsed.themes)

    if (normalized.length === 0) {
      await writeThemeFile(filePath, defaultThemeDefinitions)
      return cloneDefaultThemes()
    }

    return normalized
  } catch {
    await writeThemeFile(filePath, defaultThemeDefinitions)
    return cloneDefaultThemes()
  }
}

function normalizeThemes(themes: ThemeDefinition[] | undefined): ThemeDefinition[] {
  const normalizedCustomThemes: ThemeDefinition[] = []
  const seenIds = new Set<string>()

  for (const theme of themes ?? []) {
    const normalized = upgradeLegacyBuiltinTheme(normalizeTheme(theme))
    if (!normalized || seenIds.has(normalized.id)) continue
    seenIds.add(normalized.id)
    normalizedCustomThemes.push(normalized)
  }

  const customById = new Map(normalizedCustomThemes.map((theme) => [theme.id, theme]))
  const mergedThemes = defaultThemeDefinitions.map(
    (theme) => customById.get(theme.id) ?? cloneTheme(theme)
  )

  for (const theme of normalizedCustomThemes) {
    if (!defaultThemeDefinitions.some((defaultTheme) => defaultTheme.id === theme.id)) {
      mergedThemes.push(theme)
    }
  }

  return mergedThemes
}

function upgradeLegacyBuiltinTheme(theme: ThemeDefinition | null): ThemeDefinition | null {
  if (!theme || theme.id !== 'light') return theme

  if (
    theme.colors.textSecondary === legacyBuiltinLightTextColors.textSecondary &&
    theme.colors.textMuted === legacyBuiltinLightTextColors.textMuted &&
    theme.colors.textFaint === legacyBuiltinLightTextColors.textFaint
  ) {
    const latestLightTheme = defaultThemeDefinitions.find((item) => item.id === 'light')
    if (!latestLightTheme) return theme

    return {
      ...theme,
      colors: {
        ...theme.colors,
        textSecondary: latestLightTheme.colors.textSecondary,
        textMuted: latestLightTheme.colors.textMuted,
        textFaint: latestLightTheme.colors.textFaint
      }
    }
  }

  return theme
}

function normalizeTheme(theme: ThemeDefinition | null | undefined): ThemeDefinition | null {
  if (!theme) return null

  const id = theme.id?.trim()
  if (!id) return null

  const fallbackTheme =
    defaultThemeDefinitions.find((defaultTheme) => defaultTheme.id === id) ??
    defaultThemeDefinitions[0]

  return {
    id,
    name: theme.name?.trim() || id,
    colors: normalizeThemeColors(theme.colors, fallbackTheme.colors)
  }
}

function normalizeThemeColors(
  colors: Partial<ThemeColors> | undefined,
  fallbackColors: ThemeColors
): ThemeColors {
  return themeColorKeys.reduce((result, key) => {
    const value = colors?.[key]
    result[key] = typeof value === 'string' && value.trim() ? value : fallbackColors[key]
    return result
  }, {} as ThemeColors)
}

async function writeThemeFile(filePath: string, themes: ThemeDefinition[]): Promise<void> {
  await writeFile(
    filePath,
    JSON.stringify({ themes }, null, 2),
    'utf8'
  )
}

function cloneDefaultThemes(): ThemeDefinition[] {
  return defaultThemeDefinitions.map(cloneTheme)
}

function cloneTheme(theme: ThemeDefinition): ThemeDefinition {
  return {
    ...theme,
    colors: { ...theme.colors }
  }
}
