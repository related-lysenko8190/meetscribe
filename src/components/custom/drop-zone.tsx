import * as React from "react"
import { Play, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { StampButton } from "./stamp-button"

interface DropZoneProps {
  onFileDrop: (file: File) => void
  onBrowse: () => void
  onRecord: () => void
  isDragging?: boolean
}

export function DropZone({ onFileDrop, onBrowse, onRecord, isDragging = false }: DropZoneProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("video/")) {
      onFileDrop(file)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      onFileDrop(file)
    }
  }

  function handleBrowseClick() {
    fileInputRef.current?.click()
    onBrowse()
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-6 h-full min-h-[400px]",
        "border-2 border-dashed border-graphite p-8",
        isDragging && "border-primary-container bg-surface-container-low/30"
      )}
    >
      <div className="flex items-center justify-center size-16 text-graphite">
        <Play className="size-12" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-base font-body text-on-surface">
          Drop video here or
        </p>
      </div>
      <div className="flex items-center gap-3">
        <StampButton variant="primary" onClick={handleBrowseClick}>
          Browse files
        </StampButton>
        <StampButton variant="secondary" onClick={onRecord} icon={<Monitor />}>
          Record screen
        </StampButton>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
