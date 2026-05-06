import React, { useContext, useState } from 'react'
import { StoreContext } from '../../context/StoreContext'
import { WorkspaceContext } from '../../context/WorkspaceContext'
import { WorkspacePanel } from '../workspace/WorkspacePanel'
import { ThemePanel } from '../theme/ThemePanel'
import { IconManagerPanel } from '../icons/IconManagerPanel'
import { IconAsset } from '../../../../shared/types/icon'
import { FormField, FormSelect } from './FormField'
import { ShellType } from '../../../../shared/types/book'

type Props = {
  nextIconCode: string
  onExport: () => void
  onImport: () => void
  onImportIcon: (icon: IconAsset) => Promise<void>
  onDeleteIcon: (icon: IconAsset) => Promise<void>
}

type SectionId = 'defaults' | 'data' | 'profiles' | 'appearance' | 'icons'

export function HomeSettingsPanel({
  nextIconCode,
  onExport,
  onImport,
  onImportIcon,
  onDeleteIcon
}: Props) {
  const { store } = useContext(StoreContext)
  const { activeWorkspace, recentWorkspaces, createWorkspace, activateWorkspace } =
    useContext(WorkspaceContext)

  const [openSection, setOpenSection] = useState<SectionId | null>('defaults')

  function toggle(id: SectionId) {
    setOpenSection((prev) => (prev === id ? null : id))
  }

  async function handleShellChange(shell: ShellType) {
    await updateStore((prev) => ({
      ...prev,
      appSettings: { ...prev.appSettings, defaultShell: shell }
    }))
  }

  return (
    <div className="flex flex-col gap-1">
      <SettingsSection
        id="defaults"
        label="Defaults"
        icon={<DefaultsIcon />}
        open={openSection === 'defaults'}
        onToggle={toggle}
      >
        <div className="flex flex-col gap-3 pt-1 pb-3">
          <FormField label="Default Terminal" hint="Used when an entry or book does not specify a terminal">
            <FormSelect
              value={store.appSettings.defaultShell}
              onChange={(e) => void handleShellChange(e.target.value as ShellType)}
            >
              <option value="powershell">PowerShell</option>
              <option value="cmd">Command Prompt (cmd)</option>
              <option value="git-bash">Git Bash</option>
            </FormSelect>
          </FormField>
        </div>
      </SettingsSection>

      <Divider />

      <SettingsSection
        id="data"
        label="Data"
        icon={<DataIcon />}
        open={openSection === 'data'}
        onToggle={toggle}
      >
        <div className="flex flex-col gap-3 pt-1 pb-3">
          <p className="text-xs theme-text-muted">
            Export all shelves, tags, books, and entries to a JSON file. Import merges data without overwriting existing items.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onExport}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all theme-ghost-button"
            >
              Export
            </button>
            <button
              onClick={onImport}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all theme-ghost-button"
            >
              Import
            </button>
          </div>
        </div>
      </SettingsSection>

      <Divider />

      <SettingsSection
        id="profiles"
        label="Profiles"
        icon={<ProfilesIcon />}
        open={openSection === 'profiles'}
        onToggle={toggle}
      >
        <div className="pt-1 pb-3">
          <WorkspacePanel
            activeWorkspaceId={activeWorkspace?.id}
            recentWorkspaces={recentWorkspaces}
            onCreateWorkspace={createWorkspace}
            onActivateWorkspace={activateWorkspace}
          />
        </div>
      </SettingsSection>

      <Divider />

      <SettingsSection
        id="appearance"
        label="Appearance"
        icon={<ThemeIcon />}
        open={openSection === 'appearance'}
        onToggle={toggle}
      >
        <div className="pt-1 pb-3">
          <ThemePanel />
        </div>
      </SettingsSection>

      <Divider />

      <SettingsSection
        id="icons"
        label={`Icons (${store.icons.length})`}
        icon={<IconsIcon />}
        open={openSection === 'icons'}
        onToggle={toggle}
      >
        <div className="pt-1 pb-3">
          <IconManagerPanel
            icons={store.icons}
            nextCode={nextIconCode}
            onImport={onImportIcon}
            onDelete={onDeleteIcon}
          />
        </div>
      </SettingsSection>
    </div>
  )
}

function SettingsSection({
  id,
  label,
  icon,
  open,
  onToggle,
  children
}: {
  id: SectionId
  label: string
  icon: React.ReactNode
  open: boolean
  onToggle: (id: SectionId) => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-1 py-2.5 rounded-lg transition-colors theme-ghost-button border-transparent hover:border-transparent"
      >
        <div className="flex items-center gap-2.5 theme-text-secondary">
          <span className="theme-text-muted">{icon}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <ChevronIcon open={open} />
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

function Divider() {
  return <div className="h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="theme-text-faint transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path
        d="M3 5L7 9L11 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DefaultsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.5 1.5v2M7.5 11.5v2M1.5 7.5h2M11.5 7.5h2M3.4 3.4l1.4 1.4M10.2 10.2l1.4 1.4M10.2 3.4l-1.4 1.4M4.8 10.2l-1.4 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function DataIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 1v9M4 7l3.5 3.5L11 7M2 13h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProfilesIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 13c0-2.76 2.46-5 5.5-5s5.5 2.24 5.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ThemeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="1.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1.5" y="8.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="8.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
