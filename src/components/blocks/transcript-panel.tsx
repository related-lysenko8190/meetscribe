import { TranscriptSegment } from "@/components/custom/transcript-segment"
import { SearchInput } from "@/components/compound/search-input"
import type { TranscriptSegment as TranscriptSegmentType } from "@/lib/types"

interface TranscriptPanelProps {
  segments: TranscriptSegmentType[]
  activeSegmentId?: string
  onSegmentClick?: (segmentId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function TranscriptPanel({
  segments,
  activeSegmentId,
  onSegmentClick,
  searchQuery,
  onSearchChange,
}: TranscriptPanelProps) {
  const filteredSegments = searchQuery
    ? segments.filter(
        (s) =>
          s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.speaker.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : segments

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-ruler">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search transcript..."
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredSegments.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-graphite">
              {searchQuery ? "No matching segments" : "No transcript segments"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredSegments.map((segment) => (
              <TranscriptSegment
                key={segment.id}
                segment={segment}
                isActive={segment.id === activeSegmentId}
                onClick={() => onSegmentClick?.(segment.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
