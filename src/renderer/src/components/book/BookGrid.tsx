import React from 'react'
import { Book } from '../../../../shared/types/book'
import { BookCard } from './BookCard'

type Props = {
  books: Book[]
  onSelect: (book: Book) => void
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
}

export function BookGrid({ books, onSelect, onEdit, onDelete }: Props) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 theme-text-faint">
        <p className="text-lg font-medium">No books yet</p>
        <p className="text-sm mt-1">Create your first book to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onClick={() => onSelect(book)}
          onEdit={() => onEdit(book)}
          onDelete={() => onDelete(book)}
        />
      ))}
    </div>
  )
}
