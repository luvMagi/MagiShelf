import React, { createContext, useCallback, useEffect, useState } from 'react'
import { WorkspaceInfo } from '../../../shared/types/workspace'
import {
  activateWorkspace as activateWorkspaceService,
  createWorkspace as createWorkspaceService,
  getWorkspaceStatus
} from '../services/workspaceService'

type WorkspaceContextValue = {
  loading: boolean
  activeWorkspace: WorkspaceInfo | null
  recentWorkspaces: WorkspaceInfo[]
  createWorkspace: (name: string) => Promise<void>
  activateWorkspace: (workspaceId: string) => Promise<void>
}

export const WorkspaceContext = createContext<WorkspaceContextValue>({
  loading: true,
  activeWorkspace: null,
  recentWorkspaces: [],
  createWorkspace: async () => {},
  activateWorkspace: async () => {}
})

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceInfo | null>(null)
  const [recentWorkspaces, setRecentWorkspaces] = useState<WorkspaceInfo[]>([])

  const refresh = useCallback(async () => {
    const status = await getWorkspaceStatus()
    setActiveWorkspace(status.activeWorkspace)
    setRecentWorkspaces(status.recentWorkspaces)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createWorkspace = useCallback(async (name: string) => {
    const status = await createWorkspaceService(name)
    setActiveWorkspace(status.activeWorkspace)
    setRecentWorkspaces(status.recentWorkspaces)
  }, [])

  const activateWorkspace = useCallback(async (workspaceId: string) => {
    const status = await activateWorkspaceService(workspaceId)
    setActiveWorkspace(status.activeWorkspace)
    setRecentWorkspaces(status.recentWorkspaces)
  }, [])

  return (
    <WorkspaceContext.Provider
      value={{
        loading,
        activeWorkspace,
        recentWorkspaces,
        createWorkspace,
        activateWorkspace
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}
