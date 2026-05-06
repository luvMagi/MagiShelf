import React, { useContext, useState } from 'react'
import { Entry } from '../../../../shared/types/entry'
import { Book } from '../../../../shared/types/book'
import { Shelf } from '../../../../shared/types/shelf'
import { EntryCard } from './EntryCard'
import { StoreContext } from '../../context/StoreContext'
import { useRunEntry } from '../../hooks/useRunEntry'

type Props = {
  entries: Entry[]
  book: Book
  shelf: Shelf
  onAdd: () => void
  onEdit: (entry: Entry) => void
  onDelete: (entry: Entry) => void
  onReorder: (draggedEntryId: string, targetEntryId: string) => Promise<void>
}

export function EntryList({ entries, book, shelf, onAdd, onEdit, onDelete, onReorder }: Props) {
  const { store } = useContext(StoreContext)
  const { run, running } = useRunEntry()
  const [draggingEntryId, setDraggingEntryId] = useState<string | null>(null)
  const [dragOverEntryId, setDragOverEntryId] = useState<string | null>(null)

  async function handleDrop(targetEntryId: string) {
    if (!draggingEntryId || draggingEntryId === targetEntryId) {
      setDraggingEntryId(null)
      setDragOverEntryId(null)
      return
    }

    await onReorder(draggingEntryId, targetEntryId)
    setDraggingEntryId(null)
    setDragOverEntryId(null)
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium uppercase tracking-wide theme-text-muted">Entries</h2>
        <button
          onClick={onAdd}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all theme-ghost-button"
        >
          + Add Entry
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 theme-text-faint">
          <p className="text-base font-medium">No entries yet</p>
          <p className="text-sm mt-1">Add your first entry to this book</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              running={running === entry.id}
              isDragging={draggingEntryId === entry.id}
              isDropTarget={dragOverEntryId === entry.id && draggingEntryId !== entry.id}
              onDragStart={() => {
                setDraggingEntryId(entry.id)
                setDragOverEntryId(entry.id)
              }}
              onDragEnter={() => {
                if (draggingEntryId && draggingEntryId !== entry.id) {
                  setDragOverEntryId(entry.id)
                }
              }}
              onDrop={() => void handleDrop(entry.id)}
              onDragEnd={() => {
                setDraggingEntryId(null)
                setDragOverEntryId(null)
              }}
              onRun={() =>
                run({
                  shelf,
                  book,
                  entry,
                  appSettings: store.appSettings
                })
              }
              onEdit={() => onEdit(entry)}
              onDelete={() => onDelete(entry)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
