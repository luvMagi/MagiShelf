import { ipcMain } from 'electron'
import { runEntry } from '../runner/commandRunner'
import { RunEntryPayload } from '../../shared/types/runner'

export function registerRunnerIpc(): void {
  ipcMain.handle('runner:run-entry', async (_event, payload: RunEntryPayload) => {
    return runEntry(payload)
  })
}
