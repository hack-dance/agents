"use client"

import { useEffect, useRef, useState } from "react"

export function useAudioInput({ onInput }) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "recording">("idle")
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedMic, setSelectedMic] = useState<string | null>("default")
  const [isLoading, setIsLoading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const bootstrapAudio = async () => {
    let tracks = []
    try {
      const constraints = {
        audio: {
          ...(selectedMic ? { deviceId: { exact: selectedMic } } : {}),
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true
        },
        video: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      tracks = stream.getAudioTracks()
      console.log(tracks)
    } catch (e) {
      console.error("Failed to request default devices from browser.")
    }
  }

  const startRecording = async () => {
    try {
      const constraints = {
        audio: {
          ...(selectedMic ? { deviceId: { exact: selectedMic } } : {}),
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true
        },
        video: false
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.ondataavailable = event => {
        chunksRef.current.push(event.data)
        if (mediaRecorderRef.current.state == "inactive") {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" })
          setFile(new File([blob], "audio.webm", { type: "audio/webm" }))
          setStatus("idle")
        }
      }

      mediaRecorderRef.current.onstop = stopRecording // Call stopRecording on stop
      mediaRecorderRef.current.start()
      setStatus("recording")
    } catch (e) {
      console.error("An error occurred while accessing the microphone:", e)
    }
  }

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
  }

  const submit = async () => {
    if (!file) return
    setIsLoading(true)
    try {
      const data = new FormData()
      data.set("file", file)

      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        body: data
      })

      const transcription = await res.json()

      onInput(transcription?.text)

      if (!res.ok) throw new Error(await res.text())
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      setMicDevices(devices.filter(device => device.kind === "audioinput"))
      bootstrapAudio()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (file) {
      submit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  return {
    startRecording,
    stopRecording,
    status,
    micDevices,
    selectedMic,
    setSelectedMic,
    isLoading
  }
}
