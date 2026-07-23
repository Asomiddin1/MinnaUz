"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useSession } from "next-auth/react"
import { Canvas, useFrame } from "@react-three/fiber"
import { userAPI } from "@/lib/api/user"

function ParticleSphere({
  isListening,
  isSpeaking,
}: {
  isListening: boolean
  isSpeaking: boolean
}) {
  const ref = useRef<any>(null)
  const particlesCount = 2500

  const [positions, originalPositions] = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3)
    for (let i = 0; i < particlesCount; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = 2.0
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return [pos, new Float32Array(pos)]
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const time = state.clock.getElapsedTime()
    const { position } = ref.current.geometry.attributes
    ref.current.rotation.y = time * 0.1
    ref.current.rotation.z = time * 0.05

    for (let i = 0; i < particlesCount; i++) {
      const idx = i * 3
      const ox = originalPositions[idx]
      const oy = originalPositions[idx + 1]
      const oz = originalPositions[idx + 2]
      let scatter = 0

      if (isSpeaking) {
        scatter =
          Math.sin(time * 8 + oy * 3) * Math.cos(time * 5 + ox * 2) * 0.6
      } else if (isListening) {
        scatter = Math.sin(time * 3 - oy * 2) * 0.2 + 0.1
      } else {
        scatter = Math.sin(time * 1.5 + ox * 2 + oy) * 0.05
      }

      const len = Math.sqrt(ox * ox + oy * oy + oz * oz)
      position.array[idx] +=
        (ox + (ox / len) * scatter - position.array[idx]) * 0.1
      position.array[idx + 1] +=
        (oy + (oy / len) * scatter - position.array[idx + 1]) * 0.1
      position.array[idx + 2] +=
        (oz + (oz / len) * scatter - position.array[idx + 2]) * 0.1
    }
    position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#4f46e5"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}

export default function AiComponent() {
  const [statusText, setStatusText] = useState("Tayyor")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [topic, setTopic] = useState("Erkin")
  const [level, setLevel] = useState("N5")
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])

  const recognitionRef = useRef<any>(null)
  const correctionAudioRef = useRef<HTMLAudioElement | null>(null)
  const japaneseAudioRef = useRef<HTMLAudioElement | null>(null)

  const { data: session } = useSession()

  useEffect(() => {
    return () => handleStopAll()
  }, [])

  const handleStopAll = () => {
    if (recognitionRef.current) recognitionRef.current.stop()
    if (japaneseAudioRef.current) {
      japaneseAudioRef.current.pause()
      japaneseAudioRef.current = null
    }
    if (correctionAudioRef.current) {
      correctionAudioRef.current.pause()
      correctionAudioRef.current = null
    }
    window.speechSynthesis.cancel()
    setIsListening(false)
    setIsSpeaking(false)
    setIsProcessing(false)
    setStatusText("To'xtatildi")
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "x") handleStopAll()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsListening(true)
        setIsSpeaking(false)
        setStatusText("Eshitmoqdaman...")
      }

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript
        setIsListening(false)

        if (session && (session as any)?.accessToken && !isProcessing) {
          setStatusText("Javob tayyorlanmoqda...")
          sendToAi(text)
        }
      }

      recognition.onerror = () => {
        setIsListening(false)
        setStatusText("Tayyor")
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [session, isProcessing, topic, level, chatHistory])

  const handleStartListening = () => {
    if (isProcessing || isSpeaking) return
    handleStopAll()

    const unlockMsg = new SpeechSynthesisUtterance("")
    window.speechSynthesis.speak(unlockMsg)

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = "ja-JP"
        recognitionRef.current.start()
      } catch (e) {
        console.log("Recognition is currently running")
      }
    }
  }

  const handleClearMemory = () => {
    setChatHistory([])
    setStatusText("Xotira tozalandi. Tayyor")
    handleStopAll()
  }

  const sendToAi = async (text: string) => {
    setIsProcessing(true)
    const newHistory = [...chatHistory, { role: "user", content: text }]
    setChatHistory(newHistory)

    try {
      const res = await userAPI.sendAiChatMessage({
        message: text,
        lang: "ja-JP",
        topic: topic,
        level: level,
        history: newHistory,
      })

      const data = res.data

      if (res.status === 200 || res.status === 201) {
        const aiReply = data.reply || ""

        if (aiReply.trim()) {
          setChatHistory((prev) => [
            ...prev,
            { role: "assistant", content: aiReply },
          ])
        }

        if (aiReply.trim() && data.audio) {
          // Yaponcha javob audio
          setStatusText("Gapirmoqda...")
          playJapaneseAudio(data.audio)
        } else if (data.correction_audio) {
          // Xato bo'lsa - o'zbekcha haqoratli tuzatish
          setStatusText("Xatongizni tuzatmoqda...")
          playCorrectionOnly(data.correction_audio)
        } else {
          setIsProcessing(false)
          setStatusText("Tayyor")
        }
      } else {
        setStatusText("Javob olinmadi.")
        setIsProcessing(false)
      }
    } catch (e) {
      console.error(e)
      setStatusText("Ulanishda xatolik!")
      setIsProcessing(false)
    }
  }

  const playJapaneseAudio = (base64Audio: string) => {
    if (japaneseAudioRef.current) {
      japaneseAudioRef.current.pause()
    }
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`)
    audio.playbackRate = 0.9
    japaneseAudioRef.current = audio

    audio.onplay = () => {
      setIsSpeaking(true)
      setStatusText("Gapirmoqda...")
    }
    audio.onended = () => {
      setIsSpeaking(false)
      setIsProcessing(false)
      setStatusText("Tayyor")
    }
    audio.play()
  }

  const playCorrectionOnly = (base64Audio: string) => {
    if (correctionAudioRef.current) {
      correctionAudioRef.current.pause()
    }
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`)
    audio.playbackRate = 1.0
    correctionAudioRef.current = audio

    audio.onplay = () => {
      setIsSpeaking(true)
      setStatusText("Xatongizni tuzatmoqda...")
    }
    audio.onended = () => {
      setIsSpeaking(false)
      setIsProcessing(false)
      setStatusText("Tayyor")
    }
    audio.play()
  }

  return (
    <div className="relative flex h-[calc(100dvh-80px)] w-full flex-col overflow-hidden bg-white font-sans dark:bg-[#0a0a0a]">
      {/* Yuqori Panel - faqat mavzu/daraja va xotira tozalash */}
      <div className="z-20 flex w-full shrink-0 items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-gray-900 dark:bg-[#0a0a0a]/80">
        {/* Mavzu va Daraja - chap tomonda */}
        <div className="flex gap-4">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="cursor-pointer border-0 bg-transparent text-sm font-medium text-gray-700 outline-none focus:ring-0 dark:text-gray-300"
          >
            <option value="Erkin">Erkin</option>
            <option value="Tanishtiruv">Tanishtiruv</option>
            <option value="Oila">Oila</option>
            <option value="Ish">Ish / O'qish</option>
            <option value="Ko'cha">Ko'cha</option>
          </select>

          <span className="text-gray-300 dark:text-gray-700">|</span>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="cursor-pointer border-0 bg-transparent text-sm font-medium text-gray-700 outline-none focus:ring-0 dark:text-gray-300"
          >
            <option value="N5">N5</option>
            <option value="N4">N4</option>
            <option value="N3">N3</option>
            <option value="N2">N2</option>
          </select>
        </div>

        {/* Xotira tozalash - o'ng tomonda */}
        <button
          onClick={handleClearMemory}
          title="Xotirani tozalash"
          className="p-2 text-gray-400 transition hover:text-gray-900 dark:hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Asosiy maydon - FAQAT 3D SFERA + STATUS */}
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        <div
          className="flex aspect-square w-full max-w-[200px] cursor-pointer items-center justify-center md:max-w-[260px]"
          onClick={handleStartListening}
        >
          <Canvas camera={{ position: [0, 0, 4] }}>
            <ParticleSphere isListening={isListening} isSpeaking={isSpeaking} />
          </Canvas>
        </div>

        <p className="mt-8 text-center text-sm font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
          {statusText}
        </p>
      </div>

      {/* Pastki tugmalar */}
      <div className="flex w-full shrink-0 justify-center gap-4 border-t border-transparent bg-white px-4 pt-2 pb-24 md:pb-8 dark:bg-[#0a0a0a]">
        <button
          onClick={handleStartListening}
          disabled={isProcessing || isSpeaking}
          className={`min-w-[140px] rounded-xl px-8 py-3.5 text-sm font-medium transition-all ${
            isListening
              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
              : "bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          }`}
        >
          {isListening ? "Eshitilmoqda..." : "Gapirish"}
        </button>

        <button
          onClick={handleStopAll}
          className="min-w-[140px] rounded-xl border border-gray-200 bg-transparent px-8 py-3.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-[#111]"
        >
          To'xtatish
        </button>
      </div>
    </div>
  )
}