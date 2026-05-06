# MagiShelf Documentation

> Electron desktop workflow launcher with isolated workspace profiles.

---

## 1. Overview

MagiShelf is a GUI-first launcher for local tools, folders, files, URLs, and shell workflows.

Current product shape:
- Workspace/Profile based isolation
- Shelf / Tag / Book / Entry hierarchy
- Per-workspace icon library
- Deep/light theme switching with JSON theme definitions
- Electron desktop shell with custom frameless window UI

---

## 2. Core Concepts

```text
Workspace (Profile)
├── store.json
├── themes.json
├── icons/
└── App Data
    └── Shelf
        ├── Tag
        └── Book
            └── Entry
```

Rules:
- `Workspace` is the top-level isolation boundary. Every workspace has its own store, icons, and themes.
- `Shelf` is a top-level grouping inside one workspace.
- `Tag` is a classifier, not a container.
- `Book` is a project/toolset/environment.
- `Entry` is one executable action.

Relationships:
- `Workspace 1-N Shelf`
- `Shelf 1-N Tag`
- `Shelf 1-N Book`
- `Book N-N Tag`
- `Book 1-N Entry`

---

## 3. Storage Model

### Workspace Registry
Global registry (stored with `electron-store`):
- `activeWorkspaceId`
- `recentWorkspaces` list

### Workspace Data
Every workspace has its own folder:
```text
<userData>/workspaces/<slug>-<id-suffix>/
├── store.json
├── themes.json
└── icons/
```

- **Business Data**: Stored in workspace-local `store.json` using `cwd: workspace.path`.
- **Themes**: Stored in workspace-local `themes.json`.
- **Icons**: Imported/cropped icon files are stored in `workspace/icons/`.

**Important**: `StoreContext` always talks to the active workspace store. Switching workspaces remounts store, navigation, and theme contexts.

---

## 4. UI & Interaction Rules

### Drawer Auto-save
Drawers do not have a traditional "Save" button.
1. Form emits `onChange(data)` via `useEffect`.
2. Parent page stores pending data in a `useRef`.
3. `closeDrawer()` commits the data if it is non-null.
4. `null` from a form means the state is invalid; nothing is saved.

### Entry Interactions
- **Run**: Left-click on the entry icon.
- **Settings**: Right-click on the entry card.
- **Order**: Drag and drop entry cards to reorder.

### Components & Transitions
- `SettingsDrawer` uses CSS transitions (do not rewrite to `AnimatePresence`).
- Backdrop remains mounted and uses `pointer-events` toggling.
- Use the in-app `ConfirmDialog` / `useConfirm()` instead of `window.confirm()`.

---

## 5. Theme System

- **JSON Driven**: Themes are loaded from `<workspace>/themes.json`.
- **Built-in Fallbacks**: Missing color tokens are normalized from built-in fallback themes.
- **CSS Variables**: `ThemeProvider` applies colors to `document.documentElement`.
- **Utility Classes**: Use `.theme-*` classes from `globals.css` (e.g., `.theme-shell`, `.theme-card`, `.theme-accent-button`).

---

## 6. Icon System

- **Workspace Scoped**: Each profile has its own library.
- **Normalization**: Icons are cropped and saved as `MSI-xxxx.png`.
- **Library Only**: Icon selectors should show icons only, not label text.
- **Deletion**: Deleting an icon clears all references from Shelves, Books, and Entries.

---

## 7. Runner & Execution Logic

### `open-app`
- **Windows**: Defaults to direct `spawn`. If `Run as administrator` is checked or `EACCES` occurs, falls back to PowerShell `Start-Process`.
- **Non-Windows**: Direct `spawn`.

### `open-url`
- Accepts arbitrary valid URI schemes (e.g., `steam://`, `https://`).

### `run-command` / `prepare-powershell`
- Currently PowerShell-oriented (Windows-specific behavior).
- `run-command` can keep terminal open via `-NoExit`.

---

## 8. Development Commands

```bash
npm install        # install dependencies
npm run dev        # start dev server (renderer hot-reload + main process)
npm run typecheck  # TypeScript type check only, no emit
npm run build      # compile to out/
npm run preview    # preview the compiled build
```

### Debug Mode
To enable DevTools on startup:
- **PowerShell**: `$env:MAGISHELF_DEBUG='1'; npm run dev`
- **CMD**: `set MAGISHELF_DEBUG=1 && npm run dev`

---

## 8a. Packaging & Distribution

### Prerequisites
- Node.js + npm installed
- No code-signing certificate needed (configured to skip signing)

### Portable / Green Version (no installer, single folder)

```bash
npm run dist:dir
```

Output: `dist/win-unpacked/MagiShelf.exe`

- No installation required — copy the entire `win-unpacked/` folder anywhere and run `MagiShelf.exe` directly.
- No config files to prepare — all user data is stored in `%APPDATA%/MagiShelf/` (Electron's userData directory), not next to the executable. The app creates it automatically on first launch.

### Installer Version (NSIS setup wizard)

```bash
npm run dist
```

Output: `dist/MagiShelf Setup x.x.x.exe`

- Installs to `C:\Program Files\MagiShelf\` by default (user can change during setup).
- Creates Start Menu and Desktop shortcuts.
- Uninstaller is included.
- User data is in `%APPDATA%/MagiShelf/` — uninstalling the app does **not** delete user data.

### User Data Location

All workspaces, themes, icons, and settings are stored in:

```
%APPDATA%/MagiShelf/
├── config.json              ← workspace registry (active workspace, recent list)
└── workspaces/
    └── <slug>-<id>/
        ├── store.json       ← shelves, books, entries, tags, app settings
        ├── themes.json      ← custom themes
        └── icons/           ← imported icon images
```

You can back up or migrate all data by copying the `%APPDATA%/MagiShelf/` folder.

### Known Issue: Symlink Error on Windows (non-admin)

If `npm run dist` fails with a symlink-related error from `winCodeSign`, it means Windows requires Developer Mode or admin privileges to create symlinks.

**Workarounds:**
1. Run the terminal as Administrator and retry.
2. Enable Windows Developer Mode: Settings → System → For developers → Developer Mode.
3. Use `dist:dir` (portable version) instead, which does not trigger the signing step.

---

## 9. Architecture

```text
Renderer -> Preload (contextBridge) -> IPC -> Main Process
```

- **Main Process**: Manages window, IPC, workspace registry, store access, icon files, and execution.
- **Preload**: Exposes `window.magiShelf` (store, runner, icons, dialog, workspace, theme, window).

---

## 10. Avoid Regressions & Good Mental Model

### Avoid Regressions
- Do not auto-open DevTools.
- No `Dbg` button in top bar.
- Save buttons in drawers should not be added back.
- Workspace isolation must remain physical (separate folders).

### Mental Model
MagiShelf is a **desktop launcher** with **profile-isolated local workspaces**, a shared **icon library per workspace**, and a **customizable theme system** owned by the user through JSON.

---

## 11. Known Limitations

- `run-command` is Windows/PowerShell-biased.
- No built-in JSON editor for themes (manual edit + reload).
- No multi-instance conflict management for the same workspace.
- Packaging uses electron-builder (NSIS installer + portable dir). See section 8a.

---

## 12. File Map

```text
src/main/
├── index.ts
├── ipc/ (shelf, runner, icon, dialog, workspace, theme)
├── runner/ (command, open, powershell)
├── store/ (shelfStore)
├── workspace/ (workspaceManager)
└── theme/ (themeManager)
src/preload/
└── index.ts
src/shared/
├── types/ (book, entry, icon, store, theme, workspace)
└── utils/ (config, grouping, id)
src/renderer/src/
├── App.tsx
├── context/ (Nav, Store, Theme, Workspace)
├── pages/ (Home, Shelf, Book, Workspace)
├── components/ (book, entry, icons, layout, settings, shelf, tag, theme, ui, workspace)
└── services/ (dialog, icon, shelf, theme, workspace)
```

---

## 13. Source of Truth

This document is the primary reference for MagiShelf's architecture and design rules.
