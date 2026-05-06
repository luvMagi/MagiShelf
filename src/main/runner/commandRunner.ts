import { RunEntryPayload, RunEntryResult } from '../../shared/types/runner'
import { resolveEffectiveEntryConfig } from '../../shared/utils/config'
import { openApp, openFolder, openFile, openUrl, runCommand } from './openRunner'
import { preparePowerShell } from './powershellRunner'

export async function runEntry(payload: RunEntryPayload): Promise<RunEntryResult> {
  const { book, entry, appSettings } = payload
  const config = resolveEffectiveEntryConfig({ book, entry, appSettings })

  switch (entry.actionType) {
    case 'open-app':
      return openApp(config)
    case 'open-folder':
      return openFolder(config)
    case 'open-file':
      return openFile(config)
    case 'open-url':
      return openUrl(config)
    case 'run-command':
      return runCommand(config)
    case 'prepare-powershell':
      return preparePowerShell(config)
    default:
      return { success: false, error: 'Unsupported action type' }
  }
}
