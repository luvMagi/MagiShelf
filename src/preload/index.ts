import { contextBridge, ipcRenderer } from 'electron'
import { MagiShelfStore } from '../shared/types/store'
import { RunEntryPayload } from '../shared/types/runner'
import { IconAsset } from '../shared/types/icon'
import { WorkspaceStatus } from '../shared/types/workspace'
import { ThemeCatalog } from '../shared/types/theme'

contextBridge.exposeInMainWorld('magiShelf', {
  store: {
    getAll: (): Promise<MagiShelfStore> => ipcRenderer.invoke('store:get-all'),
    saveAll: (data: MagiShelfStore): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('store:save-all', data),
    exportFile: (data: unknown): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('store:export-file', data),
    importFile: (): Promise<unknown> =>
      ipcRenderer.invoke('store:import-file')
  },
  runner: {
    runEntry: (payload: RunEntryPayload) => ipcRenderer.invoke('runner:run-entry', payload)
  },
  icons: {
    save: (payload: { code: string; name: string; dataUrl: string }): Promise<IconAsset> =>
      ipcRenderer.invoke('icons:save', payload),
    delete: (filePath: string): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('icons:delete', filePath)
  },
  dialog: {
    pickPath: (payload: {
      mode: 'file' | 'folder'
      title: string
      defaultPath?: string
    }): Promise<string | null> => ipcRenderer.invoke('dialog:pick-path', payload)
  },
  workspace: {
    getStatus: (): Promise<WorkspaceStatus> => ipcRenderer.invoke('workspace:get-status'),
    create: (name: string): Promise<WorkspaceStatus> => ipcRenderer.invoke('workspace:create', name),
    activate: (workspaceId: string): Promise<WorkspaceStatus> =>
      ipcRenderer.invoke('workspace:activate', workspaceId)
  },
  theme: {
    getCatalog: (): Promise<ThemeCatalog> => ipcRenderer.invoke('theme:get-catalog')
  },
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    close: () => ipcRenderer.send('window:close')
  }
})
