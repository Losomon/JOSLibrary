'use client'

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Database } from '../../lib/database.types';

type Book = Database['public']['Tables']['books']['Row'];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  interface Message {
    role: 'user' | 'assistant';
    text: string;
  }
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Habari! 👋 I'm your Bibliotheca AI. Ask me anything about our books — I can help you find the perfect read, check availability, or explain our borrowing process!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const { data } = await supabase
        .from('books')
        .select('title, author, genres, price, available, current_copies, total_copies')
        .order('created_at', { ascending: false })
        .limit(40);
      return data || [];
    },
    initialData: [],
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    setStreamingText('');

    const catalog = books.slice(0, 40).map((b: Book) =>
      `"${b.title}" by ${b.author} | Genre: ${b.genres?.join(', ') || 'N/A'} | Price: KES ${b.price || 'N/A'} | Available: ${b.available ? 'Yes' : 'No'} (${b.current_copies || 0}/${b.total_copies || 0} copies)`
    ).join('\n');

    const systemPrompt = `You are a friendly, knowledgeable AI librarian at Bibliotheca in Nairobi, Kenya. 
You help users find books, answer questions about borrowing policies, recommend reads, and guide them through the catalog.
Borrowing = 14-day loan. Prices in Kenyan Shillings (KES).
Library: Westlands, Nairobi. Open Mon-Sat 8am-8pm, Sun 10am-6pm.

Current catalog (sample):
${catalog}

User conversation:
${newMessages.slice(1).map(m => `${m.role}: ${m.text}`).join('\n')}

Reply warmly, concisely (2-4 sentences). Recommend clearly. Use Swahili greetings occasionally.`;

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'system' as const, content: systemPrompt }], 
          stream: true 
        }),
      });

      if (!response.body) throw new Error('No stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        full += chunk;
        setStreamingText(full);
      }

      setMessages(prev => [...prev, { role: 'assistant', text: full }]);
      setStreamingText('');
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, something went wrong. Try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[60] size-14 rounded-full shadow-2xl hover:scale-105 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700"
        size="icon"
        variant="default"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 180 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: -180 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-[60] w-[340px] max-w-sm max-h-[520px] bg-background rounded-2xl shadow-2xl border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center gap-3">
              <div className="size-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Bibliotheca AI</h3>
                <p className="text-xs text-white/80">Westlands, Nairobi</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[340px]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 } as const}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'justify-end' : 'justify-start' as const
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="size-7 bg-primary/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {streamingText && (
                <div className="flex gap-3">
                  <div className="size-7 bg-primary/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm max-w-[80%]">
                    {streamingText}
                    <Loader2 className="inline h-4 w-4 animate-spin ml-1" />
                  </div>
                </div>
              )}
              {loading && !streamingText && (
                <div className="flex gap-3">
                  <div className="size-7 bg-primary/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="h-12 rounded-xl border-border bg-muted/50 text-sm"
                disabled={loading}
              />
              <Button
                size="icon"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

