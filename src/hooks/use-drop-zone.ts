import { useState, useRef, useCallback, type DragEvent } from 'react'

const ACCEPTED_EXTENSIONS = ['.webm', '.mp4', '.mkv']

interface UseDropZoneOptions {
  onFileDrop: (file: File) => void
}

interface DragProps {
  onDragEnter: (e: DragEvent) => void
  onDragLeave: (e: DragEvent) => void
  onDragOver: (e: DragEvent) => void
  onDrop: (e: DragEvent) => void
}

interface UseDropZoneReturn {
  isDragging: boolean
  dragProps: DragProps
}

export function useDropZone({ onFileDrop }: UseDropZoneOptions): UseDropZoneReturn {
  const [isDragging, setIsDragging] = useState(false)
  const counterRef = useRef(0)

  const onDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    counterRef.current++
    if (counterRef.current === 1) {
      setIsDragging(true)
    }
  }, [])

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    counterRef.current--
    if (counterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      counterRef.current = 0
      setIsDragging(false)

      const files = e.dataTransfer?.files
      if (!files || files.length === 0) return

      const file = files[0]
      const name = file.name.toLowerCase()
      const isAccepted = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))

      if (isAccepted) {
        onFileDrop(file)
      }
    },
    [onFileDrop]
  )

  const dragProps: DragProps = {
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
  }

  return { isDragging, dragProps }
}
