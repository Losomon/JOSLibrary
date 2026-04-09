'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'

const QUOTES = [
  { text: 'A reader lives a thousand lives before he dies.', author: 'George R.R. Martin' },
  { text: 'Not all those who wander are lost.', author: 'J.R.R. Tolkien' },
  { text: 'A word after a word after a word is power.', author: 'Margaret Atwood' },
]

type Mode = 'password' | 'magic'

export default function LoginPage() {
  const router = useRouter()
  const QUOTE  = QUOTES[0]
  const [mode,    setMode]    = useState<Mode>('password')
  const [email,   setEmail]   = useState('')
  const [pw,      setPw]      = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const supabase = createClient()

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) toast.error(error.message)
    else { toast.success('Welcome back!'); router.push('/dashboard'); router.refresh() }
    setLoading(false)
  }

  async function handleMagic(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/dashboard` } })
    if (error) toast.error(error.message)
    else setSent(true)
    setLoading(false)
  }

  async function handleGoogle() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/dashboard` } })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>

      {/* Left dark panel */}
      <div style={{ background: 'var(--ink)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(40px,6vw,80px)', minHeight: 480 }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .04, pointerEvents: 'none', backgroundImage: `repeating-linear-gradient(135deg, var(--cream) 0px, var(--cream) 1px, transparent 1px, transparent 40px)` }} />
        <div style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 3, background: 'var(--gold)', borderRadius: '0 2px 2px 0', opacity: .7 }} />
        <div style={{ position: 'absolute', bottom: -20, right: -20, fontFamily: 'var(--font-display)', fontSize: 'clamp(120px,14vw,200px)', fontWeight: 700, color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', letterSpacing: '-4px' }}>
          READ
        </div>

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={17} style={{ color: 'var(--ink)' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--cream)', fontSize: 18, fontWeight: 600 }}>
            JOS<span style={{ color: 'var(--gold)' }}>.</span>Library
          </span>
        </div>

        {/* Copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>AI-powered reading</p>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--cream)', fontSize: 'clamp(28px,3vw,44px)', lineHeight: 1.18, marginBottom: 36 }}>
            Knowledge<br />meets<br /><em style={{ color: 'var(--gold)' }}>intelligence.</em>
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Borrow books', 'Buy with M-Pesa', 'AI librarian', 'Nairobi delivery'].map(l => (
              <span key={l} style={{ fontSize: 12, color: 'rgba(240,235,228,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 99, padding: '5px 12px' }}>{l}</span>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 24 }}>
          <p style={{ fontFamily: 'var(--font-display)', color: 'rgba(240,235,228,.5)', fontSize: 14, lineHeight: 1.6, fontStyle: 'italic', marginBottom: 6 }}>"{QUOTE.text}"</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.28)' }}>— {QUOTE.author}</p>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(32px,5vw,64px) clamp(24px,4vw,48px)' }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28 }} style={{ width: '100%', maxWidth: 360 }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
            <div style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={14} style={{ color: 'var(--ink)' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>JOS Library</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 4 }}>Welcome back</h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 28 }}>Sign in to your library account</p>

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface)', borderRadius: 'var(--r-md)', marginBottom: 24 }}>
            {(['password', 'magic'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setSent(false) }}
                style={{ flex: 1, padding: '7px 0', fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all .2s', background: mode === m ? 'var(--bg)' : 'transparent', color: mode === m ? 'var(--text)' : 'var(--text-3)', fontWeight: mode === m ? 500 : 400, boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.08)' : 'none', fontFamily: 'var(--font-body)' }}>
                {m === 'password' ? 'Password' : 'Magic link'}
              </button>
            ))}
          </div>

          {/* Sent state */}
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(42,122,111,.15)', border: '1px solid var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Mail size={22} style={{ color: 'var(--teal)' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Check your inbox</h3>
              <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
                We sent a link to<br /><strong style={{ color: 'var(--text-2)' }}>{email}</strong>
              </p>
              <button onClick={() => setSent(false)} style={{ marginTop: 20, fontSize: 13, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Different email</button>
            </motion.div>
          ) : (
            <form onSubmit={mode === 'password' ? handlePassword : handleMagic} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, fontWeight: 500 }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                  <input type="email" className="input pl-10" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                </div>
              </div>

              {mode === 'password' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>Password</label>
                    <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--gold)' }}>Forgot?</Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                    <input type={showPw ? 'text' : 'password'} className="input pl-10 pr-10" required placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full gap-2" style={{ marginTop: 4 }}>
                {loading
                  ? <><span className="spinner" />{mode === 'password' ? 'Signing in…' : 'Sending…'}</>
                  : mode === 'password'
                    ? <><ArrowRight size={16} /> Sign in</>
                    : <><Mail size={15} /> Send magic link</>
                }
              </button>
            </form>
          )}

          {!sent && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--text-3)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} /> or <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
              <button onClick={handleGoogle} disabled={loading} className="btn btn-ghost w-full gap-2" style={{ height: 42, fontSize: 14 }}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 22 }}>
            New here?{' '}
            <Link href="/register" style={{ color: 'var(--gold)', fontWeight: 500 }}>Create a free account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}