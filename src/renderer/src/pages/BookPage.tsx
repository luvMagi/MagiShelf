import React, { useContext, useRef, useState } from 'react'
import { StoreContext } from '../context/StoreContext'
import { NavContext } from '../context/NavContext'
import { BookHeader } from '../components/book/BookHeader'
import { EntryList } from '../components/entry/EntryList'
import { SettingsDrawer } from '../components/settings/SettingsDrawer'
import { BookForm } from '../components/settings/BookForm'
import { EntryForm } from '../components/settings/EntryForm'
import { Entry } from '../../../shared/types/entry'
import { Book } from '../../../shared/types/book'
import { createId } from '../../../shared/utils/id'
import { useConfirm } from '../components/ui/ConfirmDialog'

type DrawerMode = 'book-settings' | 'entry-create' | 'entry-edit' | null

export function BookPage() {
  const { store, updateStore } = useContext(StoreContext)
  const { currentShelfId, currentBookId } = useContext(NavContext)

  const shelf = store.shelves.find((s) => s.id === currentShelfId)
  const book = store.books.find((b) => b.id === currentBookId)
  const tags = store.tags.filter((t) => t.shelfId === currentShelfId)
  const entries = store.entries.filter((e) => e.bookId === currentBookId)

  const confirm = useConfirm()
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  const pendingBook = useRef<Partial<Book> | null>(null)
  const pendingEntry = useRef<Partial<Entry> | null>(null)

  if (!shelf || !book) return null

  function openBookSettings() {
    pendingBook.current = null
    setDrawerMode('book-settings')
  }

  function openEntryCreate() {
    pendingEntry.current = null
    setEditingEntry(null)
    setDrawerMode('entry-create')
  }

  function openEntryEdit(entry: Entry) {
    pendingEntry.current = null
    setEditingEntry(entry)
    setDrawerMode('entry-edit')
  }

  async function closeDrawer() {
    const now = new Date().toISOString()

    if (drawerMode === 'book-settings') {
      const data = pendingBook.current
      if (data) {
        await updateStore((prev) => ({
          ...prev,
          books: prev.books.map((b) =>
            b.id === book.id ? { ...b, ...data, updatedAt: now } : b
          )
        }))
      }
      pendingBook.current = null
    }

    if (drawerMode === 'entry-create' || drawerMode === 'entry-edit') {
      const data = pendingEntry.current
      if (data) {
        if (drawerMode === 'entry-edit' && editingEntry) {
          await updateStore((prev) => ({
            ...prev,
            entries: prev.entries.map((e) =>
              e.id === editingEntry.id ? { ...e, ...data, updatedAt: now } : e
            )
          }))
        } else {
          const newEntry: Entry = {
            id: createId('entry'),
            bookId: currentBookId!,
            name: data.name!,
            description: data.description,
            icon: data.icon,
            color: data.color,
            order: entries.length + 1,
            actionType: data.actionType!,
            settings: data.settings ?? {},
            createdAt: now,
            updatedAt: now
          }
          await updateStore((prev) => ({ ...prev, entries: [...prev.entries, newEntry] }))
        }
      }
      pendingEntry.current = null
    }

    setDrawerMode(null)
    setEditingEntry(null)
  }

  async function handleDeleteEntry(entry: Entry) {
    if (!await confirm(`Delete entry "${entry.name}"?`)) return
    await updateStore((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== entry.id)
    }))
  }

  async function handleReorderEntries(draggedEntryId: string, targetEntryId: string) {
    if (draggedEntryId === targetEntryId) return

    const orderedEntries = [...entries].sort((a, b) => a.order - b.order)
    const draggedIndex = orderedEntries.findIndex((entry) => entry.id === draggedEntryId)
    const targetIndex = orderedEntries.findIndex((entry) => entry.id === targetEntryId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const nextEntries = [...orderedEntries]
    const [draggedEntry] = nextEntries.splice(draggedIndex, 1)
    nextEntries.splice(targetIndex, 0, draggedEntry)

    const now = new Date().toISOString()
    const reorderedMap = new Map(
      nextEntries.map((entry, index) => [
        entry.id,
        {
          ...entry,
          order: index + 1,
          updatedAt: now
        }
      ])
    )

    await updateStore((prev) => ({
      ...prev,
      entries: prev.entries.map((entry) => reorderedMap.get(entry.id) ?? entry)
    }))
  }

  const drawerTitle =
    drawerMode === 'book-settings' ? 'Book Settings'
    : drawerMode === 'entry-create' ? 'New Entry'
    : drawerMode === 'entry-edit' ? 'Edit Entry'
    : ''

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BookHeader book={book} onEditSettings={openBookSettings} />

      <EntryList
        entries={[...entries].sort((a, b) => a.order - b.order)}
        book={book}
        shelf={shelf}
        onAdd={openEntryCreate}
        onEdit={openEntryEdit}
        onDelete={handleDeleteEntry}
        onReorder={handleReorderEntries}
      />

      <SettingsDrawer open={drawerMode !== null} title={drawerTitle} onClose={closeDrawer}>
        {drawerMode === 'book-settings' && (
          <BookForm
            key={book.id}
            initial={book}
            tags={tags}
            onChange={(data) => { pendingBook.current = data }}
          />
        )}
        {(drawerMode === 'entry-create' || drawerMode === 'entry-edit') && (
          <EntryForm
            key={editingEntry?.id ?? 'new-entry'}
            initial={editingEntry ?? {}}
            onChange={(data) => { pendingEntry.current = data }}
          />
        )}
      </SettingsDrawer>
    </div>
  )
}
