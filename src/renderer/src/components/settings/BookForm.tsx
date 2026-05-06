import React, { useEffect, useState } from 'react'
import { Book, BookSettings, ShellType } from '../../../../shared/types/book'
import { Tag } from '../../../../shared/types/tag'
import { FormField, FormInput, FormTextarea, FormSelect, FormCheckbox } from './FormField'
import { ColorPicker } from './ColorPicker'
import { IconSelector } from '../icons/IconSelector'

type Props = {
  initial?: Partial<Book>
  tags: Tag[]
  onChange: (data: Partial<Book> | null) => void
}

const SHELL_OPTIONS: ShellType[] = ['powershell', 'cmd', 'git-bash']

export function BookForm({ initial = {}, tags, onChange }: Props) {
  const [name, setName] = useState(initial.name ?? '')
  const [subtitle, setSubtitle] = useState(initial.subtitle ?? '')
  const [description, setDescription] = useState(initial.description ?? '')
  const [icon, setIcon] = useState(initial.icon)
  const [color, setColor] = useState(initial.color ?? '#8b5cf6')
  const [tagIds, setTagIds] = useState<string[]>(initial.tagIds ?? [])
  const [primaryTagId, setPrimaryTagId] = useState(initial.primaryTagId ?? '')
  const [settings, setSettings] = useState<BookSettings>(
    initial.settings ?? {
      defaultWorkingDir: '',
      defaultShell: 'powershell',
      defaultRunMode: 'prepare',
      beforeRunConfirm: false,
      keepTerminalOpen: true
    }
  )

  useEffect(() => {
    if (primaryTagId && !tagIds.includes(primaryTagId)) {
      setTagIds((prev) => [...prev, primaryTagId])
    }
  }, [primaryTagId])

  useEffect(() => {
    if (name.trim()) {
      onChange({
        name: name.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim() || undefined,
        icon,
        color,
        tagIds,
        primaryTagId: primaryTagId || undefined,
        settings
      })
    } else {
      onChange(null)
    }
  }, [name, subtitle, description, icon, color, tagIds, primaryTagId, settings])

  function toggleTag(id: string) {
    const next = tagIds.includes(id)
      ? tagIds.filter((t) => t !== id)
      : [...tagIds, id]
    setTagIds(next)
    if (!next.includes(primaryTagId)) setPrimaryTagId('')
  }

  function updateSettings(patch: Partial<BookSettings>) {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  const selectedTags = tags.filter((t) => tagIds.includes(t.id))

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Name">
        <FormInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Book name" autoFocus />
      </FormField>
      <FormField label="Subtitle">
        <FormInput value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Optional subtitle" />
      </FormField>
      <FormField label="Description">
        <FormTextarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
      </FormField>
      <FormField label="Icon">
        <IconSelector value={icon} onChange={setIcon} />
      </FormField>
      <FormField label="Color">
        <ColorPicker value={color} onChange={setColor} />
      </FormField>

      <FormField label="Tags">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-all"
              style={
                tagIds.includes(tag.id)
                  ? { backgroundColor: `${tag.color ?? '#8b5cf6'}25`, color: tag.color ?? '#8b5cf6', borderColor: `${tag.color ?? '#8b5cf6'}50` }
                  : { backgroundColor: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }
              }
            >
              {tag.name}
            </button>
          ))}
          {tags.length === 0 && <p className="text-xs theme-text-faint">No tags in this shelf yet.</p>}
        </div>
      </FormField>

      {selectedTags.length > 0 && (
        <FormField label="Primary Tag">
          <FormSelect value={primaryTagId} onChange={(e) => setPrimaryTagId(e.target.value)}>
            <option value="">None</option>
            {selectedTags.map((tag) => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </FormSelect>
        </FormField>
      )}

      <div className="border-t pt-4 mt-1" style={{ borderColor: 'var(--border-subtle)' }}>
        <p className="text-xs font-medium uppercase tracking-wide mb-3 theme-text-faint">Default Settings</p>
        <div className="flex flex-col gap-3">
          <FormField label="Working Directory">
            <FormInput
              value={settings.defaultWorkingDir ?? ''}
              onChange={(e) => updateSettings({ defaultWorkingDir: e.target.value || undefined })}
              placeholder="e.g. D:/projects/myapp"
            />
          </FormField>
          <FormField label="Default Shell">
            <FormSelect value={settings.defaultShell ?? 'powershell'} onChange={(e) => updateSettings({ defaultShell: e.target.value as ShellType })}>
              {SHELL_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Run Mode">
            <FormSelect value={settings.defaultRunMode ?? 'prepare'} onChange={(e) => updateSettings({ defaultRunMode: e.target.value as 'direct' | 'prepare' })}>
              <option value="prepare">prepare</option>
              <option value="direct">direct</option>
            </FormSelect>
          </FormField>
          <FormCheckbox label="Confirm before run" checked={settings.beforeRunConfirm ?? false} onChange={(v) => updateSettings({ beforeRunConfirm: v })} />
          <FormCheckbox label="Keep terminal open" checked={settings.keepTerminalOpen ?? true} onChange={(v) => updateSettings({ keepTerminalOpen: v })} />
        </div>
      </div>
    </div>
  )
}
