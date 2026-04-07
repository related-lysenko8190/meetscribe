export interface AudioChunk {
  index: number
  blob: Blob
  startTime: number
  duration: number
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

function createWavHeader(
  dataSize: number,
  sampleRate: number,
  numChannels: number,
  bitsPerSample: number
): ArrayBuffer {
  const header = new ArrayBuffer(44)
  const view = new DataView(header)
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  return header
}

interface WavInfo {
  sampleRate: number
  numChannels: number
  bitsPerSample: number
  dataOffset: number
  dataSize: number
}

function parseWavHeader(headerBytes: ArrayBuffer): WavInfo {
  const view = new DataView(headerBytes)

  // Validate RIFF header
  const riff = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  )
  if (riff !== 'RIFF') {
    throw new Error('Invalid WAV file: missing RIFF header')
  }

  const numChannels = view.getUint16(22, true)
  const sampleRate = view.getUint32(24, true)
  const bitsPerSample = view.getUint16(34, true)

  // Find data chunk - it's typically at offset 36 but could vary
  let dataOffset = 36
  while (dataOffset < headerBytes.byteLength - 8) {
    const chunkId = String.fromCharCode(
      view.getUint8(dataOffset),
      view.getUint8(dataOffset + 1),
      view.getUint8(dataOffset + 2),
      view.getUint8(dataOffset + 3)
    )
    const chunkSize = view.getUint32(dataOffset + 4, true)

    if (chunkId === 'data') {
      return {
        sampleRate,
        numChannels,
        bitsPerSample,
        dataOffset: dataOffset + 8,
        dataSize: chunkSize,
      }
    }

    dataOffset += 8 + chunkSize
  }

  // Fallback: assume standard 44-byte header
  return {
    sampleRate,
    numChannels,
    bitsPerSample,
    dataOffset: 44,
    dataSize: view.getUint32(40, true),
  }
}

export async function chunkAudio(
  wavBlob: Blob,
  maxDurationSec = 1200
): Promise<AudioChunk[]> {
  const OVERLAP_SEC = 30

  // Read enough of the header to parse WAV info
  const headerSlice = wavBlob.slice(0, Math.min(256, wavBlob.size))
  const headerBuffer = await headerSlice.arrayBuffer()
  const wavInfo = parseWavHeader(headerBuffer)

  const { sampleRate, numChannels, bitsPerSample, dataOffset, dataSize } = wavInfo
  const bytesPerSample = bitsPerSample / 8
  const bytesPerSecond = sampleRate * numChannels * bytesPerSample
  const totalDuration = dataSize / bytesPerSecond

  // If the entire audio fits in one chunk, return it as-is
  if (totalDuration <= maxDurationSec) {
    return [
      {
        index: 0,
        blob: wavBlob,
        startTime: 0,
        duration: totalDuration,
      },
    ]
  }

  const chunks: AudioChunk[] = []
  let chunkIndex = 0
  let currentStartTime = 0

  while (currentStartTime < totalDuration) {
    const chunkDuration = Math.min(maxDurationSec, totalDuration - currentStartTime)
    const chunkDataBytes = Math.floor(chunkDuration * bytesPerSecond)

    const startByte = dataOffset + Math.floor(currentStartTime * bytesPerSecond)
    const endByte = Math.min(startByte + chunkDataBytes, dataOffset + dataSize)
    const actualDataSize = endByte - startByte

    // Extract PCM data
    const pcmSlice = wavBlob.slice(startByte, endByte)
    const pcmData = await pcmSlice.arrayBuffer()

    // Create WAV header for this chunk
    const chunkHeader = createWavHeader(actualDataSize, sampleRate, numChannels, bitsPerSample)

    const chunkBlob = new Blob([chunkHeader, pcmData], { type: 'audio/wav' })

    chunks.push({
      index: chunkIndex,
      blob: chunkBlob,
      startTime: currentStartTime,
      duration: actualDataSize / bytesPerSecond,
    })

    chunkIndex++

    // Advance by (maxDuration - overlap) to create overlap between chunks
    const advance = maxDurationSec - OVERLAP_SEC
    currentStartTime += advance

    // If the remaining audio is less than the overlap, stop
    if (totalDuration - currentStartTime < OVERLAP_SEC) {
      break
    }
  }

  return chunks
}
