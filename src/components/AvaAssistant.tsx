import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  X,
  Send,
  RotateCcw,
  Volume2,
  VolumeX,
  Briefcase,
  Copy,
  Check,
  Cpu,
  Users,
  Building2,
  Calendar,
  FileText,
  MessageCircle,
} from 'lucide-react'
import { generateAvaHumanResponse } from '../utils/avaConversationEngine'
import { detectTopicRoute, type RouteAction } from '../utils/avaRouting'
import {
  wantsDocumentVerification,
  extractDocumentReferenceId,
  lookupDocumentVerification,
  formatVerificationReply,
  ASK_FOR_DOCUMENT_ID,
} from '../utils/avaDocumentVerify'

export interface ChatMessage {
  id: string
  sender: 'ava' | 'user'
  text: string
  timestamp: string
  routeAction?: RouteAction
  showChoice?: boolean
  isRoutingNotice?: boolean
}

interface QuickTopic {
  label: string
  query: string
  icon: typeof Cpu
}

const QUICK_TOPICS: QuickTopic[] = [
  { label: 'IT & Software', query: 'What IT and software services does OPERAVA offer?', icon: Cpu },
  { label: 'BPO Operations', query: 'Tell me about OPERAVA BPO and customer operations.', icon: Users },
  { label: 'Company', query: 'Who is OPERAVA and where do you operate from?', icon: Building2 },
  { label: 'Engagement', query: 'How do OPERAVA delivery models work?', icon: Calendar },
  { label: 'Careers', query: 'What careers are available at OPERAVA?', icon: Briefcase },
  { label: 'Verify document', query: 'I want to verify a document reference ID', icon: FileText },
]

function renderInline(str: string, isUser = false) {
  const parts = str.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className={isUser ? 'font-semibold text-white' : 'font-semibold text-white'}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function renderMessageText(text: string, isUser = false) {
  const paragraphs = text.split(/\n\n+/)
  return (
    <div className="space-y-2.5 text-xs sm:text-[13px] leading-relaxed break-words font-normal">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n')
        if (
          lines.some(
            (l) =>
              l.trim().startsWith('• ') ||
              l.trim().startsWith('- ') ||
              l.trim().startsWith('a. ') ||
              /^\d+\.\s/.test(l.trim()),
          )
        ) {
          return (
            <div key={pIdx} className="space-y-1.5">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim()
                const numMatch = trimmed.match(/^(\d+)\.\s*(.*)$/)
                if (numMatch) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2">
                      <span className={isUser ? 'font-semibold text-violet-200 shrink-0' : 'font-semibold text-accent shrink-0'}>
                        {numMatch[1]}.
                      </span>
                      <span>{renderInline(numMatch[2], isUser)}</span>
                    </div>
                  )
                }
                if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2">
                      <span className={isUser ? 'w-1.5 h-1.5 bg-violet-200 shrink-0 mt-1.5' : 'w-1.5 h-1.5 bg-accent shrink-0 mt-1.5'} />
                      <span>{renderInline(trimmed.replace(/^[•\-]\s*/, ''), isUser)}</span>
                    </div>
                  )
                }
                return <p key={lIdx}>{renderInline(line, isUser)}</p>
              })}
            </div>
          )
        }
        return (
          <p key={pIdx}>
            {lines.map((line, lIdx) => (
              <span key={lIdx}>
                {renderInline(line, isUser)}
                {lIdx < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

function AvaHumanAvatar({ size = 'h-8 w-8' }: { size?: string }) {
  return (
    <span className={`relative inline-flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#A000F0]/50 bg-[#21102d]`} aria-label="AVA assistant avatar" role="img">
      <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
        <circle cx="24" cy="24" r="24" fill="#2b123b" />
        <path d="M8 48c1.8-9.4 7.1-14 16-14s14.2 4.6 16 14" fill="#A000F0" />
        <path d="M14 19c0-9 4.2-14 10-14s10 5 10 14v5c0 8-4.4 13-10 13s-10-5-10-13z" fill="#f0bd9f" />
        <path d="M12 22c-1.8-10 2.6-18 12-18 9.3 0 14.1 7.4 12 18l-2.5-5.5c-4.6.4-9.4-1.4-12.7-4.7-1.2 3.9-4.1 6.5-8.8 7.2z" fill="#29202a" />
        <path d="M16.5 23.5h2M29.5 23.5h2" stroke="#39242a" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M21 30c1.8 1.5 4.2 1.5 6 0" fill="none" stroke="#a95e62" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M18 36c2 2 10 2 12 0l3 3-9 5-9-5z" fill="#f0bd9f" />
        <path d="M8 48c1.8-8.8 7.2-13.2 16-13.2S38.2 39.2 40 48" fill="#A000F0" />
      </svg>
    </span>
  )
}
function AvaThinkingWaves() {
  return (
    <>
    <style>{`@keyframes ava-line-motion { 0%, 100% { opacity: .25; transform: translateX(0); } 45% { opacity: 1; transform: translateX(5px); } } .ava-thinking-line { animation: ava-line-motion 1.05s ease-in-out infinite; } @media (prefers-reduced-motion: reduce) { .ava-thinking-line { animation: none; opacity: .75; } }`}</style>
    <div className="flex gap-2.5 justify-start animate-fade-in" aria-live="polite" aria-label="AVA is thinking">
      <AvaHumanAvatar size="h-8 w-8" />
      <div className="min-w-[148px] px-3.5 py-3 bg-[#111] border border-neutral-800">
        <div className="flex flex-col justify-center gap-[5px] h-7 w-28">
          <span className="ava-thinking-line block h-0.5 w-full bg-accent" style={{ animationDelay: "0ms" }} />
          <span className="ava-thinking-line block h-0.5 w-3/4 bg-accent" style={{ animationDelay: "220ms" }} />
          <span className="ava-thinking-line block h-0.5 w-1/2 bg-accent" style={{ animationDelay: "440ms" }} />
        </div>
      </div>
    </div>
    </>
  )
}

const WELCOME =
  "Hi! I'm AVA from OPERAVA.\n\nI can explain our technology, workforce, and talent solutions — help you get in touch — or verify an OPERAVA document if you paste the reference ID.\n\nHow can I help you today?"

export default function AvaAssistant() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [inputText, setInputText] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const drawerHolderRef = useRef<HTMLButtonElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const initialMessage: ChatMessage = {
    id: 'welcome-1',
    sender: 'ava',
    text: WELCOME,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('operava_ava_messages')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // ignore
    }
    return [initialMessage]
  })

  useEffect(() => {
    if (['/quote', '/apply', '/contact'].includes(location.pathname)) {
      setIsOpen(false)
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    try {
      localStorage.setItem('operava_ava_messages', JSON.stringify(messages))
    } catch {
      // ignore
    }
  }, [messages])

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking, isOpen])


  const handleOpen = () => {
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus(), 300)
  }

  const handleRoute = (to: string) => {
    setIsOpen(false)
    navigate(to)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const playNotificationSound = () => {
    if (!soundEnabled) return
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime)
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.25)
    } catch {
      // audio may be blocked
    }
  }

  const pushAva = (text: string, extra?: Partial<ChatMessage>) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `ava-${Date.now()}`,
        sender: 'ava',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...extra,
      },
    ])
    playNotificationSound()
  }

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim()
    if (!query || isThinking) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    playNotificationSound()

    if (wantsDocumentVerification(query)) {
      const docId = extractDocumentReferenceId(query)
      if (!docId) {
        pushAva(ASK_FOR_DOCUMENT_ID)
        return
      }
      setIsThinking(true)
      try {
        const result = await lookupDocumentVerification(docId)
        pushAva(formatVerificationReply(result))
      } finally {
        setIsThinking(false)
      }
      return
    }

    setIsThinking(true)

    const historyPayload = [...messages, userMsg].slice(-8).map((m) => ({
      role: m.sender === 'user' ? ('user' as const) : ('model' as const),
      text: m.text,
    }))

    let reply = generateAvaHumanResponse(query).text
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history: historyPayload }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.text && !data.fallback) reply = data.text as string
      }
    } catch {
      // local knowledge fallback
    }

    const topicRoute = detectTopicRoute(query, reply)
    if (topicRoute && topicRoute.isDirectIntent) {
      pushAva(reply, { routeAction: topicRoute, showChoice: true })
    } else {
      pushAva(reply, topicRoute ? { routeAction: topicRoute } : undefined)
    }
    setIsThinking(false)
  }

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ava',
        text: WELCOME,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  const copyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      // ignore
    }
  }


  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (chatWindowRef.current?.contains(target) || drawerHolderRef.current?.contains(target)) return
      setIsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      <button
        ref={drawerHolderRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className="fixed right-0 top-1/2 z-[61] flex h-14 w-8 -translate-y-1/2 items-center justify-center rounded-l-lg border border-r-0 border-neutral-700 bg-[#151515] p-1 text-neutral-200 shadow-lg transition-colors hover:border-accent hover:bg-[#202020] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label={isOpen ? 'Close AVA assistant' : 'Open AVA assistant'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-4 w-4 text-accent" /> : <MessageCircle className="h-4 w-4 text-accent" />}
      </button>

      <aside
        ref={chatWindowRef}
        className={`fixed right-0 top-0 z-[60] flex h-[100dvh] w-[min(100vw,420px)] flex-col overflow-hidden border-l border-neutral-800 bg-[#0a0a0a] shadow-[-24px_0_70px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
        role="dialog"
        aria-label="AVA assistant"
        aria-modal="false"
        aria-hidden={!isOpen}
      >
      <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-accent bg-black text-white">
        <div className="flex items-center gap-2 min-w-0">
          <AvaHumanAvatar size="h-9 w-9" />
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-widest truncate">AVA</p>
            <p className="text-[10px] tracking-widest uppercase text-neutral-500 truncate">OPERAVA assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setSoundEnabled((s) => !s)} className="p-2 hover:bg-white/10" aria-label="Toggle sound">
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button type="button" onClick={handleReset} className="p-2 hover:bg-white/10" aria-label="Reset chat">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-black">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'ava' && <span className="mt-0.5"><AvaHumanAvatar size="h-7 w-7" /></span>}
            <div className={`max-w-[85%] px-3.5 py-2.5 ${m.sender === 'user' ? 'bg-accent-solid text-white' : 'bg-[#111] border border-neutral-800 text-neutral-200'}`}>
              {renderMessageText(m.text, m.sender === 'user')}
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className={`text-[10px] ${m.sender === 'user' ? 'text-violet-200' : 'text-neutral-500'}`}>{m.timestamp}</span>
                {m.sender === 'ava' && (
                  <button type="button" onClick={() => copyMessage(m.id, m.text)} className="text-neutral-500 hover:text-accent p-0.5" aria-label="Copy">
                    {copiedId === m.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
              {m.showChoice && m.routeAction && (
                <div className="mt-2 flex flex-col gap-1.5">
                  <button type="button" onClick={() => handleRoute(m.routeAction!.to)} className="text-[11px] tracking-widest uppercase font-bold bg-white text-black hover:bg-accent-solid hover:text-white px-3 py-2 text-left transition-colors">
                    Open form on website
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isThinking && <AvaThinkingWaves />}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-3 pt-2 pb-1 border-t border-neutral-900 bg-[#0a0a0a]">
        <div className="flex gap-1.5 overflow-x-auto pb-2 ava-horizontal-scroll">
          {QUICK_TOPICS.map((t) => {
            const Icon = t.icon
            return (
              <button key={t.label} type="button" onClick={() => handleSendMessage(t.query)} className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium text-neutral-300 border border-neutral-800 hover:border-accent hover:text-white">
                <Icon className="w-3 h-3" />
                {t.label}
              </button>
            )
          })}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); void handleSendMessage() }} className="flex items-center gap-2 pb-3">
          <input ref={inputRef} type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Ask AVA or paste a document ID…" className="flex-1 min-w-0 px-3 h-10 bg-black border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent" disabled={isThinking} />
          <button type="submit" disabled={isThinking || !inputText.trim()} className="h-10 w-10 bg-white text-black flex items-center justify-center hover:bg-accent-solid hover:text-white disabled:opacity-50 transition-colors" aria-label="Send">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
      </aside>
    </>
  )
}
