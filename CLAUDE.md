# MagiShelf — Project Guide for Claude

## Project Overview | 项目概述

MagiShelf is an Electron-based desktop workflow launcher.
It manages local apps, folders, files, URLs, scripts, and CLI workflows
using a **Shelf → Book → Entry** hierarchy.

Users configure everything through a GUI settings panel — no hand-written config files.

---

## Language Rules | 语言规范

| Context | Rule |
|---|---|
| Conversation | Chinese + English |
| Documentation | Chinese + English (bilingual) |
| Source code | English only — including all UI display strings, variable names, comments |

---

## Tech Stack | 技术栈

```
Electron
electron-vite
React
TypeScript
Tailwind CSS
Framer Motion
electron-store
Node.js child_process
```

Package manager: `npm`
IDE: WebStorm

---

## Core Concepts | 核心概念

```
App
└── Shelf
    ├── Tag  (classifier, NOT a container)
    └── Book
        ├── BookSettings
        └── Entry
            └── EntrySettings
```

**Key rule — Tags are not containers:**
- Tags belong to Shelf
- Books belong to Shelf
- Tags are classification attributes of Books
- One Book can have multiple Tags
- `Shelf 1-N Book`, `Shelf 1-N Tag`, `Book N-N Tag`, `Book 1-N Entry`

---

## Entry Action Types | 条目动作类型

| actionType | Behavior |
|---|---|
| `open-app` | Launch a local application |
| `open-folder` | Open a folder in Explorer |
| `open-file` | Open a file with default app |
| `open-url` | Open URL in browser |
| `run-command` | Execute command directly |
| `prepare-powershell` | Open PowerShell, cd to workingDir, display command, wait for user |

---

## Config Inheritance | 配置继承

```
Entry Settings > Book Settings > App Settings
```

Resolved at runtime via `resolveEffectiveEntryConfig()`.

---

## Architecture | 架构

```
Renderer Process  →  Preload (contextBridge)  →  IPC  →  Main Process
```

- `nodeIntegration: false`
- `contextIsolation: true`
- Renderer never calls Node.js APIs directly
- All system operations go through `ipcRenderer.invoke` → `ipcMain.handle`

### IPC Channels

**Store:**
- `store:get-all` — returns full `MagiShelfStore`
- `store:save-all` — saves full `MagiShelfStore`

**Runner:**
- `runner:run-entry` — executes an Entry with `RunEntryPayload`

---

## Project Structure | 目录结构

```
magishelf/
├── package.json
├── electron.vite.config.ts
├── tsconfig.json
└── src/
    ├── main/
    │   ├── index.ts
    │   ├── ipc/
    │   │   ├── shelfIpc.ts
    │   │   └── runnerIpc.ts
    │   ├── runner/
    │   │   ├── commandRunner.ts      ← unified entry point
    │   │   ├── powershellRunner.ts
    │   │   └── openRunner.ts
    │   ├── store/
    │   │   └── shelfStore.ts
    │   └── utils/
    │       └── pathUtils.ts
    ├── preload/
    │   └── index.ts
    └── renderer/
        ├── index.html
        └── src/
            ├── main.tsx
            ├── App.tsx
            ├── domain/
            │   ├── shelf.ts
            │   ├── tag.ts
            │   ├── book.ts
            │   ├── entry.ts
            │   └── store.ts
            ├── pages/
            │   ├── HomePage.tsx
            │   ├── ShelfPage.tsx
            │   └── BookPage.tsx
            ├── components/
            │   ├── layout/
            │   │   ├── AppLayout.tsx
            │   │   └── TopBar.tsx
            │   ├── shelf/
            │   │   ├── ShelfCard.tsx
            │   │   └── ShelfGrid.tsx
            │   ├── tag/
            │   │   └── TagBar.tsx
            │   ├── book/
            │   │   ├── BookCard.tsx
            │   │   ├── BookGrid.tsx
            │   │   └── BookHeader.tsx
            │   ├── entry/
            │   │   ├── EntryCard.tsx
            │   │   └── EntryList.tsx
            │   └── settings/
            │       ├── SettingsDrawer.tsx
            │       ├── ShelfForm.tsx
            │       ├── TagForm.tsx
            │       ├── BookForm.tsx
            │       └── EntryForm.tsx
            ├── hooks/
            │   ├── useShelves.ts
            │   ├── useCurrentShelf.ts
            │   └── useRunEntry.ts
            ├── services/
            │   ├── shelfService.ts
            │   └── runnerService.ts
            ├── styles/
            │   └── globals.css
            └── utils/
                ├── id.ts
                └── grouping.ts
```

---

## Data Models | 数据模型

### Shelf
```ts
type Shelf = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};
```

### Tag
```ts
type Tag = {
  id: string;
  shelfId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### Book
```ts
type Book = {
  id: string;
  shelfId: string;
  name: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  cover?: string;
  color?: string;
  primaryTagId?: string;
  tagIds: string[];
  order: number;
  settings: BookSettings;
  createdAt: string;
  updatedAt: string;
};
```

### BookSettings
```ts
type ShellType = "powershell" | "cmd" | "git-bash";

type BookSettings = {
  defaultWorkingDir?: string;
  defaultShell?: ShellType;
  defaultRunMode?: "direct" | "prepare";
  defaultEnv?: Record<string, string>;
  beforeRunConfirm?: boolean;
  keepTerminalOpen?: boolean;
};
```

### Entry
```ts
type EntryActionType =
  | "open-app"
  | "open-folder"
  | "open-file"
  | "open-url"
  | "run-command"
  | "prepare-powershell";

type Entry = {
  id: string;
  bookId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  actionType: EntryActionType;
  settings: EntrySettings;
  createdAt: string;
  updatedAt: string;
};
```

### EntrySettings
```ts
type EntrySettings = {
  workingDir?: string;
  command?: string;
  args?: string[];
  appPath?: string;
  folderPath?: string;
  filePath?: string;
  url?: string;
  shell?: ShellType;
  runMode?: "direct" | "prepare";
  env?: Record<string, string>;
  requireConfirm?: boolean;
  keepTerminalOpen?: boolean;
};
```

### MagiShelfStore
```ts
type MagiShelfStore = {
  shelves: Shelf[];
  tags: Tag[];
  books: Book[];
  entries: Entry[];
  appSettings: AppSettings;
};

type AppSettings = {
  theme: "dark" | "light";
  defaultShell: ShellType;
  defaultRunMode: "direct" | "prepare";
  duplicateBookDisplayMode: "primary-tag-only" | "all-tags";
};
```

---

## Storage | 本地存储

- Library: `electron-store`
- Store key: `magishelf-store`
- Default: dark theme, powershell, prepare mode

---

## Runner Implementation | 命令执行

| actionType | Implementation |
|---|---|
| `open-app` | `child_process.spawn(appPath, args, { detached: true })` |
| `open-folder` | `shell.openPath(folderPath)` |
| `open-file` | `shell.openPath(filePath)` |
| `open-url` | `shell.openExternal(url)` |
| `run-command` | `child_process.spawn(command, args, { shell: true })` |
| `prepare-powershell` | `powershell.exe -NoExit -Command "cd '...'; Write-Host ..."` |

---

## UI Style | 界面风格

- Dark theme
- Glassmorphism cards: `bg-white/10 backdrop-blur-xl border border-white/10`
- Rounded corners: `rounded-2xl`
- Soft shadows: `shadow-xl`
- Hover scale: `hover:scale-[1.02] transition`
- Animations via Framer Motion: card enter, hover, page transition, drawer slide-in

---

## MVP Phases | 开发阶段

| Phase | Goal |
|---|---|
| 1 | Project skeleton: electron-vite + React + Tailwind + preload + electron-store |
| 2 | Data models: types + getAll/saveAll IPC + demoStore |
| 3 | Pages: HomePage / ShelfPage / BookPage |
| 4 | Settings: SettingsDrawer + all Forms |
| 5 | Runner: all 6 action types |
| 6 | Polish: animations, colors, glassmorphism |

---

## MVP Acceptance Criteria | 验收标准

1. Create a Shelf
2. Enter a Shelf
3. Create a Tag
4. Create a Book with multiple Tags
5. Enter a Book
6. Edit Book default workingDir
7. Create an Entry with actionType
8. Run an Entry
9. `open-folder` opens directory
10. `open-url` opens browser
11. `open-app` launches application
12. `run-command` executes command
13. `prepare-powershell` opens PowerShell with command displayed
14. All config persists after app restart

---

## Out of Scope for MVP | MVP 不含功能

```
Embedded terminal / node-pty
SQLite
Cloud sync
Plugin system
Account / permission system
Multi-window editing
Theme marketplace
```

---

## ID Generation | ID 生成

```ts
export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
// Examples: shelf-xxxx, tag-xxxx, book-xxxx, entry-xxxx
```

---

## package.json Scripts

```json
{
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```
