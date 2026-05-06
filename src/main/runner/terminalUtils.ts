import { spawn } from 'child_process'
import { ShellType } from '../../shared/types/book'

type OpenTerminalParams = {
  shell: ShellType
  script: string
  keepOpen: boolean
  env?: Record<string, string>
}

export function openTerminalWindow({ shell, script, keepOpen, env = {} }: OpenTerminalParams): void {
  const spawnArgs = buildSpawnArgs(shell, script, keepOpen)
  const child = spawn('cmd.exe', spawnArgs, {
    env: { ...process.env, ...env },
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  })
  child.unref()
}

function buildSpawnArgs(shell: ShellType, script: string, keepOpen: boolean): string[] {
  if (shell === 'cmd') {
    return ['/c', 'start', 'cmd.exe', keepOpen ? '/k' : '/c', script]
  }
  if (shell === 'git-bash') {
    // -i enables interactive mode so read -e (readline) works
    const finalScript = keepOpen ? `${script}; exec bash` : script
    return ['/c', 'start', 'bash.exe', '-i', '-c', finalScript]
  }
  // powershell (default)
  const args = ['/c', 'start', 'powershell.exe', '-NoLogo']
  if (keepOpen) args.push('-NoExit')
  args.push('-Command', script)
  return args
}

// ── run-command ──────────────────────────────────────────────────────────────

export function buildRunScript(shell: ShellType, command: string, workingDir?: string): string {
  if (shell === 'cmd') {
    const parts: string[] = []
    if (workingDir) parts.push(`cd /d "${workingDir}"`)
    parts.push(command)
    return parts.join(' & ')
  }
  if (shell === 'git-bash') {
    const parts: string[] = []
    if (workingDir) parts.push(`cd '${toUnixPath(workingDir).replace(/'/g, "'\\''")}'`)
    parts.push(command)
    return parts.join('; ')
  }
  // powershell
  const parts: string[] = []
  if (workingDir) parts.push(`Set-Location '${psEsc(workingDir)}'`)
  parts.push(command)
  return parts.join('; ')
}

// ── prepare: pre-fill command line, wait for Enter ──────────────────────────

export function buildPrepareScript(shell: ShellType, command: string, workingDir?: string): string {
  if (shell === 'cmd') return buildCmdPrepareScript(command, workingDir)
  if (shell === 'git-bash') return buildBashPrepareScript(command, workingDir)
  return buildPowerShellPrepareScript(command, workingDir)
}

function buildPowerShellPrepareScript(command: string, workingDir?: string): string {
  const parts: string[] = []
  if (workingDir) parts.push(`Set-Location '${psEsc(workingDir)}'`)
  parts.push(`Set-Clipboard -Value '${psEsc(command)}'`)
  parts.push(`Write-Host ''`)
  parts.push(`Write-Host '  MagiShelf - Command Ready' -ForegroundColor Cyan`)
  parts.push(`Write-Host ''`)
  parts.push(`Write-Host '  ${psEsc(command)}' -ForegroundColor Yellow`)
  parts.push(`Write-Host ''`)
  parts.push(`Write-Host '  (Copied to clipboard — press Ctrl+V then Enter)' -ForegroundColor DarkGray`)
  parts.push(`Write-Host ''`)
  return parts.join('; ')
}

function buildCmdPrepareScript(command: string, workingDir?: string): string {
  const parts: string[] = []
  if (workingDir) parts.push(`cd /d "${workingDir}"`)
  // Pipe to clip to copy command to clipboard automatically
  parts.push(`echo ${command}| clip`)
  parts.push(`echo.`)
  parts.push(`echo   MagiShelf - Command Ready`)
  parts.push(`echo.`)
  parts.push(`echo   ${command}`)
  parts.push(`echo.`)
  parts.push(`echo   (Command copied to clipboard - press Ctrl+V then Enter)`)
  parts.push(`echo.`)
  return parts.join(' & ')
}

function buildBashPrepareScript(command: string, workingDir?: string): string {
  const parts: string[] = []
  if (workingDir) parts.push(`cd '${toUnixPath(workingDir).replace(/'/g, "'\\''")}'`)
  const escaped = command.replace(/'/g, "'\\''")
  parts.push(`echo '${escaped}' | clip.exe`)
  parts.push(`echo ''`)
  parts.push(`echo '  MagiShelf - Command Ready'`)
  parts.push(`echo ''`)
  parts.push(`echo '  ${escaped}'`)
  parts.push(`echo ''`)
  parts.push(`echo '  (Copied to clipboard — press Ctrl+V then Enter)'`)
  parts.push(`echo ''`)
  return parts.join('; ')
}

// ── helpers ──────────────────────────────────────────────────────────────────

function psEsc(s: string): string {
  return s.replace(/'/g, "''")
}

function toUnixPath(winPath: string): string {
  return winPath
    .replace(/\\/g, '/')
    .replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`)
}
