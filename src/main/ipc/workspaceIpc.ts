import { ipcMain } from 'electron'
import {
  activateWorkspace,
  createWorkspace,
  getWorkspaceStatus
} from '../workspace/workspaceManager'

export function registerWorkspaceIpc(): void {
  ipcMain.handle('workspace:get-status', () => {
    return getWorkspaceStatus()
  })

  ipcMain.handle('workspace:create', async (_event, name: string) => {
    return createWorkspace(name)
  })

  ipcMain.handle('workspace:activate', (_event, workspaceId: string) => {
    return activateWorkspace(workspaceId)
  })
}
