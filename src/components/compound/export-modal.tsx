import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { ExportOption, ExportFormat } from "@/lib/types"

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  options: ExportOption[]
  selectedFormats: Set<ExportFormat>
  onToggle: (format: ExportFormat) => void
  onDownload: () => void
}

export function ExportModal({
  open,
  onOpenChange,
  options,
  selectedFormats,
  onToggle,
  onDownload,
}: ExportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export</DialogTitle>
          <DialogDescription>
            Select the formats you want to download.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {options.map((option) => (
            <label
              key={option.format}
              className="flex items-start gap-3 cursor-pointer"
            >
              <Checkbox
                checked={selectedFormats.has(option.format)}
                onCheckedChange={() => onToggle(option.format)}
                className="mt-0.5"
              />
              <div className="flex flex-col">
                <span className="text-sm font-label font-medium text-on-surface">
                  {option.label}
                </span>
                <span className="text-xs text-graphite">
                  {option.description}
                </span>
              </div>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onDownload}
            disabled={selectedFormats.size === 0}
          >
            Download selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
