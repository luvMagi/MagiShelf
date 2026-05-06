import React, { useState } from 'react'
import { WorkspaceInfo } from '../../../../shared/types/workspace'

type Props = {
  activeWorkspaceId?: string
  recentWorkspaces: WorkspaceInfo[]
  compact?: boolean
  onCreateWorkspace: (name: string) => Promise<void>
  onActivateWorkspace: (workspaceId: string) => Promise<void>
}

export function WorkspacePanel({
  activeWorkspaceId,
  recentWorkspaces,
  compact,
  onCreateWorkspace,
  onActivateWorkspace
}: Props) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return

    setSubmitting(true)
    setError(null)
    try {
      await onCreateWorkspace(trimmed)
      setName('')
    } catch (err) {
      setError(String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium theme-text-primary">Profiles</p>
        <p className="text-xs theme-text-muted mt-1">
          Each workspace has its own store, icons, shelves, books, entries, and settings.
        </p>
      </div>

      <div className="rounded-2xl border p-4 theme-card">
        <p className="text-xs font-medium uppercase tracking-wide mb-3 theme-text-muted">
          Create New Profile
        </p>
        <div className={`flex ${compact ? 'flex-col' : 'items-center'} gap-2`}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-sm theme-input"
          />
          <button
            onClick={() => void handleCreate()}
            disabled={submitting || !name.trim()}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              submitting || !name.trim()
                ? 'theme-accent-button cursor-not-allowed'
                : 'theme-accent-button'
            }`}
          >
            {submitting ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
        {error && <p className="text-sm theme-danger-text mt-3">{error}</p>}
      </div>

      <div className="rounded-2xl border p-4 theme-card">
        <p className="text-xs font-medium uppercase tracking-wide mb-3 theme-text-muted">
          Existing Profiles
        </p>

        {recentWorkspaces.length === 0 ? (
          <p className="text-sm theme-text-faint">No profiles yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentWorkspaces.map((workspace) => {
              const isActive = workspace.id === activeWorkspaceId
              return (
                <button
                  key={workspace.id}
                  onClick={() => void onActivateWorkspace(workspace.id)}
                  className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                    isActive
                      ? 'theme-card border-[color:var(--border-accent)] shadow-lg'
                      : 'theme-card theme-card-interactive'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium theme-text-secondary truncate">{workspace.name}</p>
                      <p className="text-xs theme-text-faint truncate mt-1">{workspace.path}</p>
                    </div>
                    {isActive && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-medium theme-accent-pill">
                        Active
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
