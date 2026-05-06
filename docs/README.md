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
npm install
npm run dev
npm run typecheck
npm run build
npm run preview
```

### Debug Mode
To enable DevTools on startup:
- **PowerShell**: `$env:MAGISHELF_DEBUG='1'; npm run dev`
- **CMD**: `set MAGISHELF_DEBUG=1 && npm run dev`

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
- No distribution pipeline configured yet.

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
