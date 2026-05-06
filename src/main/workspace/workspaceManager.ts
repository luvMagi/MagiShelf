import Store from 'electron-store'
import { app } from 'electron'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { WorkspaceInfo, WorkspaceStatus } from '../../shared/types/workspace'
import { createId } from '../../shared/utils/id'
import { initializeWorkspaceThemes } from '../theme/themeManager'

type WorkspaceRegistryState = {
  activeWorkspaceId: string | null
  recentWorkspaces: WorkspaceInfo[]
}

const registryStore = new Store<WorkspaceRegistryState>({
  name: 'magishelf-workspaces',
  defaults: {
    activeWorkspaceId: null,
    recentWorkspaces: []
  }
})

function getManagedWorkspacesRoot(): string {
  return join(app.getPath('userData'), 'workspaces')
}

function normalizeWorkspaceList(workspaces: WorkspaceInfo[]): WorkspaceInfo[] {
  return workspaces
    .filter((workspace) => workspace.path && existsSync(workspace.path))
    .sort((a, b) => Date.parse(b.lastOpenedAt) - Date.parse(a.lastOpenedAt))
}

function getRegistryState(): WorkspaceRegistryState {
  const recentWorkspaces = normalizeWorkspaceList(registryStore.get('recentWorkspaces') ?? [])
  const activeWorkspaceId = registryStore.get('activeWorkspaceId') ?? null

  if (
    activeWorkspaceId &&
    !recentWorkspaces.some((workspace) => workspace.id === activeWorkspaceId)
  ) {
    registryStore.set('activeWorkspaceId', null)
    registryStore.set('recentWorkspaces', recentWorkspaces)
    return {
      activeWorkspaceId: null,
      recentWorkspaces
    }
  }

  registryStore.set('recentWorkspaces', recentWorkspaces)

  return {
    activeWorkspaceId,
    recentWorkspaces
  }
}

export function getWorkspaceStatus(): WorkspaceStatus {
  const state = getRegistryState()
  const activeWorkspace =
    state.recentWorkspaces.find((workspace) => workspace.id === state.activeWorkspaceId) ?? null

  return {
    activeWorkspace,
    recentWorkspaces: state.recentWorkspaces
  }
}

export async function createWorkspace(name: string): Promise<WorkspaceStatus> {
  const trimmedName = name.trim()
  if (!trimmedName) {
    throw new Error('Workspace name is required')
  }

  await mkdir(getManagedWorkspacesRoot(), { recursive: true })

  const id = createId('workspace')
  const now = new Date().toISOString()
  const slug = slugify(trimmedName)
  const path = join(getManagedWorkspacesRoot(), `${slug}-${id.slice(-8)}`)

  await mkdir(path, { recursive: true })
  await mkdir(join(path, 'icons'), { recursive: true })
  await initializeWorkspaceThemes(path)

  const workspace: WorkspaceInfo = {
    id,
    name: trimmedName,
    path,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now
  }

  const state = getRegistryState()
  const recentWorkspaces = normalizeWorkspaceList([workspace, ...state.recentWorkspaces])

  registryStore.set('recentWorkspaces', recentWorkspaces)
  registryStore.set('activeWorkspaceId', workspace.id)

  return getWorkspaceStatus()
}

export function activateWorkspace(workspaceId: string): WorkspaceStatus {
  const state = getRegistryState()
  const workspace = state.recentWorkspaces.find((item) => item.id === workspaceId)

  if (!workspace) {
    throw new Error('Workspace not found')
  }

  const now = new Date().toISOString()
  const recentWorkspaces = normalizeWorkspaceList(
    state.recentWorkspaces.map((item) =>
      item.id === workspaceId
        ? { ...item, updatedAt: now, lastOpenedAt: now }
        : item
    )
  )

  registryStore.set('recentWorkspaces', recentWorkspaces)
  registryStore.set('activeWorkspaceId', workspaceId)

  return getWorkspaceStatus()
}

export function getActiveWorkspaceOrThrow(): WorkspaceInfo {
  const status = getWorkspaceStatus()
  if (!status.activeWorkspace) {
    throw new Error('No active workspace selected')
  }
  return status.activeWorkspace
}

function slugify(name: string): string {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'workspace'
}
