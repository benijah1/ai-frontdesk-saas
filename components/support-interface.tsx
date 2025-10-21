"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, X, Minimize2, Maximize2, User, Bot, Phone, Video, Mic, MicOff } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const MarkdownMessage: React.FC<{ text: string; isUser?: boolean }> = ({ text, isUser }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          />
        ),
        code({ inline, children, ...props }) {
          if (inline) {
            return (
              <code className={`px-1 py-0.5 rounded ${isUser ? "bg-white/20" : "bg-black/10"}`} {...props}>
                {children}
              </code>
            )
          }
          return (
            <pre className={`p-3 rounded ${isUser ? "bg-white/20" : "bg-black/10"} overflow-x-auto`}>
              <code {...props}>{children}</code>
            </pre>
          )
        },
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
        li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
        p:  ({ node, ...props }) => <p className="leading-relaxed break-words whitespace-pre-wrap" {...props} />,
      }}
    >
      {text}
    </ReactMarkdown>
  )
}

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface SupportInterfaceProps {
  onClose: () => void
}

function SupportInterface({ onClose }: SupportInterfaceProps) {
  const [supportType, setSupportType] = useState<"select" | "message" | "voice" | "video">("select")
  const [isRecording, setIsRecording] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi! I'm here to help with your Fix It! Home Services needs. What can I assist you with today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // WebRTC refs
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  // optional if you do meters or processing
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Responses threading (non-stream)
  const lastResponseIdRef = useRef<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // ensure hidden audio element exists & is configured for iOS
  const ensureAudioElement = () => {
    if (!audioElRef.current) return
    const el = audioElRef.current
    // iOS/Safari-friendly attributes
    el.setAttribute("playsinline", "")
    el.setAttribute("preload", "auto")
    el.autoplay = true
    // keep unmuted so you actually hear the model; the click that called startVoiceChat is a user gesture
    el.muted = false
    // try to pre-play (no-op until srcObject arrives on some browsers)
    el.play().catch(() => {
      // it's okay if this fails; we will call play() again when track arrives
    })
  }

  // Cleanup on unmount just in case a call is active
  useEffect(() => {
    return () => {
      stopVoiceChat()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // helper: wait for ICE gathering to finish (improves reliability)
  function waitForIceGathering(pc: RTCPeerConnection) {
    return new Promise<void>((resolve) => {
      if (pc.iceGatheringState === "complete") return resolve()
      const check = () => {
        if (pc.iceGatheringState === "complete") {
          pc.removeEventListener("icegatheringstatechange", check)
          resolve()
        }
      }
      pc.addEventListener("icegatheringstatechange", check)
    })
  }

  async function startVoiceChat() {
    try {
      setVoiceError(null)
      setIsRecording(false)

      // make sure audio element is ready for iOS before we connect
      ensureAudioElement()

      // 1) get ephemeral token from your server
      const tokenResp = await fetch("/api/realtime/session")

      const ct = tokenResp.headers.get("content-type") || ""
      if (!tokenResp.ok) {
        const errText = await tokenResp.text().catch(() => "")
        throw new Error(`Session error: ${tokenResp.status} ${errText.slice(0, 200)}`)
      }
      if (!ct.includes("application/json")) {
        await tokenResp.text().catch(() => "")
        throw new Error("Session endpoint did not return JSON")
      }
      const { clientSecret } = await tokenResp.json()
      if (!clientSecret) throw new Error("Missing clientSecret from session endpoint")

      // 2) set up WebRTC
      const pc = new RTCPeerConnection()
      pcRef.current = pc

      // Add a recv transceiver so Safari reliably fires ontrack
      try {
        pc.addTransceiver("audio", { direction: "sendrecv" })
      } catch {
        // not all browsers require/allow this; safe to ignore errors
      }

      pc.ontrack = async (e) => {
        if (audioElRef.current) {
          audioElRef.current.srcObject = e.streams[0]
          // kick playback (helps iOS)
          try {
            await audioElRef.current.play()
          } catch {
            // a secondary user gesture (e.g., tapping End/Start) would also unlock
          }
        }
      }

      // optional data channel for events/text
      const dc = pc.createDataChannel("oai-events")
      dataChannelRef.current = dc
      dc.onmessage = (evt) => console.log("[realtime] event:", evt.data)

      // 3) capture mic and add to pc (mobile-friendly constraints)
      const mic = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      micStreamRef.current = mic
      mic.getTracks().forEach((t) => pc.addTrack(t, mic))

      // 4) negotiate SDP
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      await waitForIceGathering(pc)

      const sdpResponse = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          "Content-Type": "application/sdp",
          "OpenAI-Beta": "realtime=v1",
        },
        body: pc.localDescription?.sdp,
      })

      if (!sdpResponse.ok) {
        const text = await sdpResponse.text().catch(() => "")
        throw new Error(`Realtime SDP failed (${sdpResponse.status}) ${text}`)
      }

      const answer = { type: "answer", sdp: await sdpResponse.text() } as RTCSessionDescriptionInit
      await pc.setRemoteDescription(answer)

      setIsRecording(true)

      pc.onconnectionstatechange = () => {
        if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
          setIsRecording(false)
          // optional: stopVoiceChat()
        }
      }
    } catch (err) {
      console.error("startVoiceChat error:", err)
      setVoiceError(err instanceof Error ? err.message : String(err))
      setIsRecording(false)
      stopVoiceChat()
    }
  }

  const stopVoiceChat = () => {
    try {
      // stop mic
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => {
          try {
            t.stop()
          } catch {}
        })
        micStreamRef.current = null
      }

      // close data channel
      if (dataChannelRef.current) {
        try {
          dataChannelRef.current.close()
        } catch {}
        dataChannelRef.current = null
      }

      // close peer connection + transceivers
      if (pcRef.current) {
        try {
          pcRef.current.getTransceivers?.().forEach((tx) => {
            try {
              tx.stop?.()
            } catch {}
          })
          pcRef.current.close()
        } catch {}
        pcRef.current = null
      }

      // detach remote audio
      if (audioElRef.current) {
        try {
          // @ts-expect-error: srcObject exists at runtime
          audioElRef.current.srcObject = null
        } catch {}
      }

      // optional audio context cleanup
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close()
        } catch {}
        audioCtxRef.current = null
      }

      setIsRecording(false)
      setVoiceError(null)
    } catch (err) {
      console.error("stopVoiceChat error:", err)
      setVoiceError(err instanceof Error ? err.message : String(err))
    }
  }

  const startVideoChat = async () => {
    try {
      console.log("[v0] Starting video chat...")
      setVideoError(null)

      const response = await fetch("/api/tavus-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Video conversation created:", data.conversation_id)

      setVideoUrl(data.conversation_url)
      setConversationId(data.conversation_id)
    } catch (error) {
      console.error("[v0] Error creating video chat:", error)
      setVideoError(`Failed to create video conversation: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const endVideoChat = async () => {
    if (conversationId) {
      try {
        await fetch("/api/tavus-conversation/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId }), // camelCase to match the route fix
        })
        console.log("[v0] Video conversation ended")
      } catch (error) {
        console.error("[v0] Error ending video conversation:", error)
      }
    }
    setVideoUrl(null)
    setConversationId(null)
    setVideoError(null)
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    console.log("[v0] Sending message (non-stream):", inputMessage)
    setError(null)

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    }

    // Show user message immediately
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const resp = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          previousResponseId: lastResponseIdRef.current ?? undefined,
          // no `stream: true`
        }),
      })

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data?.error || `API request failed: ${resp.status} - ${resp.statusText}`)
      }

      const data = await resp.json().catch(() => ({}))
      if (data?.error) throw new Error(data.error)

      // Save response id so the server can thread follow-ups
      lastResponseIdRef.current = data?.responseId ?? null

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data?.response ?? "Sorry, I couldn't process that. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      console.log("[v0] Message processed (non-stream)")
    } catch (error) {
      console.error("[v0] Error sending message:", error)

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm sorry, I'm having trouble connecting right now. Please try again or call us directly at 951-525-1848.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (supportType === "select") {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Choose Support Option</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-black hover:text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setSupportType("message")}
              className="w-full flex items-center justify-start space-x-3 h-16 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageCircle className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Message Chat</div>
                <div className="text-sm text-white/80">Text-based support</div>
              </div>
            </Button>

            <Button
              onClick={() => {
                setSupportType("voice")
                startVoiceChat()
              }}
              className="w-full flex items-center justify-start space-x-3 h-16 bg-green-600 hover:bg-green-700 text-white"
            >
              <Phone className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Voice Chat</div>
                <div className="text-sm text-white/80">Real-time voice support</div>
              </div>
            </Button>

            <Button
              onClick={() => {
                setSupportType("video")
                startVideoChat()
              }}
              className="w-full flex items-center justify-start space-x-3 h-16 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Video className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Video Chat</div>
                <div className="text-sm text-white/80">Face-to-face support</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (supportType === "voice") {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Voice Support</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  stopVoiceChat()
                  setSupportType("select")
                }}
                className="text-black hover:text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {/* Hidden audio element that plays the model's voice.
                Keep it in the DOM for iOS autoplay rules. */}
            <audio ref={audioElRef} autoPlay playsInline className="hidden" />

            {voiceError ? (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                <p className="font-semibold">Connection Error</p>
                <p className="text-sm mt-1">{voiceError}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${isRecording ? "bg-green-600 animate-pulse" : "bg-gray-300"}`}
                >
                  {isRecording ? (
                    <Mic className="h-12 w-12 text-white" />
                  ) : (
                    <MicOff className="h-12 w-12 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg">{isRecording ? "Voice Chat Active" : "Connecting..."}</p>
                  <p className="text-gray-600 text-sm">
                    {isRecording ? "Speak naturally - I'm listening!" : "Setting up your voice connection"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  stopVoiceChat() // ensure cleanup when leaving voice
                  setSupportType("select")
                }}
                variant="outline"
                className="flex-1 hover:text-black hover:bg-gray-50"
              >
                Choose Different Option
              </Button>
              {isRecording && (
                <Button onClick={stopVoiceChat} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  End Call
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (supportType === "video") {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl h-[80vh]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Video Support</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  endVideoChat()
                  setSupportType("select")
                }}
                className="text-black hover:text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {videoError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="text-red-600 bg-red-50 p-6 rounded-lg max-w-md">
                    <p className="font-semibold">Video Chat Error</p>
                    <p className="text-sm mt-2">{videoError}</p>
                  </div>
                  <Button
                    onClick={() => setSupportType("select")}
                    variant="outline"
                    className="hover:text-black hover:bg-gray-50"
                  >
                    Choose Different Option
                  </Button>
                </div>
              </div>
            ) : videoUrl ? (
              <iframe
                src={videoUrl}
                className="w-full h-full rounded-b-lg"
                allow="camera; microphone; fullscreen"
                title="Video Support Chat"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-lg font-semibold">Setting up video chat...</p>
                  <p className="text-gray-600">Please wait while we connect you</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className={`fixed ${isMinimized ? "bottom-4 right-4 w-80" : "inset-0"} z-50 ${
        isMinimized ? "" : "bg-black/50 flex items-center justify-center p-4"
      }`}
    >
      <Card className={`${isMinimized ? "w-full h-96" : "w-full max-w-2xl h-[80vh]"} flex flex-col`}>
        <CardHeader className="flex flex-row items-center justify-between py-3 flex-shrink-0">
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Message Support</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-600 text-white">
              Online
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-black hover:text-blue-600 hover:bg-blue-50"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-black hover:text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {error && <div className="mx-4 mt-2 text-red-600 text-sm bg-red-50 p-2 rounded flex-shrink-0">{error}</div>}

          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div className={`p-2 rounded-full ${message.role === "user" ? "bg-blue-600" : "bg-gray-300"}`}>
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-700" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-gray-200 text-black rounded-bl-md"
                    }`}
                  >
                    <div className={`text-sm ${message.role === "user" ? "text-white" : "text-black"}`}>
                      <MarkdownMessage text={message.content} isUser={message.role === "user"} />
                    </div>
                    <p className={`text-xs mt-1 ${message.role === "user" ? "text-white/70" : "text-black/50"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="p-2 rounded-full bg-gray-300">
                    <Bot className="h-4 w-4 text-gray-700" />
                  </div>
                  <div className="p-3 rounded-2xl rounded-bl-md bg-gray-200">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-gray-600 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4 flex-shrink-0">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { SupportInterface }
export default SupportInterface
