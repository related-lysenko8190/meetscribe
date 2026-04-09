function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

function encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  // RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(view, 8, 'WAVE')

  // fmt sub-chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample

  // data sub-chunk
  writeString(view, 36, 'data')
  view.setUint32(40, samples.length * 2, true)

  // Write PCM samples
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }

  return buffer
}

function resampleTo16kMono(audioBuffer: AudioBuffer): Float32Array {
  const targetRate = 16000

  // Mix down to mono
  const numChannels = audioBuffer.numberOfChannels
  const sourceLength = audioBuffer.length
  const mono = new Float32Array(sourceLength)

  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = audioBuffer.getChannelData(ch)
    for (let i = 0; i < sourceLength; i++) {
      mono[i] += channelData[i] / numChannels
    }
  }

  const sourceSampleRate = audioBuffer.sampleRate
  if (sourceSampleRate === targetRate) {
    return mono
  }

  // Linear interpolation resampling
  const ratio = sourceSampleRate / targetRate
  const targetLength = Math.ceil(sourceLength / ratio)
  const resampled = new Float32Array(targetLength)

  for (let i = 0; i < targetLength; i++) {
    const srcIndex = i * ratio
    const srcFloor = Math.floor(srcIndex)
    const srcCeil = Math.min(srcFloor + 1, sourceLength - 1)
    const fraction = srcIndex - srcFloor
    resampled[i] = mono[srcFloor] * (1 - fraction) + mono[srcCeil] * fraction
  }

  return resampled
}

const LARGE_VIDEO_WARNING_BYTES = 500 * 1024 * 1024

export async function extractAudio(videoBlob: Blob): Promise<Blob> {
  if (videoBlob.size >= LARGE_VIDEO_WARNING_BYTES) {
    console.warn(
      `Large video detected (${Math.round(videoBlob.size / (1024 * 1024))} MB). Audio extraction may take longer or fail due to browser memory limits.`
    )
  }

  const arrayBuffer = await videoBlob.arrayBuffer()

  const audioCtx = new AudioContext()
  let audioBuffer: AudioBuffer

  try {
    try {
      audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err)
      throw new Error(`Failed to decode audio track from video: ${reason}`)
    }
  } finally {
    void audioCtx.close()
  }

  const samples = resampleTo16kMono(audioBuffer)
  const wavBuffer = encodeWAV(samples, 16000)

  return new Blob([wavBuffer], { type: 'audio/wav' })
}
