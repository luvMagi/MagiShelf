import React from 'react'
import { Tag } from '../../../../shared/types/tag'

type Props = {
  tags: Tag[]
  selectedTagId: string | null
  onSelect: (tagId: string | null) => void
  onAdd: () => void
  onEdit: (tag: Tag) => void
  onDelete: (tag: Tag) => void
}

export function TagBar({ tags, selectedTagId, onSelect, onAdd, onEdit, onDelete }: Props) {
  const visible = tags.filter((t) => t.visible)

  return (
    <div
      className="flex items-center gap-2 px-6 py-3 border-b flex-shrink-0 overflow-x-auto"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
          selectedTagId === null ? 'theme-card theme-text-primary' : 'theme-text-muted theme-ghost-button'
        }`}
      >
        All
      </button>

      {visible.map((tag) => (
        <TagPill
          key={tag.id}
          tag={tag}
          selected={selectedTagId === tag.id}
          onSelect={() => onSelect(tag.id)}
          onEdit={() => onEdit(tag)}
          onDelete={() => onDelete(tag)}
        />
      ))}

      <button
        onClick={onAdd}
        className="ml-auto flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors theme-ghost-button"
      >
        + Tag
      </button>
    </div>
  )
}

function TagPill({
  tag,
  selected,
  onSelect,
  onEdit,
  onDelete
}: {
  tag: Tag
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="group flex items-center gap-0.5 flex-shrink-0">
      <button
        onClick={onSelect}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          selected ? 'theme-text-primary' : 'theme-text-muted theme-ghost-button'
        }`}
        style={
          selected
            ? {
                backgroundColor: `${tag.color ?? '#8b5cf6'}30`,
                color: tag.color ?? '#8b5cf6',
                boxShadow: `0 0 0 1px ${tag.color ?? '#8b5cf6'}50`
              }
            : {}
        }
      >
        {tag.name}
      </button>
      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="w-5 h-5 flex items-center justify-center theme-text-faint hover:text-[color:var(--text-secondary)] transition-colors text-xs"
        >
          ✎
        </button>
        <button
          onClick={onDelete}
          className="w-5 h-5 flex items-center justify-center theme-text-faint hover:text-red-400 transition-colors text-xs"
        >
          ×
        </button>
      </div>
    </div>
  )
}
