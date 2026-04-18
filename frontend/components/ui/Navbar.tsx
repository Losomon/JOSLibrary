'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Search, ShoppingCart, User, Menu, X,
  LogOut, LayoutDashboard, Library, ChevronDown,
  Sparkles, Bell, Sun, Moon
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils-client'
import type { UserProfile } from '@/lib/types'

interface NavbarProps {
  profile?: UserProfile | null
  cartCount?: number
}

export function Navbar({ profile, cartCount = 0 }: NavbarProps) {
  const pathname   = usePathname()
  const router     = useRouter()
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [userOpen, setUserOpen]       = useState(false)
  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled]       = useState(false)
  const [isDark, setIsDark] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // Theme sync
  useEffect(() => {
    const root = window.document.documentElement
    const isDarkMode = root.classList.contains('dark')
    setIsDark(isDarkMode)

    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'))
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  function toggleTheme() {
    const root = window.document.documentElement
    root.classList.toggle('dark')
    const newIsDark = root.classList.contains('dark')
    setIsDark(newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/books?q=${encodeURIComponent(searchQuery.trim())}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  const navLinks = [
    { href: '/books',      label: 'Catalog' },
    { href: '/borrows',    label: 'Borrow' },
    { href: '/orders',     label: 'Orders' },
  ]

  const isLibrarian = profile?.role === 'librarian' || profile?.role === 'admin'
  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="container">
          <nav className="flex items-center h-16 gap-6">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-[6px] bg-[var(--gold)] flex items-center justify-center shadow-sm group-hover:shadow-gold transition-shadow duration-300">
                <BookOpen size={16} className="text-[var(--ink)]" />
              </div>
              <span
                style={{ fontFamily: 'var(--font-display)' }}
                className="text-[17px] font-semibold text-[var(--text)] tracking-tight leading-none"
              >
                Bibliotheca<span className="text-[var(--gold)]">.</span>Library
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'nav-link px-3 py-1.5 rounded-[var(--r-md)] transition-colors',
                    pathname?.startsWith(l.href) && 'active bg-[var(--surface)]'
                  )}
                >
                  {l.label}
                </Link>
              ))}
              {isLibrarian && (
                <Link
                  href="/librarian"
                  className={cn(
                    'nav-link px-3 py-1.5 rounded-[var(--r-md)] transition-colors',
                    pathname?.startsWith('/librarian') && 'active bg-[var(--surface)]'
                  )}
                >
                  Librarian
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    'nav-link px-3 py-1.5 rounded-[var(--r-md)] transition-colors text-[var(--gold)]',
                    pathname?.startsWith('/admin') && 'bg-[var(--surface)]'
                  )}
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto">

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="btn btn-ghost btn-sm btn-icon p-1 hidden md:inline-flex"
                title={isDark ? 'Light mode' : 'Dark mode'}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
              </button>

              {/* AI Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="btn btn-ghost btn-sm btn-icon hidden md:inline-flex"
                title="AI Search"
              >
                <Search size={16} />
              </button>

              {/* Cart */}
              {profile && (
                <Link href="/cart" className="relative btn btn-ghost btn-sm btn-icon">
                  <ShoppingCart size={16} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--gold)] text-[var(--ink)] text-[10px] font-bold flex items-center justify-center leading-none">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User menu */}
              {profile ? (
                <div className="relative">
                  <button
                    onClick={() => setUserOpen((v) => !v)}
                    className="flex items-center gap-2 btn btn-ghost btn-sm px-2.5"
                  >
                    <div className="w-6 h-6 rounded-full bg-[var(--gold)] flex items-center justify-center text-[var(--ink)] text-[11px] font-bold">
                      {(profile.full_name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown size={12} className={cn('transition-transform', userOpen && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {userOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: .96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: .96 }}
                        transition={{ duration: .15 }}
                        className="absolute right-0 top-full mt-2 w-52 card card-raised py-1 z-50"
                        onMouseLeave={() => setUserOpen(false)}
                      >
                        <div className="px-3 py-2 border-b border-[var(--border)]">
                          <p className="text-[13px] font-medium text-[var(--text)] truncate">{profile.full_name}</p>
                          <p className="text-[11px] text-[var(--text-3)] capitalize">{profile.role}</p>
                        </div>
                        <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text-2)] hover:bg-[var(--cream-2)] hover:text-[var(--text)] transition-colors" onClick={() => setUserOpen(false)}>
                          <LayoutDashboard size={14} /> Dashboard
                        </Link>
                        <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text-2)] hover:bg-[var(--cream-2)] hover:text-[var(--text)] transition-colors" onClick={() => setUserOpen(false)}>
                          <User size={14} /> Profile
                        </Link>
                        <Link href="/borrows" className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text-2)] hover:bg-[var(--cream-2)] hover:text-[var(--text)] transition-colors" onClick={() => setUserOpen(false)}>
                          <Library size={14} /> My Borrows
                        </Link>
                        <div className="border-t border-[var(--border)] mt-1 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--rust)] hover:bg-[var(--cream-2)] w-full text-left transition-colors"
                          >
                            <LogOut size={14} /> Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
                  <Link href="/register" className="btn btn-primary btn-sm">Join free</Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="btn btn-ghost btn-sm btn-icon md:hidden"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: .2 }}
              className="md:hidden overflow-hidden border-t border-[var(--border)] bg-[var(--bg)]"
            >
              <div className="container py-4 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <Link key={l.href} href={l.href} className="nav-link px-3 py-2.5 rounded-[var(--r-md)] hover:bg-[var(--surface)] block" onClick={() => setMobileOpen(false)}>
                    {l.label}
                  </Link>
                ))}
                <form onSubmit={handleSearch} className="mt-2">
                  <div className="search-bar">
                    <Search size={16} className="search-icon" />
                    <input
                      className="input"
                      placeholder="Search books..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* AI Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[var(--ink)]/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, scale: .96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -20, scale: .96 }}
              className="card card-raised w-full max-w-2xl overflow-visible"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-3 p-4">
                <Sparkles size={18} className="text-[var(--gold)] shrink-0" />
                <input
                  ref={searchRef}
                  className="flex-1 bg-transparent border-none outline-none text-[var(--text)] text-[15px] placeholder:text-[var(--text-3)]"
                  placeholder='Try "sci-fi books under 500 KES available to borrow"…'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">Search</button>
                <button type="button" onClick={() => setSearchOpen(false)} className="btn btn-ghost btn-sm btn-icon">
                  <X size={14} />
                </button>
              </form>
              <div className="px-4 pb-3 flex flex-wrap gap-2">
                {['sci-fi under 500 KES', 'African authors', 'available to borrow', 'bestselling novels'].map((q) => (
                  <button
                    key={q}
                    className="badge badge-neutral hover:badge-gold transition-colors cursor-pointer text-[11px]"
                    onClick={() => { setSearchQuery(q); searchRef.current?.focus() }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

