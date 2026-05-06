import React, { useEffect, useState } from 'react'
import { Entry, EntryActionType, EntrySettings } from '../../../../shared/types/entry'
import { ShellType } from '../../../../shared/types/book'
import { FormField, FormInput, FormTextarea, FormSelect, FormCheckbox } from './FormField'
import { ColorPicker } from './ColorPicker'
import { IconSelector } from '../icons/IconSelector'
import { pickPath } from '../../services/dialogService'

type Props = {
  initial?: Partial<Entry>
  onChange: (data: Partial<Entry> | null) => void
}

const ACTION_TYPES: EntryActionType[] = [
  'open-app',
  'open-folder',
  'open-file',
  'open-url',
  'run-command',
  'prepare-powershell'
]

export function EntryForm({ initial = {}, onChange }: Props) {
  const [name, setName] = useState(initial.name ?? '')
  const [description, setDescription] = useState(initial.description ?? '')
  const [icon, setIcon] = useState(initial.icon)
  const [color, setColor] = useState(initial.color ?? '')
  const [actionType, setActionType] = useState<EntryActionType>(initial.actionType ?? 'run-command')
  const [settings, setSettings] = useState<EntrySettings>(initial.settings ?? {})

  useEffect(() => {
    if (name.trim()) {
      onChange({
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color: color.trim() || undefined,
        actionType,
        settings
      })
    } else {
      onChange(null)
    }
  }, [name, description, icon, color, actionType, settings])

  function update(patch: Partial<EntrySettings>) {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  function handleActionTypeChange(t: EntryActionType) {
    setActionType(t)
    setSettings({})
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Name">
        <FormInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Entry name" autoFocus />
      </FormField>
      <FormField label="Description">
        <FormTextarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" rows={2} />
      </FormField>
      <FormField label="Icon">
        <IconSelector value={icon} onChange={setIcon} />
      </FormField>
      <FormField label="Color" hint="Leave empty to use action type default color">
        <ColorPicker value={color || '#8b5cf6'} onChange={setColor} />
      </FormField>
      <FormField label="Action Type">
        <FormSelect value={actionType} onChange={(e) => handleActionTypeChange(e.target.value as EntryActionType)}>
          {ACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </FormSelect>
      </FormField>

      <div className="border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <ActionFields actionType={actionType} settings={settings} update={update} />
      </div>
    </div>
  )
}

function ActionFields({
  actionType,
  settings,
  update
}: {
  actionType: EntryActionType
  settings: EntrySettings
  update: (patch: Partial<EntrySettings>) => void
}) {
  const [pickerError, setPickerError] = useState<string | null>(null)

  async function handlePickFile(key: 'appPath' | 'filePath', title: string) {
    try {
      setPickerError(null)
      const picked = await pickPath({
        mode: 'file',
        title,
        defaultPath: settings[key]
      })
      if (picked) {
        update({ [key]: picked })
      }
    } catch (error) {
      setPickerError(String(error))
    }
  }

  async function handlePickFolder() {
    try {
      setPickerError(null)
      const picked = await pickPath({
        mode: 'folder',
        title: 'Select Folder',
        defaultPath: settings.folderPath ?? settings.workingDir
      })
      if (picked) {
        update({ folderPath: picked })
      }
    } catch (error) {
      setPickerError(String(error))
    }
  }

  const content = (() => {
    switch (actionType) {
      case 'open-app':
        return (
          <>
            <FormField label="App Path">
              <PathPickerField
                value={settings.appPath ?? ''}
                placeholder="e.g. C:/Program Files/app.exe"
                onChange={(value) => update({ appPath: value })}
                onPick={() => handlePickFile('appPath', 'Select Application')}
                buttonLabel="Choose File"
              />
            </FormField>
            <FormField label="Arguments" hint="Space-separated">
              <FormInput value={(settings.args ?? []).join(' ')} onChange={(e) => update({ args: e.target.value.split(' ').filter(Boolean) })} placeholder="e.g. --flag value" />
            </FormField>
          <FormField label="Working Directory">
            <FormInput value={settings.workingDir ?? ''} onChange={(e) => update({ workingDir: e.target.value || undefined })} placeholder="Leave empty to inherit from book" />
          </FormField>
          <FormCheckbox label="Run as administrator" checked={settings.runAsAdmin ?? false} onChange={(v) => update({ runAsAdmin: v })} />
          <FormCheckbox label="Confirm before run" checked={settings.requireConfirm ?? false} onChange={(v) => update({ requireConfirm: v })} />
        </>
      )

      case 'open-folder':
        return (
          <>
            <FormField label="Folder Path">
              <PathPickerField
                value={settings.folderPath ?? ''}
                placeholder="e.g. D:/projects/myapp"
                onChange={(value) => update({ folderPath: value })}
                onPick={handlePickFolder}
                buttonLabel="Choose Folder"
              />
            </FormField>
            <FormCheckbox label="Confirm before open" checked={settings.requireConfirm ?? false} onChange={(v) => update({ requireConfirm: v })} />
          </>
        )

      case 'open-file':
        return (
          <>
            <FormField label="File Path">
              <PathPickerField
                value={settings.filePath ?? ''}
                placeholder="e.g. D:/docs/readme.md"
                onChange={(value) => update({ filePath: value })}
                onPick={() => handlePickFile('filePath', 'Select File')}
                buttonLabel="Choose File"
              />
            </FormField>
            <FormCheckbox label="Confirm before open" checked={settings.requireConfirm ?? false} onChange={(v) => update({ requireConfirm: v })} />
          </>
        )

      case 'open-url':
        return (
          <>
            <FormField label="URL">
              <FormInput value={settings.url ?? ''} onChange={(e) => update({ url: e.target.value })} placeholder="https://..." />
            </FormField>
            <FormCheckbox label="Confirm before open" checked={settings.requireConfirm ?? false} onChange={(v) => update({ requireConfirm: v })} />
          </>
        )

      case 'run-command':
        return (
          <>
            <FormField label="Command">
              <FormInput value={settings.command ?? ''} onChange={(e) => update({ command: e.target.value })} placeholder="e.g. npm" />
            </FormField>
            <FormField label="Arguments">
              <FormInput value={(settings.args ?? []).join(' ')} onChange={(e) => update({ args: e.target.value.split(' ').filter(Boolean) })} placeholder="e.g. run dev" />
            </FormField>
            <FormField label="Working Directory">
              <FormInput value={settings.workingDir ?? ''} onChange={(e) => update({ workingDir: e.target.value || undefined })} placeholder="Inherits from book if empty" />
            </FormField>
            <FormField label="Terminal">
              <FormSelect value={settings.shell ?? ''} onChange={(e) => update({ shell: (e.target.value as ShellType) || undefined })}>
                <option value="">Inherit from book / app default</option>
                <option value="powershell">PowerShell</option>
                <option value="cmd">Command Prompt (cmd)</option>
                <option value="git-bash">Git Bash</option>
              </FormSelect>
            </FormField>
            <FormCheckbox label="Confirm before run" checked={settings.requireConfirm ?? false} onChange={(v) => update({ requireConfirm: v })} />
            <FormCheckbox label="Keep terminal open" checked={settings.keepTerminalOpen ?? true} onChange={(v) => update({ keepTerminalOpen: v })} />
          </>
        )

      case 'prepare-powershell':
        return (
          <>
            <FormField label="Command">
              <FormInput value={settings.command ?? ''} onChange={(e) => update({ command: e.target.value })} placeholder="e.g. uv" />
            </FormField>
            <FormField label="Arguments">
              <FormInput value={(settings.args ?? []).join(' ')} onChange={(e) => update({ args: e.target.value.split(' ').filter(Boolean) })} placeholder="e.g. run python main.py" />
            </FormField>
            <FormField label="Working Directory">
              <FormInput value={settings.workingDir ?? ''} onChange={(e) => update({ workingDir: e.target.value || undefined })} placeholder="Inherits from book if empty" />
            </FormField>
            <FormField label="Terminal">
              <FormSelect value={settings.shell ?? ''} onChange={(e) => update({ shell: (e.target.value as ShellType) || undefined })}>
                <option value="">Inherit from book / app default</option>
                <option value="powershell">PowerShell</option>
                <option value="cmd">Command Prompt (cmd)</option>
                <option value="git-bash">Git Bash</option>
              </FormSelect>
            </FormField>
          </>
        )

      default:
        return null
    }
  })()

  return (
    <>
      {content}
      {pickerError && <p className="text-sm theme-danger-text mt-3">{pickerError}</p>}
    </>
  )
}

function PathPickerField({
  value,
  placeholder,
  onChange,
  onPick,
  buttonLabel
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
  onPick: () => Promise<void>
  buttonLabel: string
}) {
  return (
    <div className="flex items-center gap-2">
      <FormInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <button
        onClick={() => { void onPick() }}
        className="px-3 py-2 rounded-lg text-sm transition-all whitespace-nowrap theme-ghost-button"
      >
        {buttonLabel}
      </button>
    </div>
  )
}
