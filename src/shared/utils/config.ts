import { Book } from '../types/book'
import { Entry } from '../types/entry'
import { AppSettings } from '../types/store'
import { EffectiveEntryConfig } from '../types/config'

export function resolveEffectiveEntryConfig(params: {
  book: Book
  entry: Entry
  appSettings: AppSettings
}): EffectiveEntryConfig {
  const { book, entry, appSettings } = params

  return {
    actionType: entry.actionType,

    workingDir: entry.settings.workingDir ?? book.settings.defaultWorkingDir,

    shell: entry.settings.shell ?? book.settings.defaultShell ?? appSettings.defaultShell,

    runMode:
      entry.settings.runMode ?? book.settings.defaultRunMode ?? appSettings.defaultRunMode,

    command: entry.settings.command,
    args: entry.settings.args ?? [],

    appPath: entry.settings.appPath,
    folderPath: entry.settings.folderPath,
    filePath: entry.settings.filePath,
    url: entry.settings.url,

    env: {
      ...(book.settings.defaultEnv ?? {}),
      ...(entry.settings.env ?? {})
    },

    requireConfirm:
      entry.settings.requireConfirm ?? book.settings.beforeRunConfirm ?? false,

    keepTerminalOpen:
      entry.settings.keepTerminalOpen ?? book.settings.keepTerminalOpen ?? true,

    runAsAdmin: entry.settings.runAsAdmin ?? false
  }
}
