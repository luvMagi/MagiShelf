import { Book } from '../types/book'
import { Tag } from '../types/tag'

export function groupBooksByTag(
  books: Book[],
  tags: Tag[]
): Array<{ tag: Tag; books: Book[] }> {
  return tags
    .filter((tag) => tag.visible)
    .sort((a, b) => a.order - b.order)
    .map((tag) => ({
      tag,
      books: books.filter((book) => book.tagIds.includes(tag.id))
    }))
}

export function filterBooksByTag(books: Book[], tagId?: string): Book[] {
  if (!tagId) return books
  return books.filter((book) => book.tagIds.includes(tagId))
}
