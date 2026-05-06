import React from 'react'
import { Shelf } from '../../../../shared/types/shelf'
import { ShelfCard } from './ShelfCard'

type Props = {
  shelves: Shelf[]
  onSelect: (shelf: Shelf) => void
  onEdit: (shelf: Shelf) => void
  onDelete: (shelf: Shelf) => void
}

export function ShelfGrid({ shelves, onSelect, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {shelves.map((shelf) => (
        <ShelfCard
          key={shelf.id}
          shelf={shelf}
          onClick={() => onSelect(shelf)}
          onEdit={() => onEdit(shelf)}
          onDelete={() => onDelete(shelf)}
        />
      ))}
    </div>
  )
}
