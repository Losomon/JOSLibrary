'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Plus, Search, RefreshCw, CheckCircle,
  AlertCircle, Clock, ArrowRight, Filter, Sparkles,
  BookMarked, Library, User, Edit, Trash2, X
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatKES, formatDate, daysUntil } from '@/lib/utils-client'
import type { Book, BorrowRecord } from '@/lib/types'

type Tab = 'books' | 'borrows' | 'overdue'

export default function LibrarianDashboardPage() {
  const [tab,        setTab]        = useState<Tab>('books')
  const [books,      setBooks]      = useState<Book[]>([])
  const [borrows,    setBorrows]    = useState<BorrowRecord[]>([])
  const [overdue,    setOverdue]    = useState<BorrowRecord[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [showAddBook, setShowAddBook] = useState(false)
  const [stats,      setStats]      = useState({ total: 0, available: 0, borrowed: 0, overdue: 0 })

  // Load data
  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [booksRes, borrowsRes, overdueRes] = await Promise.all([
        fetch('/api/books?limit=50').then(r => r.json()),
        fetch('/api/borrows').then(r => r.json()),
        fetch('/api/borrows?status=overdue').then(r => r.json()),
      ])
      const bookList = booksRes.data?.data ?? []
      const borrowList = borrowsRes.data ?? []
      const overdueList = overdueRes.data ?? []

      setBooks(bookList)
      setBorrows(borrowList)
      setOverdue(overdueList)
      setStats({
        total:     bookList.length,
        available: bookList.filter((b: Book) => b.available).length,
        borrowed:  borrowList.filter((b: BorrowRecord) => b.status === 'active').length,
        overdue:   borrowList.filter((b: BorrowRecord) => b.status === 'overdue').length,
      })
    } catch { toast.error('Failed to load data') }
    finally  { setLoading(false) }
  }

  async function markReturned(borrowId: string, bookTitle: string) {
    const res = await fetch(`/api/borrows/${borrowId}/return`, { method: 'PATCH' })
    const json = await res.json()
    if (res.ok) {
      toast.success(json.message ?? `"${bookTitle}" returned`)
      fetchAll()
    } else {
      toast.error(json.error ?? 'Failed to mark returned')
    }
  }

  const filteredBooks = books.filter(b =>
    !search ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  )

  const activeBorrows = borrows.filter(b => b.status === 'active' || b.status === 'overdue')
  const overdueBorrows = borrows.filter(b => b.status === 'overdue')

  return (
    <div className="min-h-screen bg-[var(--bg)]">

      {/* Top bar */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="container">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Library size={16} className="text-[var(--gold)]" />
              <span className="text-[12px] text-[var(--text-3)] uppercase tracking-widest">Librarian console</span>
            </div>
            <button
              onClick={() => setShowAddBook(true)}
              className="btn btn-primary btn-sm gap-1.5"
            >
              <Plus size={13} /> Add book
            </button>
          </div>
        </div>
      </div>

      <div className="container py-8">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <p className="text-[11px] text-[var(--gold)] uppercase tracking-widest mb-1.5">Librarian workspace</p>
          <h1 style={{ fontFamily: 'var(--font-display)' }}>Library management</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
          {[
            { icon: BookMarked, label: 'Total books',     value: stats.total,     color: 'text-[var(--text-2)]' },
            { icon: CheckCircle, label: 'Available now',  value: stats.available, color: 'text-[var(--teal)]' },
            { icon: BookOpen,   label: 'Out on loan',     value: stats.borrowed,  color: 'text-[var(--gold)]' },
            { icon: AlertCircle, label: 'Overdue',        value: stats.overdue,   color: stats.overdue > 0 ? 'text-[var(--rust)]' : 'text-[var(--text-3)]' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="stat-card animate-fade-up">
              <div className="mb-3"><Icon size={16} className={color} /></div>
              <div className="stat-value">{loading ? '—' : value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Overdue alert */}
        {overdueBorrows.length > 0 && (
          <div className="mb-6 flex items-center gap-3 bg-[var(--rust)]/10 border border-[var(--rust)]/20 rounded-[var(--r-md)] px-5 py-3">
            <AlertCircle size={16} className="text-[var(--rust)] shrink-0" />
            <p className="text-[13px] text-[var(--rust)] flex-1">
              {overdueBorrows.length} borrow{overdueBorrows.length > 1 ? 's are' : ' is'} overdue. Fines are accruing at KES 10/day.
            </p>
            <button onClick={() => setTab('overdue')} className="text-[12px] text-[var(--rust)] underline underline-offset-2">
              View all →
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--surface)] rounded-[var(--r-lg)] mb-6 w-fit">
          {([
            { id: 'books',   label: 'Books',          count: stats.total },
            { id: 'borrows', label: 'Active borrows', count: stats.borrowed },
            { id: 'overdue', label: 'Overdue',        count: stats.overdue },
          ] as { id: Tab; label: string; count: number }[]).map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 rounded-[10px] text-[13px] transition-all',
                tab === id
                  ? 'bg-[var(--bg)] text-[var(--text)] font-medium shadow-sm'
                  : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
              )}
            >
              {label}
              {count > 0 && (
                <span className={cn(
                  'badge text-[10px]',
                  id === 'overdue' && count > 0 ? 'badge-rust' : 'badge-neutral'
                )}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Books */}
        {tab === 'books' && (
          <div>
            {/* Search + filter bar */}
            <div className="flex gap-3 mb-5">
              <div className="search-bar flex-1 max-w-md">
                <Search size={14} className="search-icon" />
                <input
                  className="input"
                  placeholder="Search books by title or author…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="absolute right-3 text-[var(--text-3)]" onClick={() => setSearch('')}>
                    <X size={13} />
                  </button>
                )}
              </div>
              <button onClick={fetchAll} className="btn btn-ghost btn-sm btn-icon" title="Refresh">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Books table */}
            <div className="card overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--cream-2)]">
                    <th className="text-left px-4 py-3 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Book</th>
                    <th className="text-left px-4 py-3 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium hidden md:table-cell">Genres</th>
                    <th className="text-center px-4 py-3 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Copies</th>
                    <th className="text-center px-4 py-3 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Price</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-[var(--border)]">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="skeleton h-4 rounded w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[var(--text-3)]">
                        No books found
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book) => (
                      <tr key={book.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--cream-2)] transition-colors group">
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--text)] leading-snug">{book.title}</p>
                          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{book.author}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {book.genres?.slice(0, 2).map(g => (
                              <span key={g} className="badge badge-neutral text-[10px]">{g}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn(
                            'text-[13px] font-medium',
                            book.current_copies === 0 ? 'text-[var(--rust)]' :
                            book.current_copies <= 2 ? 'text-[var(--gold)]' : 'text-[var(--text-2)]'
                          )}>
                            {book.current_copies}/{book.total_copies}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`badge text-[10px] ${book.available ? 'badge-teal' : 'badge-rust'}`}>
                            {book.available ? 'Available' : 'All out'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-2)]">
                          {book.is_for_sale ? formatKES(book.price) : <span className="text-[var(--text-3)]">Borrow only</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/books/${book.id}`} className="btn btn-ghost btn-sm btn-icon" title="View">
                              <BookOpen size={13} />
                            </Link>
                            <Link href={`/librarian/books/${book.id}/edit`} className="btn btn-ghost btn-sm btn-icon" title="Edit">
                              <Edit size={13} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Active Borrows */}
        {tab === 'borrows' && (
          <div className="flex flex-col gap-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-4 h-20 skeleton" />
              ))
            ) : activeBorrows.length === 0 ? (
              <div className="text-center py-16 text-[var(--text-3)]">No active borrows</div>
            ) : (
              activeBorrows.map((borrow: any) => {
                const daysLeft = daysUntil(borrow.due_date)
                const isOverdue = daysLeft < 0
                return (
                  <div
                    key={borrow.id}
                    className={cn(
                      'card p-4 flex items-center gap-4',
                      isOverdue && 'border-[var(--rust)]/30 bg-[var(--rust)]/5'
                    )}
                  >
                    <div className="w-10 h-10 rounded-[6px] bg-[var(--surface)] flex items-center justify-center shrink-0">
                      <BookOpen size={16} className={isOverdue ? 'text-[var(--rust)]' : 'text-[var(--text-3)]'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[var(--text)] truncate">{borrow.book?.title}</p>
                      <p className="text-[12px] text-[var(--text-3)] mt-0.5 flex items-center gap-2">
                        <User size={10} /> {borrow.user?.full_name ?? 'Unknown member'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[13px] font-medium ${isOverdue ? 'text-[var(--rust)]' : daysLeft <= 3 ? 'text-[var(--gold)]' : 'text-[var(--text-2)]'}`}>
                        {isOverdue
                          ? `${Math.abs(daysLeft)}d overdue • Fine: ${formatKES(Math.abs(daysLeft) * 10)}`
                          : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
                        }
                      </p>
                      <p className="text-[11px] text-[var(--text-3)]">Due {formatDate(borrow.due_date, { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <button
                      onClick={() => markReturned(borrow.id, borrow.book?.title ?? '')}
                      className={cn(
                        'btn btn-sm gap-1.5 shrink-0',
                        isOverdue ? 'btn-danger' : 'btn-ghost'
                      )}
                    >
                      <CheckCircle size={13} /> Return
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Tab: Overdue */}
        {tab === 'overdue' && (
          <div className="flex flex-col gap-3">
            {overdueBorrows.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle size={32} className="text-[var(--teal)] mx-auto mb-3" />
                <p className="text-[var(--text-3)]">No overdue borrows — great!</p>
              </div>
            ) : (
              overdueBorrows.map((borrow: any) => {
                const daysOverdue = Math.abs(daysUntil(borrow.due_date))
                const fine = daysOverdue * 10
                return (
                  <div key={borrow.id} className="card border-[var(--rust)]/25 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[6px] bg-[var(--rust)]/10 flex items-center justify-center shrink-0">
                      <AlertCircle size={16} className="text-[var(--rust)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[var(--text)] truncate">{borrow.book?.title}</p>
                      <p className="text-[12px] text-[var(--text-3)] mt-0.5">{borrow.user?.full_name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-semibold text-[var(--rust)]">{daysOverdue} days overdue</p>
                      <p className="text-[12px] text-[var(--rust)]/70">Fine: {formatKES(fine)}</p>
                    </div>
                    <button
                      onClick={() => markReturned(borrow.id, borrow.book?.title ?? '')}
                      className="btn btn-danger btn-sm gap-1.5 shrink-0"
                    >
                      <CheckCircle size={13} /> Mark returned
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Add Book modal */}
      <AnimatePresence>
        {showAddBook && (
          <AddBookModal onClose={() => setShowAddBook(false)} onSuccess={() => { setShowAddBook(false); fetchAll() }} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD BOOK MODAL
// ─────────────────────────────────────────────────────────────────────────────

function AddBookModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: '', author: '', isbn: '', description: '',
    price: '', total_copies: '5', stock_quantity: '10',
    is_for_sale: true, genres: '',
  })
  const [loading, setLoading] = useState(false)

  function update(key: string, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/books', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:         form.title,
          author:        form.author,
          isbn:          form.isbn || undefined,
          description:   form.description || undefined,
          price:         parseFloat(form.price) || 0,
          total_copies:  parseInt(form.total_copies) || 5,
          current_copies: parseInt(form.total_copies) || 5,
          stock_quantity: parseInt(form.stock_quantity) || 10,
          is_for_sale:   form.is_for_sale,
          genres:        form.genres ? form.genres.split(',').map(g => g.trim()).filter(Boolean) : [],
          available:     true,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        toast.success(`"${form.title}" added! AI is generating tags…`)
        onSuccess()
      } else {
        toast.error(json.error ?? 'Failed to add book')
      }
    } catch { toast.error('Network error') }
    finally { setLoading(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[var(--ink)]/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 20, scale: .97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: .97 }}
        className="card card-raised w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)' }}>Add new book</h3>
            <p className="text-[12px] text-[var(--text-3)] mt-0.5 flex items-center gap-1.5">
              <Sparkles size={11} className="text-[var(--gold)]" /> AI will auto-generate tags and summary
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-icon"><X size={14} /></button>
        </div>

        <form onSubmit={submit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Title *</label>
              <input className="input" required value={form.title} onChange={e => update('title', e.target.value)} placeholder="Book title" />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Author *</label>
              <input className="input" required value={form.author} onChange={e => update('author', e.target.value)} placeholder="Author name" />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">ISBN</label>
              <input className="input" value={form.isbn} onChange={e => update('isbn', e.target.value)} placeholder="978-…" />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Description</label>
              <textarea className="input h-20 py-2 resize-none" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Short description…" />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Genres</label>
              <input className="input" value={form.genres} onChange={e => update('genres', e.target.value)} placeholder="Fiction, Sci-fi, …" />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Price (KES)</label>
              <input className="input" type="number" min="0" value={form.price} onChange={e => update('price', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Library copies</label>
              <input className="input" type="number" min="1" value={form.total_copies} onChange={e => update('total_copies', e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Sale stock</label>
              <input className="input" type="number" min="0" value={form.stock_quantity} onChange={e => update('stock_quantity', e.target.value)} />
            </div>
            <div className="col-span-2 flex items-center gap-3 p-3 bg-[var(--surface)] rounded-[var(--r-md)]">
              <input
                type="checkbox"
                id="is_for_sale"
                checked={form.is_for_sale}
                onChange={e => update('is_for_sale', e.target.checked)}
                className="w-4 h-4 accent-[var(--gold)]"
              />
              <label htmlFor="is_for_sale" className="text-[13px] text-[var(--text-2)] cursor-pointer">
                Available for purchase (customers can buy)
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1 gap-2">
              {loading ? <><span className="spinner" /> Adding…</> : <><Plus size={14} /> Add book</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}