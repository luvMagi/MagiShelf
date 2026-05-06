import React, { createContext, useState } from 'react'

export type Page = 'home' | 'shelf' | 'book'

type NavContextValue = {
  page: Page
  currentShelfId: string | null
  currentBookId: string | null
  navigateTo: (page: Page, shelfId?: string, bookId?: string) => void
  goBack: () => void
}

export const NavContext = createContext<NavContextValue>({
  page: 'home',
  currentShelfId: null,
  currentBookId: null,
  navigateTo: () => {},
  goBack: () => {}
})

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<Page>('home')
  const [currentShelfId, setCurrentShelfId] = useState<string | null>(null)
  const [currentBookId, setCurrentBookId] = useState<string | null>(null)

  function navigateTo(nextPage: Page, shelfId?: string, bookId?: string) {
    setPage(nextPage)
    if (shelfId !== undefined) setCurrentShelfId(shelfId)
    if (bookId !== undefined) setCurrentBookId(bookId)
  }

  function goBack() {
    if (page === 'book') {
      setPage('shelf')
      setCurrentBookId(null)
    } else if (page === 'shelf') {
      setPage('home')
      setCurrentShelfId(null)
    }
  }

  return (
    <NavContext.Provider value={{ page, currentShelfId, currentBookId, navigateTo, goBack }}>
      {children}
    </NavContext.Provider>
  )
}
