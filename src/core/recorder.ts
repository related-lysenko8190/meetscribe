export interface RecorderHandle {
  stop: () => Promise<Blob>
  stream: MediaStream
}

export async function startRecording(): Promise<RecorderHandle> {
  let displayStream: MediaStream

  try {
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    })
  } catch (err) {
    throw new Error(
      `Screen share was denied or unavailable: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  let micStream: MediaStream
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch (err) {
    // If mic access fails, stop the display stream and throw
    displayStream.getTracks().forEach((t) => t.stop())
    throw new Error(
      `Microphone access was denied or unavailable: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  // Mix audio via AudioContext
  const audioCtx = new AudioContext()
  const destination = audioCtx.createMediaStreamDestination()

  const displayAudioTracks = displayStream.getAudioTracks()
  if (displayAudioTracks.length > 0) {
    const displaySource = audioCtx.createMediaStreamSource(
      new MediaStream(displayAudioTracks)
    )
    displaySource.connect(destination)
  }

  const micSource = audioCtx.createMediaStreamSource(micStream)
  micSource.connect(destination)

  // Combine display video track + mixed audio into new MediaStream
  const videoTrack = displayStream.getVideoTracks()[0]
  const combinedStream = new MediaStream([
    videoTrack,
    ...destination.stream.getAudioTracks(),
  ])

  // Choose mimeType
  const preferredMime = 'video/webm;codecs=vp9,opus'
  const fallbackMime = 'video/webm'
  const mimeType = MediaRecorder.isTypeSupported(preferredMime)
    ? preferredMime
    : fallbackMime

  const recorder = new MediaRecorder(combinedStream, { mimeType })
  const chunks: Blob[] = []

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data)
    }
  }

  recorder.start(1000) // collect data every second

  const stop = (): Promise<Blob> => {
    return new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => {
        // Clean up all tracks and audio context
        displayStream.getTracks().forEach((t) => t.stop())
        micStream.getTracks().forEach((t) => t.stop())
        combinedStream.getTracks().forEach((t) => t.stop())
        void audioCtx.close()

        if (chunks.length === 0) {
          reject(new Error('No recording data was captured'))
          return
        }

        const blob = new Blob(chunks, { type: mimeType })
        resolve(blob)
      }

      recorder.onerror = () => {
        reject(new Error('Recording error occurred'))
      }

      if (recorder.state !== 'inactive') {
        recorder.stop()
      } else {
        // Already stopped (e.g., user ended screen share)
        const blob = new Blob(chunks, { type: mimeType })
        resolve(blob)
      }
    })
  }

  // Handle the case where user stops screen sharing via browser UI
  videoTrack.onended = () => {
    if (recorder.state !== 'inactive') {
      recorder.stop()
    }
  }

  return {
    stop,
    stream: combinedStream,
  }
}
