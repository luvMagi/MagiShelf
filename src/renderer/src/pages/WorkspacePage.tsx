import React, { useContext } from 'react'
import { WorkspaceContext } from '../context/WorkspaceContext'
import { WorkspacePanel } from '../components/workspace/WorkspacePanel'

export function WorkspacePage() {
  const { recentWorkspaces, createWorkspace, activateWorkspace } = useContext(WorkspaceContext)

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 theme-shell">
      <div className="w-full max-w-4xl rounded-[32px] border shadow-2xl overflow-hidden theme-panel">
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          <div
            className="relative px-8 py-10 border-r"
            style={{
              borderColor: 'var(--border-subtle)',
              background:
                'radial-gradient(circle at top left, var(--success-soft), transparent 45%), radial-gradient(circle at bottom right, var(--accent-soft), transparent 45%)'
            }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs uppercase tracking-[0.16em] theme-card theme-text-muted">
              Workspace Profiles
            </div>
            <h1 className="text-4xl font-bold theme-text-primary mt-6 leading-tight">
              Isolated environments for every app stack.
            </h1>
            <p className="text-sm theme-text-muted mt-4 max-w-md leading-relaxed">
              Create a profile for each application or workflow. Every profile gets its own store,
              icons, shelves, books, entries, and settings folder.
            </p>

            {recentWorkspaces.length > 0 && (
              <div className="mt-10 flex flex-col gap-3">
                {recentWorkspaces.slice(0, 3).map((workspace) => (
                  <div
                    key={workspace.id}
                    className="rounded-2xl border px-4 py-3 theme-card"
                  >
                    <p className="text-sm font-medium theme-text-secondary">{workspace.name}</p>
                    <p className="text-xs theme-text-faint truncate mt-1">{workspace.path}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-8 py-10">
            <WorkspacePanel
              recentWorkspaces={recentWorkspaces}
              compact
              onCreateWorkspace={createWorkspace}
              onActivateWorkspace={activateWorkspace}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
