import { ThemeCatalog } from '../../../shared/types/theme'

export async function getThemeCatalog(): Promise<ThemeCatalog> {
  return window.magiShelf.theme.getCatalog()
}
