'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, X, Bot, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils-client'
import type { AiChatMessage } from '@/lib/types'

const SUGGESTIONS = [
  'What books would you recommend for me?',
  'Find me mystery novels under 500 KES',
  'What sci-fi books are available to borrow?',
  'How many books can I borrow at once?',
]

export function AiChatWidget() {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [streaming, setStreaming] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: AiChatMessage = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setStreaming('')

    try {
      const res = await fetch('/api/ai/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: newMessages }),
      })

      if (!res.body) throw new Error('No stream')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   full    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        full += chunk
        setStreaming(full)
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: full }])
      setStreaming('')
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I ran into an issue. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[420px] lg:w-[420px]">
      {/* Collapsed state */}
      {!open ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(true)}
          className="card p-5 flex items-center gap-4 hover:shadow-xl transition-all duration-200 w-full text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center group-hover:scale-105 transition-all duration-200">
            <Sparkles size={20} className="text-ink" />
          </div>
          <div>
            <p className="text-base font-semibold text-ink group-hover:text-gold transition-colors">AI Librarian</p>
            <p className="text-sm text-ink-3">Ask me anything about books</p>
          </div>
        </motion.button>
      ) : (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="card flex flex-col shadow-2xl rounded-2xl overflow-hidden"
          style={{ height: '500px', maxHeight: '80vh' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-cream-3 bg-cream">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <Sparkles size={18} className="text-ink" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">AI Librarian</p>
              <p className="text-xs text-ink-3">Powered by Grok</p>
            </div>
            <motion.button 
              whileHover={{ scale: 0.95 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setOpen(false)} 
              className="btn btn-ghost btn-sm btn-icon p-1"
            >
              <X size={16} />
            </motion.button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Welcome */}
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full gap-6 text-center py-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-dim to-gold flex items-center justify-center"
                >
                  <Sparkles size={24} className="text-gold" />
                </motion.div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-ink mb-1">Hi! I'm your AI librarian 🤖</p>
                  <p className="text-sm text-ink-2 max-w-sm mx-auto leading-relaxed">
                    Ask me to recommend books, find titles, check availability, or answer library questions.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      onClick={() => send(s)}
                      className="btn btn-ghost btn-sm text-xs h-10 px-3 text-left hover:bg-cream-3 transition-colors border border-cream-3"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={`${msg.role}-${i}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex gap-3 items-start max-w-[90%] p-3 rounded-xl",
                    msg.role === 'user' 
                      ? "ml-auto flex-row-reverse bg-gradient-to-r from-gold to-gold-dark text-ink" 
                      : "bg-cream border border-cream-3 text-ink"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-medium",
                    msg.role === 'user'
                      ? "bg-ink text-gold"
                      : "bg-gold-dim text-gold"
                  )}>
                    {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                  </div>
                  <div className="min-w-0 flex-1 prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Streaming */}
            {streaming && (
              <div className="flex gap-3 items-start p-3 bg-cream border border-cream-3 rounded-xl max-w-[90%]">
                <div className="w-8 h-8 rounded-lg bg-gold-dim text-gold flex items-center justify-center flex-shrink-0 text-xs font-medium">
                  <Bot size={12} />
                </div>
                <div className="flex-1 min-w-0 prose prose-sm">
                  <p className="whitespace-pre-wrap">{streaming}</p>
                  <span className="inline-block w-1 h-1 bg-gold mx-1 animate-pulse rounded-full" />
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && !streaming && (
              <div className="flex gap-3 items-center p-3 bg-cream border border-cream-3 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-gold-dim text-gold flex items-center justify-center flex-shrink-0">
                  <div className="flex items-center gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{animationDelay: `${i*0.1}s`}} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-cream-3 bg-cream">
            <div className="flex items-end gap-2">
              <input
                ref={inputRef}
                className="input flex-1 h-12 text-sm bg-white border-cream-3 focus:border-gold placeholder:text-ink-3"
                placeholder="Ask about books, availability, recommendations..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                disabled={loading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="btn btn-primary btn-icon h-12 w-12 p-0"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
