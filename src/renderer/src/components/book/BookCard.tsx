import React, { useContext } from 'react'
import { motion } from 'framer-motion'
import { Book } from '../../../../shared/types/book'
import { StoreContext } from '../../context/StoreContext'

type Props = {
  book: Book
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

export function BookCard({ book, onClick, onEdit, onDelete }: Props) {
  const { store } = useContext(StoreContext)
  const entryCount = store.entries.filter((e) => e.bookId === book.id).length
  const primaryTag = store.tags.find((t) => t.id === book.primaryTagId)
  const accentColor = book.color ?? primaryTag?.color ?? '#8b5cf6'
  const iconAsset = store.icons.find((icon) => icon.id === book.icon)
  const fallbackLabel = book.name.slice(0, 1).toUpperCase()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className="group relative rounded-2xl backdrop-blur-xl border shadow-xl p-5 cursor-pointer overflow-hidden theme-card"
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${accentColor}12, transparent 60%)` }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center text-sm font-semibold flex-shrink-0"
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
            <div className="font-semibold theme-text-primary truncate">{book.name}</div>
            {book.subtitle && <div className="text-xs theme-text-muted mt-0.5 truncate">{book.subtitle}</div>}
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

      {book.description && (
        <p className="text-xs theme-text-faint mt-3 line-clamp-2">{book.description}</p>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-1 flex-wrap">
          {book.tagIds.map((tid) => {
            const tag = store.tags.find((t) => t.id === tid)
            if (!tag) return null
            return (
              <span
                key={tid}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ backgroundColor: `${tag.color ?? accentColor}20`, color: tag.color ?? accentColor }}
              >
                {tag.name}
              </span>
            )
          })}
        </div>
        <span className="text-xs font-medium theme-text-faint flex-shrink-0">{entryCount} entries</span>
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
