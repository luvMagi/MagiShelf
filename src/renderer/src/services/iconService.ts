import { IconAsset } from '../../../shared/types/icon'

type SaveIconPayload = {
  code: string
  name: string
  dataUrl: string
}

export async function saveIcon(payload: SaveIconPayload): Promise<IconAsset> {
  return window.magiShelf.icons.save(payload)
}

export async function deleteIcon(filePath: string): Promise<void> {
  await window.magiShelf.icons.delete(filePath)
}
