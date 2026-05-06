import { mkdir, unlink, writeFile } from 'fs/promises'
import { join } from 'path'
import { createId } from '../../shared/utils/id'
import { IconAsset } from '../../shared/types/icon'
import { getActiveWorkspaceOrThrow } from '../workspace/workspaceManager'

type SaveIconPayload = {
  code: string
  name: string
  dataUrl: string
}

function getIconsDir(): string {
  const workspace = getActiveWorkspaceOrThrow()
  return join(workspace.path, 'icons')
}

function decodeDataUrl(dataUrl: string): Buffer {
  const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/)
  if (!match) {
    throw new Error('Invalid image payload')
  }
  return Buffer.from(match[1], 'base64')
}

export async function saveIconAsset(payload: SaveIconPayload): Promise<IconAsset> {
  const id = createId('icon')
  const now = new Date().toISOString()
  const fileName = `${payload.code}.png`
  const filePath = join(getIconsDir(), fileName)
  const fileBuffer = decodeDataUrl(payload.dataUrl)

  await mkdir(getIconsDir(), { recursive: true })
  await writeFile(filePath, fileBuffer)

  return {
    id,
    code: payload.code,
    name: payload.code,
    fileName,
    filePath,
    previewDataUrl: payload.dataUrl,
    createdAt: now,
    updatedAt: now
  }
}

export async function deleteIconAsset(filePath: string): Promise<void> {
  try {
    await unlink(filePath)
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code !== 'ENOENT') {
      throw error
    }
  }
}
