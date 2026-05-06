import { useState } from 'react'
import { runEntry } from '../services/runnerService'
import { RunEntryPayload, RunEntryResult } from '../../../shared/types/runner'

export function useRunEntry() {
  const [running, setRunning] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<RunEntryResult | null>(null)

  async function run(payload: RunEntryPayload): Promise<RunEntryResult> {
    setRunning(payload.entry.id)
    const result = await runEntry(payload)
    setLastResult(result)
    setRunning(null)
    return result
  }

  return { run, running, lastResult }
}
