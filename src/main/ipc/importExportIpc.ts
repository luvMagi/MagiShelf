import { BrowserWindow, dialog, ipcMain } from 'electron'
import { readFile, writeFile } from 'fs/promises'

export function registerImportExportIpc(): void {
  ipcMain.handle('store:export-file', async (event, data: unknown) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const result = await dialog.showSaveDialog(win!, {
      title: 'Export Shelves',
      defaultPath: `magishelf-export-${Date.now()}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (result.canceled || !result.filePath) return { success: false }
    await writeFile(result.filePath, JSON.stringify(data, null, 2), 'utf8')
    return { success: true }
  })

  ipcMain.handle('store:import-file', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const result = await dialog.showOpenDialog(win!, {
      title: 'Import Shelves',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const raw = await readFile(result.filePaths[0], 'utf8')
    return JSON.parse(raw)
  })
}
