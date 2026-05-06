import Store from 'electron-store'
import { basename, extname } from 'path'
import { MagiShelfStore, defaultStore } from '../../shared/types/store'
import { IconAsset } from '../../shared/types/icon'
import { getActiveWorkspaceOrThrow } from '../workspace/workspaceManager'

function getWorkspaceStore(): Store<{ data: MagiShelfStore }> {
  const workspace = getActiveWorkspaceOrThrow()

  return new Store<{ data: MagiShelfStore }>({
    cwd: workspace.path,
    name: 'store',
    defaults: {
      data: defaultStore
    }
  })
}

export function getStore(): MagiShelfStore {
  const store = getWorkspaceStore()
  const data = store.get('data')

  return {
    shelves: data?.shelves ?? defaultStore.shelves,
    tags: data?.tags ?? defaultStore.tags,
    books: data?.books ?? defaultStore.books,
    entries: data?.entries ?? defaultStore.entries,
    icons: normalizeIcons(data?.icons ?? defaultStore.icons),
    appSettings: {
      ...defaultStore.appSettings,
      ...(data?.appSettings ?? {})
    }
  }
}

export function saveStore(data: MagiShelfStore): void {
  const store = getWorkspaceStore()
  store.set('data', getNormalizedStore(data))
}

function getNormalizedStore(data: MagiShelfStore): MagiShelfStore {
  return {
    shelves: data.shelves ?? [],
    tags: data.tags ?? [],
    books: data.books ?? [],
    entries: data.entries ?? [],
    icons: normalizeIcons(data.icons ?? []),
    appSettings: {
      ...defaultStore.appSettings,
      ...(data.appSettings ?? {})
    }
  }
}

function normalizeIcons(icons: IconAsset[]): IconAsset[] {
  return icons.map((icon, index) => ({
    ...icon,
    code: icon.code ?? getLegacyIconCode(icon, index),
    fileName: icon.fileName ?? `${getLegacyIconCode(icon, index)}.png`
  }))
}

function getLegacyIconCode(icon: IconAsset, index: number): string {
  const baseName = basename(icon.fileName ?? '', extname(icon.fileName ?? ''))
  if (/^MSI-\d{4}$/.test(baseName)) return baseName
  return `MSI-${String(index + 1).padStart(4, '0')}`
}
