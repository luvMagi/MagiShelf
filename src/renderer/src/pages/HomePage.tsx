import React, { useContext, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { StoreContext } from '../context/StoreContext'
import { NavContext } from '../context/NavContext'
import { ShelfGrid } from '../components/shelf/ShelfGrid'
import { SettingsDrawer } from '../components/settings/SettingsDrawer'
import { ShelfForm } from '../components/settings/ShelfForm'
import { HomeSettingsPanel } from '../components/settings/HomeSettingsPanel'
import { Shelf } from '../../../shared/types/shelf'
import { Tag } from '../../../shared/types/tag'
import { Book } from '../../../shared/types/book'
import { Entry } from '../../../shared/types/entry'
import { IconAsset } from '../../../shared/types/icon'
import { createId } from '../../../shared/utils/id'
import { useConfirm } from '../components/ui/ConfirmDialog'
import { deleteIcon } from '../services/iconService'
import { WorkspaceContext } from '../context/WorkspaceContext'

type ExportData = {
  version: number
  exportedAt: string
  shelves: Shelf[]
  tags: Tag[]
  books: Book[]
  entries: Entry[]
}

type DrawerMode = 'shelf-create' | 'shelf-edit' | 'settings' | null

export function HomePage() {
  const { store, updateStore } = useContext(StoreContext)
  const { navigateTo } = useContext(NavContext)
  useContext(WorkspaceContext)
  const confirm = useConfirm()

  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null)
  const [editingShelf, setEditingShelf] = useState<Shelf | null>(null)
  const pendingData = useRef<Partial<Shelf> | null>(null)

  function openCreate() {
    pendingData.current = null
    setEditingShelf(null)
    setDrawerMode('shelf-create')
  }

  function openEdit(shelf: Shelf) {
    pendingData.current = null
    setEditingShelf(shelf)
    setDrawerMode('shelf-edit')
  }

  function openSettings() {
    pendingData.current = null
    setEditingShelf(null)
    setDrawerMode('settings')
  }

  async function closeDrawer() {
    if (drawerMode === 'settings') {
      setDrawerMode(null)
      return
    }

    const data = pendingData.current
    if (data) {
      const now = new Date().toISOString()
      if (drawerMode === 'shelf-edit' && editingShelf) {
        await updateStore((prev) => ({
          ...prev,
          shelves: prev.shelves.map((s) =>
            s.id === editingShelf.id ? { ...s, ...data, updatedAt: now } : s
          )
        }))
      } else {
        const newShelf: Shelf = {
          id: createId('shelf'),
          name: data.name!,
          description: data.description,
          icon: data.icon,
          color: data.color,
          order: store.shelves.length + 1,
          createdAt: now,
          updatedAt: now
        }
        await updateStore((prev) => ({ ...prev, shelves: [...prev.shelves, newShelf] }))
      }
    }
    pendingData.current = null
    setDrawerMode(null)
    setEditingShelf(null)
  }

  async function handleDelete(shelf: Shelf) {
    if (!await confirm(`Delete shelf "${shelf.name}"?`, 'This will also delete all its tags, books, and entries.')) return
    const bookIds = store.books.filter((b) => b.shelfId === shelf.id).map((b) => b.id)
    await updateStore((prev) => ({
      ...prev,
      shelves: prev.shelves.filter((s) => s.id !== shelf.id),
      tags: prev.tags.filter((t) => t.shelfId !== shelf.id),
      books: prev.books.filter((b) => b.shelfId !== shelf.id),
      entries: prev.entries.filter((e) => !bookIds.includes(e.bookId))
    }))
  }

  async function handleExport() {
    const data: ExportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      shelves: store.shelves,
      tags: store.tags,
      books: store.books,
      entries: store.entries
    }
    await window.magiShelf.store.exportFile(data)
  }

  async function handleImport() {
    const raw = await window.magiShelf.store.importFile() as ExportData | null
    if (!raw || !Array.isArray(raw.shelves) || !Array.isArray(raw.books)) return

    const shelfIdMap = new Map<string, string>()
    const tagIdMap = new Map<string, string>()
    const bookIdMap = new Map<string, string>()

    const now = new Date().toISOString()
    const shelfOffset = store.shelves.length
    const tagOffset = store.tags.length
    const bookOffset = store.books.length
    const entryOffset = store.entries.length

    const newShelves: Shelf[] = (raw.shelves ?? []).map((s, i) => {
      const newId = createId('shelf')
      shelfIdMap.set(s.id, newId)
      return { ...s, id: newId, order: shelfOffset + i + 1, createdAt: now, updatedAt: now }
    })

    const newTags: Tag[] = (raw.tags ?? []).map((t, i) => {
      const newId = createId('tag')
      tagIdMap.set(t.id, newId)
      return {
        ...t,
        id: newId,
        shelfId: shelfIdMap.get(t.shelfId) ?? t.shelfId,
        order: tagOffset + i + 1,
        createdAt: now,
        updatedAt: now
      }
    })

    const newBooks: Book[] = (raw.books ?? []).map((b, i) => {
      const newId = createId('book')
      bookIdMap.set(b.id, newId)
      return {
        ...b,
        id: newId,
        shelfId: shelfIdMap.get(b.shelfId) ?? b.shelfId,
        tagIds: (b.tagIds ?? []).map((tid) => tagIdMap.get(tid) ?? tid),
        primaryTagId: b.primaryTagId ? (tagIdMap.get(b.primaryTagId) ?? b.primaryTagId) : undefined,
        order: bookOffset + i + 1,
        createdAt: now,
        updatedAt: now
      }
    })

    const newEntries: Entry[] = (raw.entries ?? []).map((e, i) => ({
      ...e,
      id: createId('entry'),
      bookId: bookIdMap.get(e.bookId) ?? e.bookId,
      order: entryOffset + i + 1,
      createdAt: now,
      updatedAt: now
    }))

    await updateStore((prev) => ({
      ...prev,
      shelves: [...prev.shelves, ...newShelves],
      tags: [...prev.tags, ...newTags],
      books: [...prev.books, ...newBooks],
      entries: [...prev.entries, ...newEntries]
    }))
  }

  async function handleImportIcon(icon: IconAsset) {
    await updateStore((prev) => ({
      ...prev,
      icons: [...prev.icons, icon]
    }))
  }

  async function handleDeleteIcon(icon: IconAsset) {
    if (!await confirm(`Delete icon "${icon.name}"?`, 'This will remove the icon from the library and clear all references to it.')) return

    await deleteIcon(icon.filePath)
    await updateStore((prev) => ({
      ...prev,
      icons: prev.icons.filter((item) => item.id !== icon.id),
      shelves: prev.shelves.map((shelf) => ({
        ...shelf,
        icon: shelf.icon === icon.id ? undefined : shelf.icon
      })),
      tags: prev.tags.map((tag) => ({
        ...tag,
        icon: tag.icon === icon.id ? undefined : tag.icon
      })),
      books: prev.books.map((book) => ({
        ...book,
        icon: book.icon === icon.id ? undefined : book.icon
      })),
      entries: prev.entries.map((entry) => ({
        ...entry,
        icon: entry.icon === icon.id ? undefined : entry.icon
      }))
    }))
  }

  const drawerTitle =
    drawerMode === 'settings' ? 'Settings'
    : editingShelf ? 'Edit Shelf'
    : 'New Shelf'
  const nextIconCode = getNextIconCode(store.icons)

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold theme-text-primary">Shelves</h1>
          <p className="text-sm theme-text-muted mt-0.5">Your workspace collection</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openSettings}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all theme-ghost-button"
          >
            Settings
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all theme-accent-button"
          >
            + New Shelf
          </button>
        </div>
      </motion.div>

      {store.shelves.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 theme-text-faint"
        >
          <p className="text-xl font-semibold">No shelves yet</p>
          <p className="text-sm mt-2">Create your first shelf to organize your workflows</p>
          <button
            onClick={openCreate}
            className="mt-6 px-5 py-2.5 rounded-xl text-sm font-medium transition-all theme-ghost-button"
          >
            Create Shelf
          </button>
        </motion.div>
      ) : (
        <ShelfGrid
          shelves={[...store.shelves].sort((a, b) => a.order - b.order)}
          onSelect={(shelf) => navigateTo('shelf', shelf.id)}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <SettingsDrawer
        open={drawerMode !== null}
        title={drawerTitle}
        onClose={closeDrawer}
      >
        {drawerMode === 'settings' ? (
          <HomeSettingsPanel
            nextIconCode={nextIconCode}
            onExport={handleExport}
            onImport={() => void handleImport()}
            onImportIcon={handleImportIcon}
            onDeleteIcon={handleDeleteIcon}
          />
        ) : (
          <ShelfForm
            key={editingShelf?.id ?? 'new'}
            initial={editingShelf ?? {}}
            onChange={(data) => { pendingData.current = data }}
          />
        )}
      </SettingsDrawer>
    </div>
  )
}

function getNextIconCode(icons: IconAsset[]): string {
  const maxIndex = icons.reduce((max, icon) => {
    const match = icon.code?.match(/^MSI-(\d{4})$/)
    if (!match) return max
    return Math.max(max, Number(match[1]))
  }, 0)

  return `MSI-${String(maxIndex + 1).padStart(4, '0')}`
}
