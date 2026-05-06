import React, { useContext, useEffect } from 'react'
import { NavContext } from '../../context/NavContext'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { page, goBack } = useContext(NavContext)

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (e.button === 3 && page !== 'home') {
        e.preventDefault()
        goBack()
      }
    }
    window.addEventListener('mousedown', handleMouseDown)
    return () => window.removeEventListener('mousedown', handleMouseDown)
  }, [page, goBack])

  return (
    <div className="flex flex-col h-screen overflow-hidden theme-shell">
      {children}
    </div>
  )
}
