import { ipcMain } from 'electron'
import { deleteIconAsset, saveIconAsset } from '../icons/iconStorage'

type SaveIconPayload = {
  code: string
  name: string
  dataUrl: string
}

export function registerIconIpc(): void {
  ipcMain.handle('icons:save', async (_event, payload: SaveIconPayload) => {
    return saveIconAsset(payload)
  })

  ipcMain.handle('icons:delete', async (_event, filePath: string) => {
    await deleteIconAsset(filePath)
    return { success: true }
  })
}
