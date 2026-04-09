'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, Mail, Lock, User, Eye, EyeOff, Phone, Sparkles, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'

const PERKS = [
  'Borrow up to 3 books at once',
  'Pay with M-Pesa or card',
  'AI librarian, always available',
  'Delivered across Nairobi',
]

function AnimateStep({ active, children }: { active: boolean; children: React.ReactNode }) {
  if (!active) return null
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: .22 }}
    >
      {children}
    </motion.div>
  )
}

function Field({ label, icon: Icon, children, action }: {
  label: React.ReactNode
  icon: React.ElementType
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, fontWeight: 500 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
        {children}
        {action}
      </div>
    </div>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'uppercase',     pass: /[A-Z]/.test(password) },
    { label: 'number',        pass: /\d/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const colors = ['var(--rust)', 'var(--gold)', 'var(--teal)']
  const labels = ['Weak', 'Fair', 'Strong']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < score ? colors[score - 1] : 'var(--cream-3)', transition: 'background .3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {checks.map(c => (
            <span key={c.label} style={{ fontSize: 11, color: c.pass ? 'var(--teal-light)' : 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
              {c.pass ? <Check size={9} /> : '○'} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && <span style={{ fontSize: 11, fontWeight: 500, color: colors[score - 1] }}>{labels[score - 1]}</span>}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const router  = useRouter()
  const [step,    setStep]    = useState<1 | 2>(1)
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function goStep2(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) { toast.error('Please fill in name and email'); return }
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 8)       { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: { full_name: form.name, phone: form.phone },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) toast.error(error.message)
    else { toast.success('Account created! Check your email to confirm.'); router.push('/login') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>

      {/* ── Left panel ── */}
      <div style={{ background: 'var(--ink)', padding: 'clamp(40px,6vw,80px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', minHeight: 480 }}>

        {/* Grid texture */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .045,
          backgroundImage: `repeating-linear-gradient(0deg, var(--cream) 0px, var(--cream) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, var(--cream) 0px, var(--cream) 1px, transparent 1px, transparent 60px)` }} />

        {/* Ghost number */}
        <div style={{ position: 'absolute', right: -30, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-display)', fontSize: 'clamp(160px,18vw,260px)', fontWeight: 700, color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.05)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>
          01
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
          <p style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 18 }}>Join free today</p>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--cream)', fontSize: 'clamp(28px,3vw,44px)', lineHeight: 1.18, marginBottom: 32 }}>
            Your next great<br />read is one<br />
            <em style={{ color: 'var(--gold)' }}>tap away.</em>
          </h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {PERKS.map((p, i) => (
              <motion.li key={p} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .1 + i * .07 }}
                style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ width: 21, height: 21, borderRadius: '50%', background: 'rgba(201,168,76,.14)', border: '1px solid rgba(201,168,76,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={10} style={{ color: 'var(--gold)' }} />
                </span>
                <span style={{ color: 'rgba(240,235,228,.68)', fontSize: 14 }}>{p}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Step tracker */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          {([1, 2] as const).map((n, idx) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= n ? 'var(--gold)' : 'rgba(255,255,255,.1)', border: `1px solid ${step >= n ? 'var(--gold)' : 'rgba(255,255,255,.18)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: step >= n ? 'var(--ink)' : 'rgba(255,255,255,.3)', transition: 'all .3s' }}>
                {step > n ? <Check size={12} /> : n}
              </div>
              <span style={{ fontSize: 12, color: step >= n ? 'rgba(240,235,228,.8)' : 'rgba(255,255,255,.28)' }}>{n === 1 ? 'Your info' : 'Password'}</span>
              {idx < 1 && <div style={{ width: 20, height: 1, background: step > 1 ? 'var(--gold)' : 'rgba(255,255,255,.15)', transition: 'background .3s', margin: '0 2px' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(32px,5vw,64px) clamp(24px,4vw,48px)' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Mobile step bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
            {[1, 2].map(n => (
              <div key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: step >= n ? 'var(--gold)' : 'var(--cream-3)', transition: 'background .3s' }} />
            ))}
          </div>

          {/* Step 1 */}
          <AnimateStep active={step === 1}>
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Step 1 of 2</p>
              <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 4 }}>Tell us about you</h2>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Takes less than a minute.</p>
            </div>
            <form onSubmit={goStep2} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Full name" icon={User}>
                <input className="input pl-10" required placeholder="Jane Mwangi" value={form.name} onChange={e => update('name', e.target.value)} autoComplete="name" />
              </Field>
              <Field label="Email address" icon={Mail}>
                <input type="email" className="input pl-10" required placeholder="jane@example.com" value={form.email} onChange={e => update('email', e.target.value)} autoComplete="email" />
              </Field>
              <Field label={<>Phone <span style={{ color: 'var(--text-3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— for M-Pesa</span></>} icon={Phone}>
                <input type="tel" className="input pl-10" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={e => update('phone', e.target.value)} autoComplete="tel" />
              </Field>
              <button type="submit" className="btn btn-primary btn-lg w-full gap-2" style={{ marginTop: 8 }}>
                Continue <ArrowRight size={16} />
              </button>
            </form>
          </AnimateStep>

          {/* Step 2 */}
          <AnimateStep active={step === 2}>
            <div style={{ marginBottom: 28 }}>
              <button onClick={() => setStep(1)} style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                ← Back
              </button>
              <p style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Step 2 of 2</p>
              <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 4 }}>Secure your account</h2>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Setting up for <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>{form.email}</strong></p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Password" icon={Lock} action={
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }>
                <input type={showPw ? 'text' : 'password'} className="input pl-10 pr-10" required placeholder="Min. 8 characters" value={form.password} onChange={e => update('password', e.target.value)} autoComplete="new-password" />
              </Field>
              {form.password.length > 0 && <PasswordStrength password={form.password} />}
              <Field label="Confirm password" icon={Lock}>
                <input type={showPw ? 'text' : 'password'} className="input pl-10" required placeholder="Repeat password" value={form.confirm} onChange={e => update('confirm', e.target.value)} autoComplete="new-password" />
              </Field>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 13px', background: 'var(--surface)', borderRadius: 'var(--r-md)' }}>
                <Sparkles size={13} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.55 }}>
                  KES 10/day fine on overdue borrows. Books must be returned in good condition.
                </p>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full gap-2" style={{ marginTop: 4 }}>
                {loading ? <><span className="spinner" /> Creating…</> : <><Check size={15} /> Create my account</>}
              </button>
            </form>
          </AnimateStep>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 22 }}>
            Already a member?{' '}
            <Link href="/login" style={{ color: 'var(--gold)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}