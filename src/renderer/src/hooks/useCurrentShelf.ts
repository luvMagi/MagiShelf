import { useContext } from 'react'
import { StoreContext } from '../context/StoreContext'
import { NavContext } from '../context/NavContext'

export function useCurrentShelf() {
  const { store } = useContext(StoreContext)
  const { currentShelfId } = useContext(NavContext)

  const shelf = store.shelves.find((s) => s.id === currentShelfId) ?? null
  const tags = store.tags.filter((t) => t.shelfId === currentShelfId)
  const books = store.books.filter((b) => b.shelfId === currentShelfId)

  return { shelf, tags, books }
}
