'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
  agreeTerms?: string
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    membershipType: 'Standard — Free (5 books/month)',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  })
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
    
    if (msg.includes('weak password')) {
      return 'Password is too weak. Please use a stronger password.'
    }
    if (msg.includes('already registered') || msg.includes('user already')) {
      return 'An account with this email already exists. Please sign in instead.'
    }
    if (msg.includes('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.'
    }
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Network error. Please check your connection and try again.'
    }
    return error.message || 'Something went wrong. Please try again.'
  }

  // Form validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          membership_type: formData.membershipType
        },
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    })

    setLoading(false)

    if (error) {
      const msg = getErrorMessage(error)
      toast.error(msg)
      
      if (msg.includes('already exists')) {
        // Redirect to login after a moment
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } else {
      toast.success('Account created! Please check your email to confirm your account.')
      router.push('/login?registered=true')
    }
  }

  return (
    <>
      <div className="tab-strip">
        <Link href="/login" className="tab-btn">Sign In</Link>
        <Link href="/register" className="tab-btn active">Register</Link>
      </div>

      <div className="membership-badge">✦ Free Membership</div>
      <h1 className="form-heading">Join Bibliotheca.</h1>
      <p className="form-subhead">
        Create your member account to borrow books, reserve titles, 
        and explore our digital collections.
      </p>

      <form onSubmit={handleRegister}>
        <div className="row-2">
          <div className="field-group">
            <label className="field-label">First Name</label>
            <div className="field-wrap">
              <span className="field-icon">◈</span>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Jane"
                className={errors.firstName ? 'error' : ''}
                required
              />
            </div>
            {errors.firstName && <span className="field-error">{errors.firstName}</span>}
          </div>

          <div className="field-group">
            <label className="field-label">Last Name</label>
            <div className="field-wrap">
              <span className="field-icon">◈</span>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Austen"
                className={errors.lastName ? 'error' : ''}
                required
              />
            </div>
            {errors.lastName && <span className="field-error">{errors.lastName}</span>}
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Email Address</label>
          <div className="field-wrap">
            <span className="field-icon">✉</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={errors.email ? 'error' : ''}
              required
            />
          </div>
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="field-group">
          <label className="field-label">Phone Number</label>
          <div className="field-wrap">
            <span className="field-icon">◎</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254 700 000 000"
            />
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Membership Type</label>
          <div className="field-wrap">
            <span className="field-icon">✦</span>
            <select
              name="membershipType"
              value={formData.membershipType}
              onChange={handleChange}
            >
              <option>Standard — Free (5 books/month)</option>
              <option>Scholar — Ksh 500/yr (15 books + digital)</option>
              <option>Patron — Ksh 1,200/yr (Unlimited + events)</option>
            </select>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Password</label>
          <div className="field-wrap">
            <span className="field-icon">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
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

        <div className="field-group">
          <label className="field-label">Confirm Password</label>
          <div className="field-wrap">
            <span className="field-icon">🔒</span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={errors.confirmPassword ? 'error' : ''}
              required
            />
            <button
              type="button"
              className="pass-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
        </div>

        <div className="terms-check">
          <input
            type="checkbox"
            name="agreeTerms"
            id="terms"
            checked={formData.agreeTerms}
            onChange={handleChange}
          />
          <label className="terms-text" htmlFor="terms">
            I agree to Bibliotheca's <a href="#">Borrowing Terms</a> and{' '}
            <a href="#">Privacy Policy</a>. I understand that a library card 
            will be issued upon registration.
          </label>
        </div>
        {errors.agreeTerms && <span className="field-error">{errors.agreeTerms}</span>}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create My Account'}
        </button>
      </form>

      <div className="switch-text">
        Already a member?{' '}
        <Link href="/login" className="switch-link">
          Sign in here
        </Link>
      </div>
    </>
  )
}