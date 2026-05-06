import { MagiShelfStore } from '../../../shared/types/store'
import { IconAsset } from '../../../shared/types/icon'
import { WorkspaceStatus } from '../../../shared/types/workspace'
import { ThemeCatalog } from '../../../shared/types/theme'

declare global {
  interface Window {
    magiShelf: {
      store: {
        getAll: () => Promise<MagiShelfStore>
        saveAll: (data: MagiShelfStore) => Promise<{ success: boolean }>
        exportFile: (data: unknown) => Promise<{ success: boolean }>
        importFile: () => Promise<unknown>
      }
      runner: {
        runEntry: (payload: import('../../../shared/types/runner').RunEntryPayload) => Promise<import('../../../shared/types/runner').RunEntryResult>
      }
      icons: {
        save: (payload: { code: string; name: string; dataUrl: string }) => Promise<IconAsset>
        delete: (filePath: string) => Promise<{ success: boolean }>
      }
      dialog: {
        pickPath: (payload: {
          mode: 'file' | 'folder'
          title: string
          defaultPath?: string
        }) => Promise<string | null>
      }
      workspace: {
        getStatus: () => Promise<WorkspaceStatus>
        create: (name: string) => Promise<WorkspaceStatus>
        activate: (workspaceId: string) => Promise<WorkspaceStatus>
      }
      theme: {
        getCatalog: () => Promise<ThemeCatalog>
      }
      window: {
        minimize: () => void
        close: () => void
      }
    }
  }
}

export async function getAllData(): Promise<MagiShelfStore> {
  return window.magiShelf.store.getAll()
}

export async function saveAllData(data: MagiShelfStore): Promise<void> {
  await window.magiShelf.store.saveAll(data)
}
