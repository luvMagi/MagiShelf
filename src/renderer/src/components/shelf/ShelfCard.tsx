import React, { useContext } from 'react'
import { motion } from 'framer-motion'
import { Shelf } from '../../../../shared/types/shelf'
import { StoreContext } from '../../context/StoreContext'

type Props = {
  shelf: Shelf
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ShelfCard({ shelf, onClick, onEdit, onDelete }: Props) {
  const { store } = useContext(StoreContext)
  const bookCount = store.books.filter((b) => b.shelfId === shelf.id).length
  const tagCount = store.tags.filter((t) => t.shelfId === shelf.id).length
  const iconAsset = store.icons.find((icon) => icon.id === shelf.icon)
  const fallbackLabel = shelf.name.slice(0, 1).toUpperCase()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group relative rounded-2xl backdrop-blur-xl border shadow-xl p-5 cursor-pointer overflow-hidden theme-card"
      style={{ borderLeft: `3px solid ${shelf.color ?? '#8b5cf6'}` }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${shelf.color ?? '#8b5cf6'}15, transparent 60%)`
        }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{
              backgroundColor: `${shelf.color ?? '#8b5cf6'}20`,
              color: shelf.color ?? '#8b5cf6'
            }}
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
            <h3 className="font-semibold theme-text-primary truncate">{shelf.name}</h3>
            {shelf.description && (
              <p className="text-sm theme-text-muted mt-0.5 truncate">{shelf.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <ActionBtn onClick={onEdit} title="Edit">
            <PencilIcon />
          </ActionBtn>
          <ActionBtn onClick={onDelete} title="Delete" danger>
            <TrashIcon />
          </ActionBtn>
        </div>
      </div>

      <div className="flex gap-4 mt-4 text-xs theme-text-muted">
        <span>{bookCount} book{bookCount !== 1 ? 's' : ''}</span>
        <span>{tagCount} tag{tagCount !== 1 ? 's' : ''}</span>
      </div>
    </motion.div>
  )
}

function ActionBtn({ onClick, title, danger, children }: { onClick: () => void; title: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors
        ${danger ? 'hover:bg-red-500/20 theme-text-muted hover:text-red-400' : 'theme-ghost-button'}`}
    >
      {children}
    </button>
  )
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M9.5 1.5L11.5 3.5L4 11H2V9L9.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
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
