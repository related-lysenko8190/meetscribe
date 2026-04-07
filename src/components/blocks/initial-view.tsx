import { DropZone } from "@/components/custom/drop-zone"

interface InitialViewProps {
  onFileDrop: (file: File) => void
  onBrowse: () => void
  onRecord: () => void
  isDragging?: boolean
}

export function InitialView({ onFileDrop, onBrowse, onRecord, isDragging }: InitialViewProps) {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <DropZone
        onFileDrop={onFileDrop}
        onBrowse={onBrowse}
        onRecord={onRecord}
        isDragging={isDragging}
      />
    </div>
  )
}
