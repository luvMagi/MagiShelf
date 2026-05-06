export type ThemeColors = {
  windowBackground: string
  appBackground: string
  panelBackground: string
  panelBackgroundAlt: string
  surfaceBackground: string
  surfaceBackgroundHover: string
  surfaceBackgroundActive: string
  inputBackground: string
  inputBackgroundStrong: string
  backdropColor: string
  borderSubtle: string
  borderStrong: string
  borderAccent: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  textFaint: string
  textOnAccent: string
  accent: string
  accentHover: string
  accentSoft: string
  accentText: string
  success: string
  successSoft: string
  warning: string
  warningSoft: string
  danger: string
  dangerSoft: string
  dangerText: string
  scrollbarThumb: string
  scrollbarThumbHover: string
  selectionBackground: string
}

export type ThemeDefinition = {
  id: string
  name: string
  colors: ThemeColors
}

export type ThemeCatalog = {
  filePath: string
  themes: ThemeDefinition[]
}
