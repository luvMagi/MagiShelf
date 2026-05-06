import { ipcMain } from 'electron'
import { getStore, saveStore } from '../store/shelfStore'
import { MagiShelfStore } from '../../shared/types/store'

export function registerShelfIpc(): void {
  ipcMain.handle('store:get-all', () => {
    return getStore()
  })

  ipcMain.handle('store:save-all', (_event, data: MagiShelfStore) => {
    saveStore(data)
    return { success: true }
  })
}
