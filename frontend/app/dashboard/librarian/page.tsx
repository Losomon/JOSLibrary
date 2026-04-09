'use client'

import { useState, useEffect, useCallback } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, BookOpen, Clock, AlertTriangle, RefreshCw, Search, X, Loader2, Sparkles, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatKES } from '@/lib/utils-client'
import type { Book, BorrowRecord } from '@/lib/types'

type Tab = 'books' | 'active' | 'overdue'

interface BookFormData {
  title: string
  author: string
  isbn: string
  genres: string
  description: string
  total_copies: string
  price: string
  is_for_sale: boolean
}

const emptyForm: BookFormData = {
  title: '',
  author: '',
  isbn: '',
  genres: '',
  description: '',
  total_copies: '1',
  price: '',
  is_for_sale: false,
}

export default function LibrarianDashboard() {
  const [tab, setTab] = useState<Tab>('books')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [books, setBooks] = useState<Book[]>([])
  const [activeBorrows, setActiveBorrows] = useState<BorrowRecord[]>([])
  const [overdueBorrows, setOverdueBorrows] = useState<BorrowRecord[]>([])
  
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<BookFormData>(emptyForm)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [booksRes, activeRes, overdueRes] = await Promise.all([
        fetch('/api/books?limit=100'),
        fetch('/api/borrows?status=active'),
        fetch('/api/borrows?status=overdue'),
      ])
      
      const booksJson = await booksRes.json()
      const activeJson = await activeRes.json()
      const overdueJson = await overdueRes.json()
      
      setBooks(booksJson.data ?? booksJson ?? [])
      setActiveBorrows(activeJson.data ?? activeJson ?? [])
      setOverdueBorrows(overdueJson.data ?? overdueJson ?? [])
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredBooks = books.filter(b => 
    !search || b.title?.toLowerCase().includes(search.toLowerCase()) || 
    b.author?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmitBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const payload = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn || null,
        genres: formData.genres ? formData.genres.split(',').map(g => g.trim()) : null,
        description: formData.description || null,
        total_copies: parseInt(formData.total_copies) || 1,
        current_copies: parseInt(formData.total_copies) || 1,
        price: formData.price ? parseFloat(formData.price) : null,
        is_for_sale: formData.is_for_sale,
      }

      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to create book')
      }

      toast.success('Book added! Auto-tagging in background...')
      setShowModal(false)
      setFormData(emptyForm)
      
      setTimeout(() => {
        fetchData()
      }, 1000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add book')
    } finally {
      setSubmitting(false)
    }
  }

  const stats = [
    { icon: BookOpen, label: 'Total Books', value: books.length, tab: 'books' as Tab },
    { icon: Clock, label: 'Active Borrows', value: activeBorrows.length, tab: 'active' as Tab },
    { icon: AlertTriangle, label: 'Overdue', value: overdueBorrows.length, tab: 'overdue' as Tab, danger: overdueBorrows.length > 0 },
  ]

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] text-[var(--gold)] uppercase tracking-widest mb-2">Librarian dashboard</p>
            <h1 style={{ fontFamily: 'var(--font-display)' }}>Library Management</h1>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary gap-2">
            <Plus size={16} /> Add Book
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map(({ icon: Icon, label, value, tab: targetTab, danger }) => (
            <button
              key={label}
              onClick={() => setTab(targetTab)}
              className={cn(
                'stat-card text-left transition-all',
                tab === targetTab && 'ring-2 ring-[var(--gold)]',
                danger && value > 0 && 'ring-2 ring-[var(--rust)]'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon size={16} className={danger ? 'text-[var(--rust)]' : 'text-[var(--gold)]'} />
              </div>
              <div className={cn('stat-value', danger && 'text-[var(--rust)]')}>{value}</div>
              <div className="stat-label">{label}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="search-bar max-w-md">
            <span className="search-icon text-[var(--text-3)]">
              <Search size={15} />
            </span>
            <input
              className="input"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="absolute right-3 text-[var(--text-3)]" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="card p-8 flex items-center justify-center">
            <Loader2 className="spinner" size={24} />
          </div>
        ) : tab === 'books' ? (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--cream-2)]">
                  <th className="text-left p-4 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Title</th>
                  <th className="text-left p-4 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Author</th>
                  <th className="text-left p-4 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Genre</th>
                  <th className="text-left p-4 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Copies</th>
                  <th className="text-left p-4 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Price</th>
                  <th className="text-left p-4 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[var(--text-3)]">
                      {search ? 'No books match your search' : 'No books yet'}
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => (
                    <tr key={book.id} className="border-b border-[var(--border)] hover:bg-[var(--cream-2)] transition-colors">
                      <td className="p-4">
                        <p className="text-[14px] font-medium">{book.title}</p>
                      </td>
                      <td className="p-4 text-[13px] text-[var(--text-2)]">{book.author}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {book.genres?.slice(0, 2).map((g) => (
                            <span key={g} className="badge badge-neutral text-[10px]">{g}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-[13px]">
                        <span className={cn(book.current_copies === 0 && 'text-[var(--rust)]')}>
                          {book.current_copies ?? 0}/{book.total_copies ?? 0}
                        </span>
                      </td>
                      <td className="p-4 text-[13px]">
                        {book.is_for_sale ? formatKES(book.price ?? 0) : '—'}
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          'badge text-[10px]',
                          book.available ? 'badge-teal' : 'badge-rust'
                        )}>
                          {book.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--cream-2)]">
                  <th className="text-left p-4 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">User</th>
                  <th className="text-left p-4 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Book</th>
                  <th className="text-left p-4 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Due Date</th>
                  <th className="text-left p-4 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Fine</th>
                </tr>
              </thead>
              <tbody>
                {(tab === 'active' ? activeBorrows : overdueBorrows).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-[var(--text-3)]">
                      No {tab === 'active' ? 'active' : 'overdue'} borrows
                    </td>
                  </tr>
                ) : (
                  (tab === 'active' ? activeBorrows : overdueBorrows).map((borrow) => {
                    const book = borrow.book as Book
                    return (
                      <tr key={borrow.id} className="border-b border-[var(--border)]">
                        <td className="p-4 text-[13px]">{borrow.user_id.slice(0, 8)}...</td>
                        <td className="p-4 text-[13px] font-medium">{book?.title}</td>
                        <td className="p-4 text-[13px]">
                          {new Date(borrow.due_date).toLocaleDateString('en-KE')}
                        </td>
                        <td className="p-4">
                          {borrow.fine_amount && borrow.fine_amount > 0 ? (
                            <span className="badge badge-rust">{formatKES(borrow.fine_amount)}</span>
                          ) : (
                            <span className="text-[var(--text-3)]">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Book Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-[var(--bg)] rounded-[var(--r-xl)] shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto m-4">
              <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Add New Book</h2>
                <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmitBook} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Title *</label>
                    <input
                      required
                      className="input"
                      value={formData.title}
                      onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                      placeholder="Book title"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Author *</label>
                    <input
                      required
                      className="input"
                      value={formData.author}
                      onChange={(e) => setFormData(f => ({ ...f, author: e.target.value }))}
                      placeholder="Author name"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">ISBN</label>
                    <input
                      className="input"
                      value={formData.isbn}
                      onChange={(e) => setFormData(f => ({ ...f, isbn: e.target.value }))}
                      placeholder="ISBN"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Genres (comma separated)</label>
                    <input
                      className="input"
                      value={formData.genres}
                      onChange={(e) => setFormData(f => ({ ...f, genres: e.target.value }))}
                      placeholder="Fiction, Romance, Sci-fi"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Description</label>
                    <textarea
                      className="input min-h-[80px] py-2"
                      value={formData.description}
                      onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                      placeholder="Book description..."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Total Copies *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      className="input"
                      value={formData.total_copies}
                      onChange={(e) => setFormData(f => ({ ...f, total_copies: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--text-3)] uppercase tracking-wide mb-1.5">Price (KES)</label>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      value={formData.price}
                      onChange={(e) => setFormData(f => ({ ...f, price: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_for_sale}
                        onChange={(e) => setFormData(f => ({ ...f, is_for_sale: e.target.checked }))}
                        className="w-4 h-4 rounded border-[var(--border)]"
                      />
                      <span className="text-[14px]">Available for sale</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary flex-1 gap-2">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    Add Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}