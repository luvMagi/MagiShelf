import React, { useContext } from 'react'
import { StoreProvider } from './context/StoreContext'
import { NavProvider, NavContext } from './context/NavContext'
import { ConfirmProvider } from './components/ui/ConfirmDialog'
import { AppLayout } from './components/layout/AppLayout'
import { TopBar } from './components/layout/TopBar'
import { HomePage } from './pages/HomePage'
import { ShelfPage } from './pages/ShelfPage'
import { BookPage } from './pages/BookPage'
import { WorkspaceProvider, WorkspaceContext } from './context/WorkspaceContext'
import { WorkspacePage } from './pages/WorkspacePage'
import { ThemeProvider } from './context/ThemeContext'

function PageRouter() {
  const { page } = useContext(NavContext)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {page === 'home' && <HomePage />}
      {page === 'shelf' && <ShelfPage />}
      {page === 'book' && <BookPage />}
    </div>
  )
}

function Shell({ workspaceKey }: { workspaceKey: string }) {
  return (
    <StoreProvider key={workspaceKey}>
      <ThemeProvider key={workspaceKey}>
        <NavProvider key={workspaceKey}>
          <ConfirmProvider>
            <AppLayout>
              <TopBar />
              <PageRouter />
            </AppLayout>
          </ConfirmProvider>
        </NavProvider>
      </ThemeProvider>
    </StoreProvider>
  )
}

function WorkspaceGate() {
  const { loading, activeWorkspace } = useContext(WorkspaceContext)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-shell theme-text-muted text-sm">
        Loading workspaces...
      </div>
    )
  }

  if (!activeWorkspace) {
    return <WorkspacePage />
  }

  return <Shell workspaceKey={activeWorkspace.id} />
}

export default function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceGate />
    </WorkspaceProvider>
  )
}
