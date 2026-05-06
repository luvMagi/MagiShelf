import { Shelf } from './shelf'
import { Tag } from './tag'
import { Book, ShellType } from './book'
import { Entry } from './entry'
import { IconAsset } from './icon'

export type AppSettings = {
  theme: string
  defaultShell: ShellType
  defaultRunMode: 'direct' | 'prepare'
  duplicateBookDisplayMode: 'primary-tag-only' | 'all-tags'
}

export type MagiShelfStore = {
  shelves: Shelf[]
  tags: Tag[]
  books: Book[]
  entries: Entry[]
  icons: IconAsset[]
  appSettings: AppSettings
}

export const defaultStore: MagiShelfStore = {
  shelves: [],
  tags: [],
  books: [],
  entries: [],
  icons: [],
  appSettings: {
    theme: 'dark',
    defaultShell: 'powershell',
    defaultRunMode: 'prepare',
    duplicateBookDisplayMode: 'primary-tag-only'
  }
}
