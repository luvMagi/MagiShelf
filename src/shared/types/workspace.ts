export type WorkspaceInfo = {
  id: string
  name: string
  path: string
  createdAt: string
  updatedAt: string
  lastOpenedAt: string
}

export type WorkspaceStatus = {
  activeWorkspace: WorkspaceInfo | null
  recentWorkspaces: WorkspaceInfo[]
}
