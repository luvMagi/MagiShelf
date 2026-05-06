import { ShellType } from './book'
import { EntryActionType } from './entry'

export type EffectiveEntryConfig = {
  actionType: EntryActionType
  workingDir?: string
  shell: ShellType
  runMode: 'direct' | 'prepare'
  command?: string
  args: string[]
  appPath?: string
  folderPath?: string
  filePath?: string
  url?: string
  env: Record<string, string>
  requireConfirm: boolean
  keepTerminalOpen: boolean
  runAsAdmin: boolean
}
