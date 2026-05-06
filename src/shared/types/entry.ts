import { ShellType } from './book'

export type EntryActionType =
  | 'open-app'
  | 'open-folder'
  | 'open-file'
  | 'open-url'
  | 'run-command'
  | 'prepare-powershell'

export type EntrySettings = {
  workingDir?: string
  command?: string
  args?: string[]
  appPath?: string
  folderPath?: string
  filePath?: string
  url?: string
  shell?: ShellType
  runMode?: 'direct' | 'prepare'
  env?: Record<string, string>
  requireConfirm?: boolean
  keepTerminalOpen?: boolean
  runAsAdmin?: boolean
}

export type Entry = {
  id: string
  bookId: string
  name: string
  description?: string
  icon?: string
  color?: string
  order: number
  actionType: EntryActionType
  settings: EntrySettings
  createdAt: string
  updatedAt: string
}
