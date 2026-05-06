import { BrowserWindow, dialog, ipcMain } from 'electron'

type PickPathMode = 'file' | 'folder'

type PickPathPayload = {
  mode: PickPathMode
  title?: string
  defaultPath?: string
}

export function registerFileDialogIpc(): void {
  ipcMain.handle('dialog:pick-path', async (event, payload: PickPathPayload) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    const options = {
      title: payload.title,
      defaultPath: payload.defaultPath,
      properties: payload.mode === 'folder' ? ['openDirectory'] : ['openFile']
    } as const

    const result = window
      ? await dialog.showOpenDialog(window, options)
      : await dialog.showOpenDialog(options)

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  })
}
