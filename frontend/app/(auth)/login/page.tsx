'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'

interface FormErrors {
  email?: string
  password?: string
}

export default function LoginPage() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.body.style.backgroundColor = '#0f0e0c'
    return () => {
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = ''
    }
  }, [])

  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const supabase = createClient()
  const router = useRouter()

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const getErrorMessage = (error: { code?: string; message?: string }): string => {
    const msg = error.message?.toLowerCase() || ''
    
    if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
      return 'Invalid email or password. Please try again.'
    }
    if (msg.includes('email not confirmed') || msg.includes('confirm')) {
      return 'Please confirm your email first. Check your inbox for the confirmation link.'
    }
    if (msg.includes('rate limit') || msg.includes('too many requests')) {
      return 'Too many attempts. Please wait a moment and try again.'
    }
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Network error. Please check your connection and try again.'
    }
    if (msg.includes('user not found') || msg.includes('no user')) {
      return 'No account found with this email. Create one to get started.'
    }
    return error.message || 'Something went wrong. Please try again.'
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (mode === 'password' && !pw) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    
    setLoading(true)
    setErrors({})

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pw
    })

    if (error) {
      const msg = getErrorMessage(error)
      setErrors({ password: msg })
      toast.error(msg)
    } else {
      toast.success('Welcome back!')
      router.push('/dashboard/member')
      router.refresh()
    }
    
    setLoading(false)
  }

  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    
    setLoading(true)
    setErrors({})

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard/member`
      }
    })

    if (error) {
      const msg = getErrorMessage(error)
      setErrors({ email: msg })
      toast.error(msg)
    } else {
      setSent(true)
      toast.success('Magic link sent! Check your email.')
    }
    
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard/member`
      }
    })

    if (error) {
      toast.error('Failed to sign in with Google. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="bibliotheca-container">
      {/* LEFT PANEL - Decorative side */}
        <div className="left-panel no-overlay" style={{ background: 'transparent' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,14,12,0.7) 0%, rgba(15,14,12,0.6) 50%, rgba(15,14,12,0.7) 100%)', zIndex: 1 }} />

          <img
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&q=80&fit=crop"
            alt="Open book in library"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity:1 , position: 'absolute', inset: 0 }}
          />

        <div className="logo-area" style={{ position: 'relative', zIndex: 3 }}>
          <div className="logo-mark"style={{ color: '#d4a839', borderColor: '#d4a839' }}>B</div>

          <div className="logo-name"style={{ color: '#f5f0e8' }}>Bibliotheca</div>

          <div className="logo-tagline" style={{ color: '#a8a090' }}>City Public Library System</div>
        </div>

        <div className="left-quote" style={{ position: 'relative', zIndex: 3 }}>
          <span className="quote-mark" style={{ color: '#d4a839' }}>"</span>
          <p className="quote-text" style={{ color: '#a8a090' }}>A reader lives a thousand lives before he dies. The man who never reads lives only one.</p>
          <p className="quote-attr" style={{ color: '#605850' }}>— George R.R. Martin</p>
        </div>

        <div className="left-stats" style={{ position: 'relative', zIndex: 3 }}>
          <div className="stat-item">
            <div className="stat-num" style={{ color: '#d4a839' }}>84K</div>
            <div className="stat-label" style={{ color: '#605850' }}>Volumes</div>
          </div>
          <div className="stat-item">
            <div className="stat-num"  style={{ color: '#d4a839' }}>12K</div>
            <div className="stat-label" style={{ color: '#605850' }}>Members</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" style={{ color: '#d4a839' }}>Est. 1892</div>
            <div className="stat-label" style={{ color: '#605850' }}>Founded</div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="right-panel">
        <div className="form-card">
          <div className="tab-strip">
            <Link href="/login" className="tab-btn active">Sign In</Link>
            <Link href="/register" className="tab-btn">Register</Link>
          </div>

          <h1 className="form-heading" style={{ color: '#f5f0e8' }}>Welcome back.</h1>
          <p className="form-subhead" style={{ color: '#a8a090' }}>
            Sign in to access your borrowing history, reserves, and reading lists.
          </p>

          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-btn ${mode === 'password' ? 'active' : ''}`}
              onClick={() => {
                setMode('password')
                setSent(false)
                setErrors({})
              }}
            >
              Password
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'magic' ? 'active' : ''}`}
              onClick={() => {
                setMode('magic')
                setSent(false)
                setErrors({})
              }}
            >
              Magic Link
            </button>
          </div>

          {mode === 'password' ? (
            <form onSubmit={handlePassword}>
              <div className="field-group">
                <label className="field-label">Email Address</label>
                <div className="field-wrap">
                  <span className="field-icon">✉</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setErrors({})
                    }}
                    placeholder="member@email.com"
                    className={errors.email ? 'error' : ''}
                    required
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <div className="field-wrap">
                  <span className="field-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pw}
                    onChange={(e) => {
                      setPw(e.target.value)
                      setErrors({})
                    }}
                    placeholder="••••••••"
                    className={errors.password ? 'error' : ''}
                    required
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <Link href="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Enter the Library'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagic}>
              <div className="field-group">
                <label className="field-label">Email Address</label>
                <div className="field-wrap">
                  <span className="field-icon">✉</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setErrors({})
                      setSent(false)
                    }}
                    placeholder="your@email.com"
                    className={errors.email ? 'error' : ''}
                    disabled={sent}
                    required
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              {sent && (
                <div className="success-message">
                  ✨ Magic link sent! Check your email to sign in.
                </div>
              )}

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading || sent}
              >
                {loading ? 'Sending...' : sent ? 'Link Sent!' : 'Send Magic Link'}
              </button>

              {sent && (
                <button
                  type="button"
                  className="resend-link"
                  onClick={() => setSent(false)}
                >
                  Use different email?
                </button>
              )}
            </form>
          )}

          <div className="divider">or continue with</div>

          <button 
            type="button" 
            className="social-btn"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="switch-text" style={{ color: '#a8a090' }}>
            New member?{' '}
            <Link href="/register" className="switch-link" style={{ color: '#d4a839' }}>
              Register here
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bibliotheca-container {
          min-height: 100vh;
          display: flex;
          background: linear-gradient(135deg, var(--ink2) 0%, var(--ink) 50%, var(--ink2) 100%);
        }

        .left-panel {
          width: 45%;
          min-height: 100vh;
          background: transparent;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 4rem;
          position: relative;
          overflow: hidden;
          border-right: 1px solid rgba(184,134,11,0.15);
        }

        .left-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(ellipse at 20% 80%, rgba(184,134,11,0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(184,134,11,0.02) 0%, transparent 40%);
          pointer-events: none;
          z-index: 2;
        }

        .logo-area {
          margin-bottom: 4rem;
          position: relative;
        }

        .logo-mark {
          width: 56px;
          height: 56px;
          border: 2px solid var(--gold);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 1.8rem;
          color: var(--gold);
          margin-bottom: 1rem;
        }

        .logo-name {
          font-family: var(--font-display);
          font-size: 2rem;
          color: var(--cream);
          letter-spacing: -0.02em;
        }

        .logo-tagline {
          font-size: 0.75rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--text2);
          margin-top: 0.3rem;
        }

        .left-quote {
          max-width: 420px;
          position: relative;
          margin-bottom: 4rem;
        }

        .quote-mark {
          font-family: var(--font-display);
          font-size: 4rem;
          color: var(--text2);
          opacity: 0.3;
          line-height: 0.8;
          display: block;
          margin-bottom: -1rem;
        }

        .quote-text {
          font-size: 1.35rem;
          line-height: 1.6;
          color: var(--text2);
          font-style: italic;
        }

        .quote-attr {
          font-size: 0.9rem;
          color: var(--text2);
          margin-top: 1.2rem;
        }

        .left-stats {
          display: flex;
          gap: 3rem;
          position: relative;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-num {
          font-family: var(--font-display);
          font-size: 1.4rem;
          color: var(--text2);
        }

        .stat-label {
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text2);
        }

        .right-panel {
          width: 55%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: var(--ink2);
        }

        .form-card {
          width: 100%;
          max-width: 420px;
          background: var(--ink2);
          border: 1px solid rgba(212,168,57,0.15);
          border-radius: 12px;
          padding: 2.2rem 2.4rem;
          box-shadow: 0 4px 24px rgba(212,168,57,0.08);
        }

        .tab-strip {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          padding: 0.25rem;
          background: rgba(0,0,0,0.2);
          border-radius: 6px;
        }

        .tab-btn {
          flex: 1;
          padding: 0.65rem 1rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          color: var(--cream-3);
          text-align: center;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          color: var(--ink);
        }

        .tab-btn.active {
          background: var(--gold);
          color: var(--ink2);
        }

        .form-heading {
          font-family: var(--font-display);
          font-size: 1.8rem;
          color: var(--cream);
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .form-subhead {
          font-size: 0.9rem;
          color: var(--text2);
          line-height: 1.5;
          margin-bottom: 1.8rem;
        }

        .mode-toggle {
          display: flex;
          gap: 0.25rem;
          padding: 0.2rem;
          background: rgba(184,134,11,0.1);
          border-radius: 4px;
          margin-bottom: 1.5rem;
        }

        .mode-btn {
          flex: 1;
          padding: 0.5rem;
          border: none;
          background: transparent;
          font-size: 0.78rem;
          color: var(--text2);
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.2s;
        }

        .mode-btn.active {
          background: var(--cream);
          color: var(--text2);
          box-shadow: 0 1px 3px rgba(184,134,11,0.2);
        }

        .field-group {
          margin-bottom: 1.2rem;
        }

        .field-label {
          display: block;
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text2);
          margin-bottom: 0.4rem;
        }

        .field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 0.9rem;
          color: var(--text2);
          font-size: 0.9rem;
          pointer-events: none;
        }

        .field-wrap input,
        .field-wrap select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(26,24,20,0.4)' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2.5rem;
        }

        .field-error {
          display: block;
          font-size: 0.75rem;
          color: var(--rust);
          margin-top: 0.3rem;
        }

        .pass-toggle {
          position: absolute;
          right: 0.6rem;
          background: none;
          border: none;
          font-size: 0.75rem;
          color: var(--text2);
          cursor: pointer;
          padding: 0.25rem 0.5rem;
        }

        .pass-toggle:hover {
          color: var(--text2);
        }

        .forgot-link {
          display: block;
          font-size: 0.8rem;
          color: var(--gold);
          text-decoration: none;
          margin-bottom: 1.5rem;
          text-align: right;
          font-weight: 500;
        }

        .forgot-link:hover {
          color: var(--gold-light);
          text-decoration: underline;
        }

        .submit-btn {
          width: 100%;
          padding: 0.85rem;
          background: var(--gold);
          color: var(--cream);
          border: none;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 1rem;
        }

        .submit-btn:hover:not(:disabled) {
          background: var(--gold-light);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success-message {
          background: rgba(46, 125, 50, 0.1);
          border: 1px solid rgba(46, 125, 50, 0.3);
          color: #2e7d32;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          text-align: center;
          margin-bottom: 1rem;
        }

        .resend-link {
          background: none;
          border: none;
          color: var(--text2);
          font-size: 0.8rem;
          cursor: pointer;
          display: block;
          margin: 0 auto;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--text2);
          font-size: 0.75rem;
          margin: 1.5rem 0;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(184,134,11,0.3);
        }

        .social-btn {
          width: 100%;
          padding: 0.75rem;
          background: var(--cream);
          border: 1px solid rgba(184,134,11,0.4);
          border-radius: 6px;
          color: var(--ink);
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .social-btn:hover:not(:disabled) {
          background: var(--cream-2);
          border-color: var(--text2);
        }

        .social-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .switch-text {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text2);
          margin-top: 1.5rem;
        }

        .switch-link {
          color: var(--text2);
          text-decoration: none;
          font-weight: 500;
        }

        .switch-link:hover {
          text-decoration: underline;
        }

        .field-wrap input::placeholder {
          color: var(--text2);
        }

        .field-wrap input:focus,
        .field-wrap select:focus {
          outline: none;
          border-color: var(--text2);
          box-shadow: 0 0 0 3px rgba(184,134,11,0.1);
        }

        .field-wrap input.error {
          border-color: var(--rust);
          box-shadow: 0 0 0 3px rgba(139,69,19,0.1);
        }

        .field-error {
          display: block;
          font-size: 0.75rem;
          color: var(--rust);
          margin-top: 0.3rem;
        }

        .pass-toggle {
          position: absolute;
          right: 0.6rem;
          background: none;
          border: none;
          font-size: 0.75rem;
          color: rgba(245,240,232,0.35);
          cursor: pointer;
          padding: 0.25rem 0.5rem;
        }

        .pass-toggle:hover {
          color: var(--gold-light);
        }

        .forgot-link {
          display: block;
          font-size: 0.8rem;
          color: var(--gold);
          text-decoration: none;
          margin-bottom: 1.5rem;
          text-align: right;
          font-weight: 500;
        }

        .forgot-link:hover {
          color: var(--gold-light);
          text-decoration: underline;
        }

        .submit-btn {
          width: 100%;
          padding: 0.85rem;
          background: var(--gold);
          color: var(--cream);
          border: none;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 1rem;
        }

        .submit-btn:hover:not(:disabled) {
          background: #c9a227;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success-message {
          background: rgba(46, 125, 50, 0.15);
          border: 1px solid rgba(46, 125, 50, 0.3);
          color: #4ade80;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          text-align: center;
          margin-bottom: 1rem;
        }

        .resend-link {
          background: none;
          border: none;
          color: var(--text2);
          font-size: 0.8rem;
          cursor: pointer;
          display: block;
          margin: 0 auto;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--text2);
          font-size: 0.75rem;
          margin: 1.5rem 0;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(184,134,11,0.3);
        }

        .social-btn {
          width: 100%;
          padding: 0.75rem;
          background: var(--cream);
          border: 1px solid rgba(184,134,11,0.4);
          border-radius: 6px;
          color: var(--ink);
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .social-btn:hover:not(:disabled) {
          background: var(--cream-2);
          border-color: var(--text2);
        }

        .social-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .switch-text {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text2);
          margin-top: 1.5rem;
        }

        .switch-link {
          color: var(--text2);
          text-decoration: none;
          font-weight: 500;
        }

        .switch-link:hover {
          text-decoration: underline;
        }

        body.dark-mode .right-panel,
        body.dark-mode .form-card,
        body.dark-mode .mode-btn.active,
        body.dark-mode .social-btn {
          background: var(--ink);
        }
        body.dark-mode .form-heading,
        body.dark-mode .field-label,
        body.dark-mode .field-icon,
        body.dark-mode .pass-toggle,
        body.dark-mode .switch-text {
          color: var(--cream);
        }
        body.dark-mode .form-subhead,
        body.dark-mode .divider {
          color: var(--cream-3);
        }
        body.dark-mode .quote-text,
        body.dark-mode .quote-attr,
        body.dark-mode .logo-name,
        body.dark-mode .logo-tagline,
        body.dark-mode .stat-label {
          color: var(--cream);
        }
        body.dark-mode .quote-mark,
        body.dark-mode .stat-num {
          color: var(--text2);
        }
        body.dark-mode .mode-btn {
          color: var(--cream-3);
        }
        body.dark-mode .field-wrap input,
        body.dark-mode .field-wrap select {
          background-color: var(--ink);
          color: var(--cream);
        }
        body.dark-mode .forgot-link,
        body.dark-mode .switch-link {
          color: var(--text2);
        }
        body.dark-mode .divider::before,
        body.dark-mode .divider::after {
          background: rgba(212,168,57,0.3);
        }
        body.dark-mode .field-label,
        body.dark-mode .form-subhead,
        body.dark-mode .mode-btn,
        body.dark-mode .tab-btn,
        body.dark-mode .switch-text {
          color: var(--cream-3);
        }
        body.dark-mode .field-icon,
        body.dark-mode .pass-toggle {
          color: var(--cream-3);
        }
      `}</style>
    </div>
  )
}