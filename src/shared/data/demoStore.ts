import { MagiShelfStore } from '../types/store'

export const demoStore: MagiShelfStore = {
  shelves: [
    {
      id: 'shelf-lds',
      name: 'Luvmagi DevSupport',
      description: 'Dev support toolbox',
      icon: 'sparkles',
      color: '#8b5cf6',
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  tags: [
    {
      id: 'tag-design',
      shelfId: 'shelf-lds',
      name: 'Design Tools',
      color: '#8b5cf6',
      icon: 'palette',
      order: 1,
      visible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tag-test',
      shelfId: 'shelf-lds',
      name: 'Test Tools',
      color: '#06b6d4',
      icon: 'check-circle',
      order: 2,
      visible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  books: [
    {
      id: 'book-oda',
      shelfId: 'shelf-lds',
      name: 'ODA',
      subtitle: 'Optimized Design Architecture',
      description: 'Screen design document generator and design assistant tool',
      icon: 'book-open',
      color: '#8b5cf6',
      primaryTagId: 'tag-design',
      tagIds: ['tag-design'],
      order: 1,
      settings: {
        defaultWorkingDir: 'D:/projects/luvmagi/modules/oda',
        defaultShell: 'powershell',
        defaultRunMode: 'prepare',
        beforeRunConfirm: false,
        keepTerminalOpen: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  entries: [
    {
      id: 'entry-oda-start',
      bookId: 'book-oda',
      name: 'Start ODA',
      description: 'Launch ODA main process',
      icon: 'play',
      color: '#8b5cf6',
      order: 1,
      actionType: 'prepare-powershell',
      settings: {
        command: 'uv',
        args: ['run', 'python', 'main.py']
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'entry-oda-output',
      bookId: 'book-oda',
      name: 'Open Output',
      description: 'Open ODA output directory',
      icon: 'folder-open',
      color: '#06b6d4',
      order: 2,
      actionType: 'open-folder',
      settings: {
        folderPath: 'D:/projects/luvmagi/modules/oda/output'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  icons: [],
  appSettings: {
    theme: 'dark',
    defaultShell: 'powershell',
    defaultRunMode: 'prepare',
    duplicateBookDisplayMode: 'primary-tag-only'
  }
}
