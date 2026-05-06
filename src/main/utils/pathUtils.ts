import { existsSync } from 'fs'

export function pathExists(p: string): boolean {
  return existsSync(p)
}

export function escapeForPowerShell(s: string): string {
  return s.replace(/'/g, "''")
}
