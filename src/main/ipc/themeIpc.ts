import { ipcMain } from 'electron'
import { getWorkspaceThemeCatalog } from '../theme/themeManager'
import { getActiveWorkspaceOrThrow } from '../workspace/workspaceManager'

export function registerThemeIpc(): void {
  ipcMain.handle('theme:get-catalog', async () => {
    const workspace = getActiveWorkspaceOrThrow()
    return getWorkspaceThemeCatalog(workspace.path)
  })
}
