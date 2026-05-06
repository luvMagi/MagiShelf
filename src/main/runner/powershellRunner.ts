import { existsSync } from 'fs'
import { RunEntryResult } from '../../shared/types/runner'
import { EffectiveEntryConfig } from '../../shared/types/config'
import { buildPrepareScript, openTerminalWindow } from './terminalUtils'

export async function preparePowerShell(config: EffectiveEntryConfig): Promise<RunEntryResult> {
  const { command, args, workingDir, env, shell } = config

  if (!command) return { success: false, error: 'command is required for prepare-powershell' }
  if (workingDir && !existsSync(workingDir)) {
    return { success: false, error: `Working directory not found: ${workingDir}` }
  }

  try {
    const fullCommand = [command, ...(args ?? [])].join(' ')
    const script = buildPrepareScript(shell, fullCommand, workingDir)
    openTerminalWindow({ shell, script, keepOpen: true, env })
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
