'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { SlidersHorizontal, Sparkles, X, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/ui/Navbar'
import { BookCard, BookCardSkeleton } from '@/components/books/BookCard'
import { cn, formatKES } from '@/lib/utils-client'
import type { Book } from '@/lib/types'

const GENRES = ['Fiction', 'Non-fiction', 'Sci-fi', 'Romance', 'Mystery', 'Biography', 'Self-help', 'History', 'Technology', 'Philosophy']

function BooksContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [books,    setBooks]    = useState<Book[]>([])
  const [loading,  setLoading]  = useState(true)
  const [aiMode,   setAiMode]   = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage]         = useState(1)
  const [hasMore, setHasMore]   = useState(false)
  const [total, setTotal]       = useState(0)

  const [filters, setFilters] = useState({
    search:      searchParams.get('q') ?? '',
    genre:       searchParams.get('genre') ?? '',
    is_for_sale: searchParams.get('for_sale') ?? '',
    available:   searchParams.get('available') ?? '',
    min_price:   searchParams.get('min') ?? '',
    max_price:   searchParams.get('max') ?? '',
  })

  const fetchBooks = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(pageNum))
      params.set('limit', '24')
      if (filters.search && !aiMode)    params.set('search', filters.search)
      if (filters.genre)                params.set('genre', filters.genre)
      if (filters.is_for_sale)          params.set('is_for_sale', filters.is_for_sale)
      if (filters.available)            params.set('available', filters.available)
      if (filters.min_price)            params.set('min_price', filters.min_price)
      if (filters.max_price)            params.set('max_price', filters.max_price)

      let endpoint = `/api/books?${params}`
      let data: Book[] = []
      let tot = 0

      if (aiMode && filters.search) {
        const res  = await fetch('/api/ai/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: filters.search }) })
        const json = await res.json()
        data = json.books ?? []
        tot  = data.length
      } else {
        const res  = await fetch(endpoint)
        const json = await res.json()
        data = json.data ?? []
        tot  = json.pagination?.total ?? 0
        setHasMore(json.pagination?.has_next ?? false)
      }

      setTotal(tot)
      setBooks((prev) => append ? [...prev, ...data] : data)
    } catch {
      toast.error('Failed to load books')
    } finally {
      setLoading(false)
    }
  }, [filters, aiMode])

  useEffect(() => {
    setPage(1)
    fetchBooks(1, false)
  }, [filters, aiMode])

  function handleFilterChange(key: string, value: string) {
    setFilters((f) => ({ ...f, [key]: value }))
  }

  function clearFilters() {
    setFilters({ search: '', genre: '', is_for_sale: '', available: '', min_price: '', max_price: '' })
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16">
        <div className="container py-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="mb-1">Book catalog</h1>
            <p className="text-[var(--text-3)] text-[14px]">{total.toLocaleString()} titles available</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiMode((v) => !v)}
              className={cn('btn btn-sm gap-1.5', aiMode ? 'btn-primary' : 'btn-ghost')}
            >
              <Sparkles size={13} /> AI search
            </button>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn('btn btn-ghost btn-sm gap-1.5', activeFilterCount > 0 && 'border-[var(--gold)] text-[var(--gold)]')}
            >
              <SlidersHorizontal size={13} />
              Filters
              {activeFilterCount > 0 && (
                <span className="badge badge-gold text-[10px] ml-0.5">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="search-bar max-w-xl">
            {aiMode
              ? <Sparkles size={15} className="search-icon text-[var(--gold)]" />
              : <span className="search-icon text-[var(--text-3)]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </span>
            }
            <input
              className="input"
              placeholder={aiMode ? 'Ask anything — "mystery books under 600 KES by African authors"' : 'Search by title, author…'}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBooks(1)}
            />
            {filters.search && (
              <button className="absolute right-3 text-[var(--text-3)] hover:text-[var(--text)]" onClick={() => handleFilterChange('search', '')}>
                <X size={14} />
              </button>
            )}
          </div>
          {aiMode && (
            <p className="text-[11px] text-[var(--gold)] mt-2 flex items-center gap-1.5">
              <Sparkles size={10} /> AI will parse your query and find matching books
            </p>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="card p-5 mb-6"
          >
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Genre */}
              <div>
                <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Genre</label>
                <select
                  className="input text-[13px]"
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                >
                  <option value="">All genres</option>
                  {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Type</label>
                <select
                  className="input text-[13px]"
                  value={filters.is_for_sale}
                  onChange={(e) => handleFilterChange('is_for_sale', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="true">For sale</option>
                  <option value="false">Borrow only</option>
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Availability</label>
                <select
                  className="input text-[13px]"
                  value={filters.available}
                  onChange={(e) => handleFilterChange('available', e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="true">Available now</option>
                </select>
              </div>

              {/* Price range */}
              <div>
                <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Max price (KES)</label>
                <input
                  type="number"
                  className="input text-[13px]"
                  placeholder="e.g. 500"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                />
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="btn btn-ghost btn-sm mt-4 gap-1 text-[var(--rust)]">
                <X size={12} /> Clear all filters
              </button>
            )}
          </motion.div>
        )}

        {/* Genre pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => handleFilterChange('genre', filters.genre === g ? '' : g)}
              className={cn(
                'badge cursor-pointer transition-all text-[11px]',
                filters.genre === g ? 'badge-gold' : 'badge-neutral hover:badge-gold'
              )}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Book grid */}
        {loading && books.length === 0 ? (
          <div className="book-grid">
            {Array.from({ length: 12 }).map((_, i) => <BookCardSkeleton key={i} />)}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[var(--text-3)] mb-4">No books found</p>
            <button onClick={clearFilters} className="btn btn-ghost btn-sm">Clear filters</button>
          </div>
        ) : (
          <>
            <div className="book-grid stagger">
              {books.map((book) => (
                <div key={book.id} className="animate-fade-up">
                  <BookCard
                    book={book}
                    onAddToCart={async (b) => {
                      const res = await fetch('/api/carts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ book_id: b.id, quantity: 1 }) })
                      if (res.ok) toast.success(`"${b.title}" added to cart`)
                      else toast.error('Failed to add to cart — are you signed in?')
                    }}
                    onBorrow={async (b) => {
                      const res = await fetch('/api/borrows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ book_id: b.id, due_date: new Date(Date.now() + 14 * 86400000).toISOString() }) })
                      if (res.ok) toast.success(`"${b.title}" borrowed! Due in 14 days.`)
                      else { const j = await res.json(); toast.error(j.error ?? 'Failed to borrow') }
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => { const next = page + 1; setPage(next); fetchBooks(next, true) }}
                  disabled={loading}
                  className="btn btn-ghost gap-2"
                >
                  {loading ? <><span className="spinner" /> Loading…</> : <><RefreshCw size={14} /> Load more</>}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </>
  )
}

export default function BooksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-16"><div className="container py-8"><div className="book-grid">{Array.from({length:12}).map((_,i)=><BookCardSkeleton key={i}/>)}</div></div></div>}>
      <BooksContent />
    </Suspense>
  )
}
