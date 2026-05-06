import { RunEntryPayload, RunEntryResult } from '../../../shared/types/runner'

export async function runEntry(payload: RunEntryPayload): Promise<RunEntryResult> {
  return window.magiShelf.runner.runEntry(payload)
}
