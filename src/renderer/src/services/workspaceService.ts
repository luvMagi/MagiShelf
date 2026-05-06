import { WorkspaceStatus } from '../../../shared/types/workspace'

export async function getWorkspaceStatus(): Promise<WorkspaceStatus> {
  return window.magiShelf.workspace.getStatus()
}

export async function createWorkspace(name: string): Promise<WorkspaceStatus> {
  return window.magiShelf.workspace.create(name)
}

export async function activateWorkspace(workspaceId: string): Promise<WorkspaceStatus> {
  return window.magiShelf.workspace.activate(workspaceId)
}
