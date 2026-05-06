import React, { useEffect, useState } from 'react'
import { Tag } from '../../../../shared/types/tag'
import { FormField, FormInput, FormTextarea, FormCheckbox } from './FormField'
import { ColorPicker } from './ColorPicker'

type Props = {
  initial?: Partial<Tag>
  onChange: (data: Partial<Tag> | null) => void
}

export function TagForm({ initial = {}, onChange }: Props) {
  const [name, setName] = useState(initial.name ?? '')
  const [description, setDescription] = useState(initial.description ?? '')
  const [color, setColor] = useState(initial.color ?? '#8b5cf6')
  const [icon, setIcon] = useState(initial.icon ?? '')
  const [visible, setVisible] = useState(initial.visible ?? true)

  useEffect(() => {
    if (name.trim()) {
      onChange({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        icon: icon.trim() || undefined,
        visible
      })
    } else {
      onChange(null)
    }
  }, [name, description, color, icon, visible])

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Name">
        <FormInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tag name"
          autoFocus
        />
      </FormField>
      <FormField label="Description">
        <FormTextarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
          rows={2}
        />
      </FormField>
      <FormField label="Color">
        <ColorPicker value={color} onChange={setColor} />
      </FormField>
      <FormField label="Icon">
        <FormInput
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="e.g. palette"
        />
      </FormField>
      <FormCheckbox label="Visible in tag bar" checked={visible} onChange={setVisible} />
    </div>
  )
}
