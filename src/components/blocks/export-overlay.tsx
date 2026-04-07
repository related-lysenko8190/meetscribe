import { ExportModal } from "@/components/compound/export-modal"
import { EXPORT_OPTIONS } from "@/lib/types"
import type { ExportFormat } from "@/lib/types"

interface ExportOverlayProps {
  isOpen: boolean
  onClose: () => void
  selectedFormats: Set<ExportFormat>
  onToggleFormat: (format: ExportFormat) => void
  onDownload: () => void
}

export function ExportOverlay({
  isOpen,
  onClose,
  selectedFormats,
  onToggleFormat,
  onDownload,
}: ExportOverlayProps) {
  return (
    <ExportModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      options={EXPORT_OPTIONS}
      selectedFormats={selectedFormats}
      onToggle={onToggleFormat}
      onDownload={onDownload}
    />
  )
}
