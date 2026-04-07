import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AVAILABLE_MODELS } from "@/lib/types"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiKey: string
  model: string
  onSaveApiKey: (key: string) => void
  onSaveModel: (model: string) => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  apiKey,
  model,
  onSaveApiKey,
  onSaveModel,
}: SettingsDialogProps) {
  const [localKey, setLocalKey] = React.useState(apiKey)
  const [localModel, setLocalModel] = React.useState(model)

  React.useEffect(() => {
    setLocalKey(apiKey)
    setLocalModel(model)
  }, [apiKey, model, open])

  function handleSave() {
    onSaveApiKey(localKey)
    onSaveModel(localModel)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your Gemini API key and model.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-label font-medium text-on-surface" htmlFor="api-key">
              API Key
            </label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your Gemini API key"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-label font-medium text-on-surface" htmlFor="model-select">
              Model
            </label>
            <select
              id="model-select"
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
              className="flex h-9 w-full border border-graphite bg-transparent px-3 py-1 text-sm font-body text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
