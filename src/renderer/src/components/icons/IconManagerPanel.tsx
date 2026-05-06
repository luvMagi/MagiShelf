import React, { useMemo, useRef, useState } from 'react'
import { IconAsset } from '../../../../shared/types/icon'
import { saveIcon } from '../../services/iconService'

type Props = {
  icons: IconAsset[]
  nextCode: string
  onImport: (icon: IconAsset) => Promise<void>
  onDelete: (icon: IconAsset) => Promise<void>
}

type DraftImage = {
  dataUrl: string
}

type CropState = {
  zoom: number
  offsetX: number
  offsetY: number
}

const PREVIEW_SIZE = 220
const OUTPUT_SIZE = 256

export function IconManagerPanel({ icons, nextCode, onImport, onDelete }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [draft, setDraft] = useState<DraftImage | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const dataUrl = await readFileAsDataUrl(file)
    setDraft({ dataUrl })
  }

  async function handleCropConfirm(payload: { code: string; dataUrl: string; name: string }) {
    setSaving(true)
    try {
      const saved = await saveIcon(payload)
      await onImport(saved)
      setDraft(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium theme-text-primary">Imported Icons</p>
          <p className="text-xs theme-text-muted mt-1">
            Imported files are cropped and copied into the app workspace.
          </p>
          <p className="text-xs theme-text-faint mt-1">Next code: {nextCode}</p>
        </div>
        {!draft && (
          <button
            onClick={() => inputRef.current?.click()}
            className="px-3 py-2 rounded-xl text-sm font-medium transition-all theme-accent-button"
          >
            Import Icon
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {draft ? (
        <IconCropper
          draft={draft}
          nextCode={nextCode}
          saving={saving}
          onCancel={() => setDraft(null)}
          onConfirm={handleCropConfirm}
        />
      ) : icons.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-4 py-8 text-center theme-card">
          <p className="text-base font-medium theme-text-secondary">No icons imported yet</p>
          <p className="text-sm theme-text-faint mt-1">Import a square or rectangular image to build your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {icons.map((icon) => (
            <div
              key={icon.id}
              className="rounded-2xl border p-3 theme-card"
            >
              <div className="flex items-center gap-3">
                <img
                  src={icon.previewDataUrl}
                  alt={icon.name}
                  className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 theme-card"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium theme-text-secondary truncate">{icon.code}</p>
                  <p className="text-xs theme-text-faint truncate">{icon.fileName}</p>
                </div>
              </div>
              <button
                onClick={() => onDelete(icon)}
                className="mt-3 w-full py-2 rounded-xl text-sm transition-all theme-danger-button"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function IconCropper({
  draft,
  nextCode,
  saving,
  onCancel,
  onConfirm
}: {
  draft: DraftImage
  nextCode: string
  saving: boolean
  onCancel: () => void
  onConfirm: (payload: { code: string; dataUrl: string; name: string }) => Promise<void>
}) {
  const [zoom, setZoom] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const crop = useMemo<CropState>(() => ({ zoom, offsetX, offsetY }), [zoom, offsetX, offsetY])

  async function handleConfirm() {
    if (!dimensions) return

    try {
      setError(null)
      const dataUrl = await renderCroppedIcon(draft.dataUrl, dimensions, crop)
      await onConfirm({ code: nextCode, dataUrl, name: nextCode })
    } catch (err) {
      setError(String(err))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border p-4 theme-card">
        <div className="flex gap-6 max-md:flex-col">
          <div className="flex flex-col gap-3">
            <div
              className="relative overflow-hidden rounded-[28px] border theme-panel-alt"
              style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
            >
              <PreviewImage
                dataUrl={draft.dataUrl}
                crop={crop}
                onLoad={setDimensions}
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-[28px] ring-1"
                style={{ boxShadow: 'inset 0 0 0 1px var(--border-strong)' }}
              />
            </div>
            <p className="text-xs theme-text-muted">
              Adjust zoom and position to crop the final square icon.
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide theme-text-muted">Icon Code</label>
              <div className="w-full px-3 py-2 rounded-lg text-sm font-mono theme-input">
                {nextCode}
              </div>
            </div>

            <RangeField
              label="Zoom"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={setZoom}
            />
            <RangeField
              label="Horizontal"
              min={-1}
              max={1}
              step={0.01}
              value={offsetX}
              onChange={setOffsetX}
            />
            <RangeField
              label="Vertical"
              min={-1}
              max={1}
              step={0.01}
              value={offsetY}
              onChange={setOffsetY}
            />

            {error && <p className="text-sm theme-danger-text">{error}</p>}

            <div className="flex gap-2 pt-2">
              <button
                onClick={onCancel}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all theme-ghost-button"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving || !dimensions}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  saving || !dimensions
                    ? 'theme-accent-button cursor-not-allowed'
                    : 'theme-accent-button'
                }`}
              >
                {saving ? 'Importing...' : 'Crop & Import'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewImage({
  dataUrl,
  crop,
  onLoad
}: {
  dataUrl: string
  crop: CropState
  onLoad: (dimensions: { width: number; height: number }) => void
}) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  function handleLoad(event: React.SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget
    const next = {
      width: image.naturalWidth,
      height: image.naturalHeight
    }
    setDimensions(next)
    onLoad(next)
  }

  const style = dimensions ? getPreviewImageStyle(dimensions, crop) : undefined

  return (
    <img
      src={dataUrl}
      alt="Icon crop preview"
      onLoad={handleLoad}
      className="absolute left-1/2 top-1/2 max-w-none select-none"
      style={style}
      draggable={false}
    />
  )
}

function RangeField({
  label,
  min,
  max,
  step,
  value,
  onChange
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wide theme-text-muted">{label}</label>
        <span className="text-xs font-mono theme-text-faint">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-violet-500"
      />
    </div>
  )
}

function getPreviewImageStyle(
  dimensions: { width: number; height: number },
  crop: CropState
): React.CSSProperties {
  const baseScale = Math.max(PREVIEW_SIZE / dimensions.width, PREVIEW_SIZE / dimensions.height)
  const scale = baseScale * crop.zoom
  const width = dimensions.width * scale
  const height = dimensions.height * scale
  const maxOffsetX = Math.max(0, (width - PREVIEW_SIZE) / 2)
  const maxOffsetY = Math.max(0, (height - PREVIEW_SIZE) / 2)
  const translateX = -width / 2 + crop.offsetX * maxOffsetX
  const translateY = -height / 2 + crop.offsetY * maxOffsetY

  return {
    width,
    height,
    transform: `translate(${translateX}px, ${translateY}px)`
  }
}

async function renderCroppedIcon(
  sourceDataUrl: string,
  dimensions: { width: number; height: number },
  crop: CropState
): Promise<string> {
  const image = await loadImage(sourceDataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas is unavailable')
  }

  const baseScale = Math.max(PREVIEW_SIZE / dimensions.width, PREVIEW_SIZE / dimensions.height)
  const scale = baseScale * crop.zoom
  const displayedWidth = dimensions.width * scale
  const displayedHeight = dimensions.height * scale
  const maxOffsetX = Math.max(0, (displayedWidth - PREVIEW_SIZE) / 2)
  const maxOffsetY = Math.max(0, (displayedHeight - PREVIEW_SIZE) / 2)
  const imageLeft = (PREVIEW_SIZE - displayedWidth) / 2 + crop.offsetX * maxOffsetX
  const imageTop = (PREVIEW_SIZE - displayedHeight) / 2 + crop.offsetY * maxOffsetY

  const sourceX = -imageLeft / scale
  const sourceY = -imageTop / scale
  const sourceSize = PREVIEW_SIZE / scale

  context.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

  return canvas.toDataURL('image/png')
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image'))
    image.src = src
  })
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
