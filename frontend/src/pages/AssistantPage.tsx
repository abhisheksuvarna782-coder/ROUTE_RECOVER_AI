import React, { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { chatWithAssistant, getRecoveryHistory, listTrips } from '@/services/api'
import { apiErrorMessage } from '@/utils'
import { MessageSquare, Send, Bot, User } from 'lucide-react'
import type { ChatMessage } from '@/types'

const QUICK_PROMPTS = [
  "Why was this recovery option recommended?",
  "Is there a cheaper alternative?",
  "What if I can travel overnight?",
  "Explain the rejected options",
  "What actions do I need to take?",
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        '👋 Hi! I\'m the RouteRecover AI assistant. I can help you understand recovery options, explain why alternatives were accepted or rejected, and answer questions about your disrupted journey.\n\nRun the demo scenario first, then ask me about your recovery plan!',
    },
  ])
  const [input, setInput] = useState('')
  const [recoveryId, setRecoveryId] = useState<string | undefined>()
  const [tripId, setTripId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: history } = useQuery({
    queryKey: ['recovery-history'],
    queryFn: getRecoveryHistory,
  })
  const { data: trips } = useQuery({
    queryKey: ['trips'],
    queryFn: () => listTrips(),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      chatWithAssistant({
        message,
        recovery_plan_id: recoveryId,
        trip_id: tripId,
        history: messages.slice(1),
      }),
    onSuccess: (resp) => {
      setMessages(prev => [...prev, { role: 'assistant', content: resp.response }])
    },
    onError: (error) => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `❌ ${apiErrorMessage(error, 'Sorry, I could not process that. Make sure the backend is running.')}` },
      ])
    },
  })

  const send = (text: string) => {
    if (!text.trim()) return
    const msg = text.trim()
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setInput('')
    chatMutation.mutate(msg)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send(input)
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-50 flex items-center gap-2">
            <MessageSquare size={22} className="text-navy-400" />
            AI Travel Assistant
          </h1>
          <p className="text-surface-400 text-sm mt-0.5">Ask about your recovery plan, alternatives, and next steps</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 overflow-hidden">
        {/* Context selectors */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-4">
            <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-3">Context</h2>
            <div className="space-y-3">
              <div>
                <label className="label text-xs">Recovery Plan</label>
                <select
                  className="select text-xs"
                  value={recoveryId || ''}
                  onChange={e => setRecoveryId(e.target.value || undefined)}
                >
                  <option value="">None selected</option>
                  {history?.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.id.slice(0, 12)}… ({p.status})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Trip</label>
                <select
                  className="select text-xs"
                  value={tripId || ''}
                  onChange={e => setTripId(e.target.value || undefined)}
                >
                  <option value="">None selected</option>
                  {trips?.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-3">Quick Questions</h2>
            <div className="space-y-1.5">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="w-full text-left text-xs text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded px-2 py-1.5 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-3 flex flex-col card overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${msg.role === 'user'
                    ? 'bg-navy-600/30 border border-navy-600/50'
                    : 'bg-ocean-600/30 border border-ocean-600/50'}`}
                >
                  {msg.role === 'user'
                    ? <User size={14} className="text-navy-400" />
                    : <Bot size={14} className="text-ocean-400" />
                  }
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {msg.content}
                  </pre>
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-ocean-600/30 border border-ocean-600/50 flex items-center justify-center">
                  <Bot size={14} className="text-ocean-400" />
                </div>
                <div className="chat-bubble-assistant flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-ocean-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-surface-500">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-surface-700 p-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                id="chat-input"
                type="text"
                className="input flex-1"
                placeholder="Ask about your recovery plan…"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={chatMutation.isPending}
              />
              <button
                type="submit"
                disabled={!input.trim() || chatMutation.isPending}
                className="btn btn-ocean"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
