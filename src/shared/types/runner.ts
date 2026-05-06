import { Shelf } from './shelf'
import { Book } from './book'
import { Entry } from './entry'
import { AppSettings } from './store'

export type RunEntryPayload = {
  shelf: Shelf
  book: Book
  entry: Entry
  appSettings: AppSettings
}

export type RunEntryResult = {
  success: boolean
  message?: string
  error?: string
}
