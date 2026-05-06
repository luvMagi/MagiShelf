import { shell } from 'electron'
import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { RunEntryResult } from '../../shared/types/runner'
import { EffectiveEntryConfig } from '../../shared/types/config'
import { escapeForPowerShell } from '../utils/pathUtils'
import { buildRunScript, openTerminalWindow } from './terminalUtils'

export async function openApp(config: EffectiveEntryConfig): Promise<RunEntryResult> {
  const { appPath, args, workingDir, runAsAdmin } = config

  if (!appPath) return { success: false, error: 'appPath is required for open-app' }
  if (!existsSync(appPath)) return { success: false, error: `App not found: ${appPath}` }
  if (workingDir && !existsSync(workingDir)) {
    return { success: false, error: `Working directory not found: ${workingDir}` }
  }

  try {
    if (process.platform === 'win32') {
      if (runAsAdmin) {
        return startWindowsApp(appPath, args ?? [], workingDir, true)
      }

      try {
        const child = await spawnDetached(appPath, args ?? [], {
          cwd: workingDir,
          shell: false,
          detached: true,
          stdio: 'ignore'
        })
        child.unref()
        return { success: true }
      } catch (error) {
        const err = error as NodeJS.ErrnoException
        if (err.code === 'EACCES') {
          return startWindowsApp(appPath, args ?? [], workingDir, false)
        }
        throw error
      }
    }

    const child = await spawnDetached(appPath, args ?? [], {
      cwd: workingDir,
      shell: false,
      detached: true,
      stdio: 'ignore'
    })
    child.unref()
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function openFolder(config: EffectiveEntryConfig): Promise<RunEntryResult> {
  const { folderPath } = config

  if (!folderPath) return { success: false, error: 'folderPath is required for open-folder' }
  if (!existsSync(folderPath)) return { success: false, error: `Folder not found: ${folderPath}` }

  try {
    await shell.openPath(folderPath)
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function openFile(config: EffectiveEntryConfig): Promise<RunEntryResult> {
  const { filePath } = config

  if (!filePath) return { success: false, error: 'filePath is required for open-file' }
  if (!existsSync(filePath)) return { success: false, error: `File not found: ${filePath}` }

  try {
    await shell.openPath(filePath)
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function openUrl(config: EffectiveEntryConfig): Promise<RunEntryResult> {
  const { url } = config

  if (!url) return { success: false, error: 'url is required for open-url' }
  if (!isValidUri(url)) {
    return { success: false, error: `Invalid URI: ${url}` }
  }

  try {
    await shell.openExternal(url)
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

function isValidUri(value: string): boolean {
  try {
    const parsed = new URL(value)
    return /^[a-zA-Z][a-zA-Z\d+.-]*:$/.test(parsed.protocol)
  } catch {
    return false
  }
}

export async function runCommand(config: EffectiveEntryConfig): Promise<RunEntryResult> {
  const { command, args, workingDir, env, keepTerminalOpen, shell: shellType } = config

  if (!command) return { success: false, error: 'command is required for run-command' }
  if (workingDir && !existsSync(workingDir)) {
    return { success: false, error: `Working directory not found: ${workingDir}` }
  }

  try {
    const fullCmd = [command, ...(args ?? [])].join(' ')
    const script = buildRunScript(shellType, fullCmd, workingDir)
    openTerminalWindow({ shell: shellType, script, keepOpen: keepTerminalOpen, env })
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

async function startWindowsApp(
  appPath: string,
  args: string[],
  workingDir: string | undefined,
  runAsAdmin: boolean
): Promise<RunEntryResult> {
  const argumentList = args.map((arg) => `'${escapeForPowerShell(arg)}'`).join(', ')
  const startProcessLine = buildStartProcessLine(runAsAdmin)
  const psCommand = [
    '$ErrorActionPreference = \'Stop\'',
    `$app = '${escapeForPowerShell(appPath)}'`,
    argumentList ? `$argList = @(${argumentList})` : '$argList = @()',
    workingDir ? `$workDir = '${escapeForPowerShell(workingDir)}'` : '$workDir = $null',
    startProcessLine
  ].join('; ')

  const result = await runPowerShellScript(psCommand)
  return result
}

function buildStartProcessLine(runAsAdmin: boolean): string {
  const withArgs = 'if ($argList.Count -gt 0) { $startArgs.ArgumentList = $argList }'
  const withWorkDir = 'if ($workDir) { $startArgs.WorkingDirectory = $workDir }'
  const withVerb = runAsAdmin ? '$startArgs.Verb = "RunAs"' : ''

  return [
    '$startArgs = @{ FilePath = $app }',
    withArgs,
    withWorkDir,
    withVerb,
    'Start-Process @startArgs'
  ]
    .filter(Boolean)
    .join('; ')
}

function spawnDetached(
  command: string,
  args: string[],
  options: Parameters<typeof spawn>[2]
): Promise<ReturnType<typeof spawn>> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options)

    const onError = (error: Error) => {
      child.removeListener('spawn', onSpawn)
      reject(error)
    }

    const onSpawn = () => {
      child.removeListener('error', onError)
      resolve(child)
    }

    child.once('error', onError)
    child.once('spawn', onSpawn)
  })
}

function runPowerShellScript(command: string): Promise<RunEntryResult> {
  return new Promise((resolve) => {
    const child = spawn('powershell.exe', ['-NoLogo', '-NoProfile', '-Command', command], {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', (chunk) => {
      stdout += String(chunk)
    })

    child.stderr?.on('data', (chunk) => {
      stderr += String(chunk)
    })

    child.once('error', (error) => {
      resolve({ success: false, error: String(error) })
    })

    child.once('close', (code) => {
      if (code === 0) {
        resolve({ success: true })
        return
      }

      const detail = stderr.trim() || stdout.trim() || `PowerShell exited with code ${code}`
      resolve({ success: false, error: detail })
    })
  })
}
