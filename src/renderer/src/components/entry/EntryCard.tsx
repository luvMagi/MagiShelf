import React, { useContext, useState } from 'react'
import { motion } from 'framer-motion'
import { Entry } from '../../../../shared/types/entry'
import { StoreContext } from '../../context/StoreContext'

type Props = {
  entry: Entry
  running: boolean
  isDragging: boolean
  isDropTarget: boolean
  onDragStart: () => void
  onDragEnter: () => void
  onDrop: () => void
  onDragEnd: () => void
  onRun: () => Promise<void>
  onEdit: () => void
  onDelete: () => void
}

const ACTION_LABELS: Record<string, string> = {
  'open-app': 'App',
  'open-folder': 'Folder',
  'open-file': 'File',
  'open-url': 'URL',
  'run-command': 'Command',
  'prepare-powershell': 'PowerShell'
}

const ACTION_COLORS: Record<string, string> = {
  'open-app': '#10b981',
  'open-folder': '#f59e0b',
  'open-file': '#3b82f6',
  'open-url': '#06b6d4',
  'run-command': '#8b5cf6',
  'prepare-powershell': '#ec4899'
}

function getEntryHint(entry: Entry): string {
  const s = entry.settings
  switch (entry.actionType) {
    case 'open-app':
      return s.appPath ?? ''
    case 'open-folder':
      return s.folderPath ?? ''
    case 'open-file':
      return s.filePath ?? ''
    case 'open-url':
      return s.url ?? ''
    case 'run-command':
    case 'prepare-powershell':
      return [s.command, ...(s.args ?? [])].filter(Boolean).join(' ')
    default:
      return ''
  }
}

export function EntryCard({
  entry,
  running,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnter,
  onDrop,
  onDragEnd,
  onRun,
  onEdit,
  onDelete
}: Props) {
  const { store } = useContext(StoreContext)
  const [error, setError] = useState<string | null>(null)
  const accentColor = entry.color ?? ACTION_COLORS[entry.actionType] ?? '#8b5cf6'
  const hint = getEntryHint(entry)
  const iconAsset = store.icons.find((icon) => icon.id === entry.icon)
  const fallbackLabel = entry.name.slice(0, 1).toUpperCase()

  async function handleRun() {
    if (running) return
    setError(null)
    const result = await (onRun() as Promise<{ success?: boolean; error?: string }>)
    if (result && !result.success && result.error) {
      setError(result.error)
      setTimeout(() => setError(null), 5000)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', entry.id)
        onDragStart()
      }}
      onDragEnter={(event) => {
        event.preventDefault()
        onDragEnter()
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDrop()
      }}
      onDragEnd={onDragEnd}
      onContextMenu={(event) => {
        event.preventDefault()
        onEdit()
      }}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        isDragging
          ? 'opacity-50 theme-card'
          : isDropTarget
            ? 'theme-card border-[color:var(--border-accent)] shadow-lg'
            : 'theme-card theme-card-interactive'
      }`}
    >
      <div className="flex flex-col items-center justify-center theme-text-faint cursor-grab active:cursor-grabbing select-none">
        <span className="text-[10px] leading-none">⋮</span>
        <span className="text-[10px] leading-none -mt-0.5">⋮</span>
      </div>

      <div
        className="w-1 self-stretch rounded-full flex-shrink-0"
        style={{ backgroundColor: accentColor }}
      />

      <div
        onClick={() => {
          void handleRun()
        }}
        title={running ? 'Running...' : 'Run entry'}
        className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all ${
          running ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-105 active:scale-95'
        }`}
        style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
      >
        {iconAsset ? (
          <img
            src={iconAsset.previewDataUrl}
            alt={iconAsset.name}
            className="w-full h-full object-cover"
          />
        ) : (
          fallbackLabel
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium theme-text-secondary">{entry.name}</span>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            {ACTION_LABELS[entry.actionType]}
          </span>
        </div>
        {entry.description && <p className="text-xs font-medium theme-text-muted mt-0.5 truncate">{entry.description}</p>}
        {hint && <p className="text-[11px] font-medium font-mono theme-text-muted mt-0.5 truncate">{hint}</p>}
        {error && <p className="text-xs theme-danger-text mt-1 truncate">{error}</p>}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <ActionBtn onClick={() => void handleRun()} title="Run">
          <RunIcon />
        </ActionBtn>
        <ActionBtn onClick={onEdit} title="Edit">
          <EditIcon />
        </ActionBtn>
        <ActionBtn onClick={onDelete} title="Delete" danger>
          <TrashIcon />
        </ActionBtn>
      </div>
    </motion.div>
  )
}

function ActionBtn({
  onClick,
  title,
  danger,
  children
}: {
  onClick: () => void
  title: string
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
        danger ? 'hover:bg-red-500/20 theme-text-faint hover:text-red-400' : 'theme-ghost-button'
      }`}
    >
      {children}
    </button>
  )
}

function RunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M3.5 2.5L10.5 6.5L3.5 10.5V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M9 2.5L10.5 4L5 9.5H3.5V8L9 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M2 3.5H11M4.5 3.5V2.5H8.5V3.5M5 6V10M8 6V10M3 3.5L3.5 11H9.5L10 3.5H3Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
