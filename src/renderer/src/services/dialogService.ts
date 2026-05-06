type PickPathMode = 'file' | 'folder'

export async function pickPath(params: {
  mode: PickPathMode
  title: string
  defaultPath?: string
}): Promise<string | null> {
  return window.magiShelf.dialog.pickPath(params)
}
