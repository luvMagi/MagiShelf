import React, { useEffect, useState } from 'react'
import { Shelf } from '../../../../shared/types/shelf'
import { FormField, FormInput, FormTextarea } from './FormField'
import { ColorPicker } from './ColorPicker'
import { IconSelector } from '../icons/IconSelector'

type Props = {
  initial?: Partial<Shelf>
  onChange: (data: Partial<Shelf> | null) => void
}

export function ShelfForm({ initial = {}, onChange }: Props) {
  const [name, setName] = useState(initial.name ?? '')
  const [description, setDescription] = useState(initial.description ?? '')
  const [icon, setIcon] = useState(initial.icon)
  const [color, setColor] = useState(initial.color ?? '#8b5cf6')

  useEffect(() => {
    if (name.trim()) {
      onChange({
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color
      })
    } else {
      onChange(null)
    }
  }, [name, description, icon, color])

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Name">
        <FormInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Shelf name"
          autoFocus
        />
      </FormField>
      <FormField label="Description">
        <FormTextarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </FormField>
      <FormField label="Icon">
        <IconSelector value={icon} onChange={setIcon} />
      </FormField>
      <FormField label="Color">
        <ColorPicker value={color} onChange={setColor} />
      </FormField>
    </div>
  )
}
