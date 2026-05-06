import React from 'react'

type FieldProps = {
  label: string
  hint?: string
  children: React.ReactNode
}

export function FormField({ label, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wide theme-text-muted">{label}</label>
      {children}
      {hint && <p className="text-xs theme-text-faint">{hint}</p>}
    </div>
  )
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function FormInput(props: InputProps) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-lg text-sm transition-all theme-input ${props.className ?? ''}`}
    />
  )
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function FormTextarea(props: TextAreaProps) {
  return (
    <textarea
      {...props}
      rows={props.rows ?? 3}
      className={`w-full px-3 py-2 rounded-lg text-sm transition-all resize-none theme-input ${props.className ?? ''}`}
    />
  )
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export function FormSelect({ children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 rounded-lg text-sm transition-all cursor-pointer theme-input theme-select ${props.className ?? ''}`}
    >
      {children}
    </select>
  )
}

type CheckboxProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function FormCheckbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
          checked
            ? 'theme-accent-button border-transparent'
            : 'theme-input group-hover:border-[color:var(--border-strong)]'
        }`}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm transition-colors theme-text-muted group-hover:text-[color:var(--text-secondary)]">
        {label}
      </span>
    </label>
  )
}

export function FormActions({
  onCancel,
  onSave,
  saveLabel = 'Save'
}: {
  onCancel: () => void
  onSave: () => void
  saveLabel?: string
}) {
  return (
    <div className="flex gap-2 pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
      <button
        onClick={onCancel}
        className="flex-1 py-2 rounded-xl text-sm font-medium transition-all theme-ghost-button"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="flex-1 py-2 rounded-xl text-sm font-medium transition-all theme-accent-button"
      >
        {saveLabel}
      </button>
    </div>
  )
}
