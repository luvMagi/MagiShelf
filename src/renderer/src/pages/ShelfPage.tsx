import React, { useContext, useRef, useState } from 'react'
import { StoreContext } from '../context/StoreContext'
import { NavContext } from '../context/NavContext'
import { TagBar } from '../components/tag/TagBar'
import { BookGrid } from '../components/book/BookGrid'
import { SettingsDrawer } from '../components/settings/SettingsDrawer'
import { TagForm } from '../components/settings/TagForm'
import { BookForm } from '../components/settings/BookForm'
import { Tag } from '../../../shared/types/tag'
import { Book } from '../../../shared/types/book'
import { createId } from '../../../shared/utils/id'
import { filterBooksByTag } from '../../../shared/utils/grouping'
import { useConfirm } from '../components/ui/ConfirmDialog'

type DrawerMode = 'tag-create' | 'tag-edit' | 'book-create' | 'book-edit' | null

export function ShelfPage() {
  const { store, updateStore } = useContext(StoreContext)
  const { currentShelfId, navigateTo } = useContext(NavContext)

  const confirm = useConfirm()
  const shelf = store.shelves.find((s) => s.id === currentShelfId)
  const tags = store.tags.filter((t) => t.shelfId === currentShelfId)
  const books = store.books.filter((b) => b.shelfId === currentShelfId)

  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  const pendingTag = useRef<Partial<Tag> | null>(null)
  const pendingBook = useRef<Partial<Book> | null>(null)

  if (!shelf) return null

  const filteredBooks = filterBooksByTag(books, selectedTagId ?? undefined)

  function openTagCreate() {
    pendingTag.current = null
    setEditingTag(null)
    setDrawerMode('tag-create')
  }

  function openTagEdit(tag: Tag) {
    pendingTag.current = null
    setEditingTag(tag)
    setDrawerMode('tag-edit')
  }

  function openBookCreate() {
    pendingBook.current = null
    setEditingBook(null)
    setDrawerMode('book-create')
  }

  function openBookEdit(book: Book) {
    pendingBook.current = null
    setEditingBook(book)
    setDrawerMode('book-edit')
  }

  async function closeDrawer() {
    const now = new Date().toISOString()

    if (drawerMode === 'tag-create' || drawerMode === 'tag-edit') {
      const data = pendingTag.current
      if (data) {
        if (drawerMode === 'tag-edit' && editingTag) {
          await updateStore((prev) => ({
            ...prev,
            tags: prev.tags.map((t) =>
              t.id === editingTag.id ? { ...t, ...data, updatedAt: now } : t
            )
          }))
        } else {
          const newTag: Tag = {
            id: createId('tag'),
            shelfId: currentShelfId!,
            name: data.name!,
            description: data.description,
            color: data.color,
            icon: data.icon,
            order: tags.length + 1,
            visible: data.visible ?? true,
            createdAt: now,
            updatedAt: now
          }
          await updateStore((prev) => ({ ...prev, tags: [...prev.tags, newTag] }))
        }
      }
      pendingTag.current = null
    }

    if (drawerMode === 'book-create' || drawerMode === 'book-edit') {
      const data = pendingBook.current
      if (data) {
        if (drawerMode === 'book-edit' && editingBook) {
          await updateStore((prev) => ({
            ...prev,
            books: prev.books.map((b) =>
              b.id === editingBook.id ? { ...b, ...data, updatedAt: now } : b
            )
          }))
        } else {
          const newBook: Book = {
            id: createId('book'),
            shelfId: currentShelfId!,
            name: data.name!,
            subtitle: data.subtitle,
            description: data.description,
            color: data.color,
            tagIds: data.tagIds ?? [],
            primaryTagId: data.primaryTagId,
            order: books.length + 1,
            settings: data.settings ?? {},
            createdAt: now,
            updatedAt: now
          }
          await updateStore((prev) => ({ ...prev, books: [...prev.books, newBook] }))
        }
      }
      pendingBook.current = null
    }

    setDrawerMode(null)
    setEditingTag(null)
    setEditingBook(null)
  }

  async function handleDeleteTag(tag: Tag) {
    if (!await confirm(`Delete tag "${tag.name}"?`)) return
    await updateStore((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t.id !== tag.id),
      books: prev.books.map((b) => ({
        ...b,
        tagIds: b.tagIds.filter((tid) => tid !== tag.id),
        primaryTagId: b.primaryTagId === tag.id ? undefined : b.primaryTagId
      }))
    }))
    if (selectedTagId === tag.id) setSelectedTagId(null)
  }

  async function handleDeleteBook(book: Book) {
    if (!await confirm(`Delete book "${book.name}"?`, 'This will also delete all its entries.')) return
    await updateStore((prev) => ({
      ...prev,
      books: prev.books.filter((b) => b.id !== book.id),
      entries: prev.entries.filter((e) => e.bookId !== book.id)
    }))
  }

  const drawerTitle =
    drawerMode === 'tag-create'
      ? 'New Tag'
      : drawerMode === 'tag-edit'
        ? 'Edit Tag'
        : drawerMode === 'book-create'
          ? 'New Book'
          : drawerMode === 'book-edit'
            ? 'Edit Book'
            : ''

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TagBar
        tags={tags}
        selectedTagId={selectedTagId}
        onSelect={setSelectedTagId}
        onAdd={openTagCreate}
        onEdit={openTagEdit}
        onDelete={handleDeleteTag}
      />

      <div
        className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h2 className="text-sm font-medium theme-text-muted">
          {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}
          {selectedTagId && ' · filtered'}
        </h2>
        <button
          onClick={openBookCreate}
          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all theme-accent-button"
        >
          + New Book
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <BookGrid
          books={[...filteredBooks].sort((a, b) => a.order - b.order)}
          onSelect={(book) => navigateTo('book', currentShelfId!, book.id)}
          onEdit={openBookEdit}
          onDelete={handleDeleteBook}
        />
      </div>

      <SettingsDrawer open={drawerMode !== null} title={drawerTitle} onClose={closeDrawer}>
        {(drawerMode === 'tag-create' || drawerMode === 'tag-edit') && (
          <TagForm
            key={editingTag?.id ?? 'new-tag'}
            initial={editingTag ?? {}}
            onChange={(data) => {
              pendingTag.current = data
            }}
          />
        )}
        {(drawerMode === 'book-create' || drawerMode === 'book-edit') && (
          <BookForm
            key={editingBook?.id ?? 'new-book'}
            initial={editingBook ?? {}}
            tags={tags}
            onChange={(data) => {
              pendingBook.current = data
            }}
          />
        )}
      </SettingsDrawer>
    </div>
  )
}
