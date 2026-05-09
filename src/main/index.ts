import { app, shell, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerShelfIpc } from './ipc/shelfIpc'
import { registerRunnerIpc } from './ipc/runnerIpc'
import { registerIconIpc } from './ipc/iconIpc'
import { registerFileDialogIpc } from './ipc/fileDialogIpc'
import { registerWorkspaceIpc } from './ipc/workspaceIpc'
import { registerThemeIpc } from './ipc/themeIpc'
import { registerImportExportIpc } from './ipc/importExportIpc'

const enableDefaultDebugMode = process.env['MAGISHELF_DEBUG'] === '1'
let isQuitting = false

function getTrayIconPath(): string {
  if (is.dev) {
    return join(app.getAppPath(), 'image/16x16.ico')
  }
  return join(process.resourcesPath, 'image/16x16.ico')
}

function getWindowIconPath(): string {
  if (is.dev) {
    return join(app.getAppPath(), 'image/256x256.ico')
  }
  return join(process.resourcesPath, 'image/256x256.ico')
}

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0f13',
    autoHideMenuBar: true,
    icon: getWindowIconPath(),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Hide to tray instead of closing
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && enableDefaultDebugMode) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.luvmagi.magishelf')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerShelfIpc()
  registerRunnerIpc()
  registerIconIpc()
  registerFileDialogIpc()
  registerWorkspaceIpc()
  registerThemeIpc()
  registerImportExportIpc()

  ipcMain.on('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })
  ipcMain.on('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.hide()
  })

  const mainWindow = createWindow()

  // System tray
  const tray = new Tray(getTrayIconPath())
  tray.setToolTip('MagiShelf')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Show MagiShelf',
        click: () => {
          mainWindow.show()
          mainWindow.focus()
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          isQuitting = true
          app.quit()
        }
      }
    ])
  )
  tray.on('double-click', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  app.on('before-quit', () => {
    isQuitting = true
  })

app.on('activate', function () {
    mainWindow.show()
    mainWindow.focus()
  })
})

// Keep running in tray when all windows are closed
app.on('window-all-closed', () => {
  // intentionally empty — app lives in tray
})
