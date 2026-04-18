'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'

interface FormErrors {
  email?: string
  password?: string
}

export default function LoginPage() {
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const supabase = createClient()
  const router = useRouter()

  // Email validation
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Error message handler
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

  // Form validation
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

  // Handle password login
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
      router.push('/dashboard')
      router.refresh()
    }
    
    setLoading(false)
  }

  // Handle magic link login
  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    
    setLoading(true)
    setErrors({})

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
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

  // Handle Google login
  const handleGoogle = async () => {
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (error) {
      toast.error('Failed to sign in with Google. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="tab-strip">
        <Link href="/login" className="tab-btn active">Sign In</Link>
        <Link href="/register" className="tab-btn">Register</Link>
      </div>

      <h1 className="form-heading">Welcome back.</h1>
      <p className="form-subhead">
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

      <div className="switch-text">
        New member?{' '}
        <Link href="/register" className="switch-link">
          Register here
        </Link>
      </div>
    </>
  )
}