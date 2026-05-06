export type ShellType = 'powershell' | 'cmd' | 'git-bash'

export type BookSettings = {
  defaultWorkingDir?: string
  defaultShell?: ShellType
  defaultRunMode?: 'direct' | 'prepare'
  defaultEnv?: Record<string, string>
  beforeRunConfirm?: boolean
  keepTerminalOpen?: boolean
}

export type Book = {
  id: string
  shelfId: string
  name: string
  subtitle?: string
  description?: string
  icon?: string
  cover?: string
  color?: string
  primaryTagId?: string
  tagIds: string[]
  order: number
  settings: BookSettings
  createdAt: string
  updatedAt: string
}
