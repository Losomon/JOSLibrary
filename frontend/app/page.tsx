import Link from 'next/link'
import { Sparkles, BookOpen, ShoppingCart, ArrowRight, Star, Users, BookMarked } from 'lucide-react'
import { Navbar } from '@/components/ui/Navbar'
import { createServerClient } from '@/lib/supabase'
import { BookCard } from '@/components/books/BookCard'
import type { Book } from '@/lib/types'
import { AiChatWidget } from '@/components/ai/AiChatWidget'

async function getFeaturedBooks(): Promise<Book[]> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('books')
    .select('*')
    .order('purchase_count', { ascending: false })
    .limit(8)
  return (data ?? []) as Book[]
}

async function getStats() {
  const supabase = await createServerClient()
  const [books, borrows, orders] = await Promise.all([
    supabase.from('books').select('id', { count: 'exact', head: true }),
    supabase.from('borrows').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
  ])
  return {
    books:   books.count ?? 0,
    borrows: borrows.count ?? 0,
    orders:  orders.count ?? 0,
  }
}

export default async function HomePage() {
  const [featured, stats] = await Promise.all([getFeaturedBooks(), getStats()])

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">

        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  0deg, var(--ink) 0px, var(--ink) 1px, transparent 1px, transparent 40px
                ), repeating-linear-gradient(
                  90deg, var(--ink) 0px, var(--ink) 1px, transparent 1px, transparent 40px
                )`,
              }}
            />
            <div
              className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
              style={{ background: 'var(--gold)' }}
            />
          </div>

          <div className="container relative z-10 py-24">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-6 animate-fade-up">
                <span className="badge badge-gold text-[12px] px-3 py-1">
                  <Sparkles size={11} /> AI-Powered Library
                </span>
              </div>

              <h1
                className="animate-fade-up mb-6"
                style={{ animationDelay: '.05s', fontFamily: 'var(--font-display)' }}
              >
                Where books meet<br />
                <em className="not-italic" style={{ color: 'var(--gold)' }}>intelligence.</em>
              </h1>

              <p
                className="text-[17px] text-[var(--text-2)] max-w-xl leading-relaxed mb-10 animate-fade-up"
                style={{ animationDelay: '.1s' }}
              >
                Borrow, buy, and discover books with an AI librarian that learns your taste.
                Physical books, delivered to your door across Nairobi.
              </p>

              <div
                className="flex flex-wrap items-center gap-3 mb-14 animate-fade-up"
                style={{ animationDelay: '.15s' }}
              >
                <Link href="/books" className="btn btn-primary btn-lg gap-2">
                  Browse catalog <ArrowRight size={16} />
                </Link>
                <Link href="/register" className="btn btn-ghost btn-lg">
                  Join free
                </Link>
              </div>

              <div
                className="animate-fade-up max-w-xl"
                style={{ animationDelay: '.2s' }}
              >
                <p className="text-[11px] text-[var(--text-3)] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Sparkles size={11} className="text-[var(--gold)]" /> AI natural language search
                </p>
                <form action="/books" className="flex gap-2">
                  <div className="search-bar flex-1">
                    <Sparkles size={15} className="search-icon text-[var(--gold)]" />
                    <input
                      name="q"
                      className="input pl-10 bg-[var(--bg)] border-[var(--border)]"
                      placeholder='Try "African sci-fi under 400 KES"…'
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Search</button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--surface)]">
          <div className="container py-8">
            <div className="grid grid-cols-3 divide-x divide-[var(--border)]">
              {[
                { icon: BookMarked, value: stats.books, label: 'Books in catalog' },
                { icon: BookOpen,   value: stats.borrows, label: 'Books borrowed' },
                { icon: ShoppingCart, value: stats.orders, label: 'Orders fulfilled' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex flex-col items-center py-6 gap-1">
                  <Icon size={20} className="text-[var(--gold)] mb-1" />
                  <span
                    style={{ fontFamily: 'var(--font-display)' }}
                    className="text-3xl font-bold text-[var(--text)]"
                  >
                    {value.toLocaleString()}
                  </span>
                  <span className="text-[12px] text-[var(--text-3)] uppercase tracking-wide">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {featured.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-[11px] text-[var(--gold)] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Star size={11} /> Most popular
                  </p>
                  <h2>Featured titles</h2>
                </div>
                <Link href="/books" className="btn btn-ghost btn-sm gap-1">
                  View all <ArrowRight size={13} />
                </Link>
              </div>
              <div className="book-grid stagger">
                {featured.map((book) => (
                  <div key={book.id} className="animate-fade-up">
                    <BookCard book={book} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section bg-[var(--surface)] border-y border-[var(--border)]">
          <div className="container">
            <div className="text-center mb-14">
              <h2 className="mb-3">Built for readers in Nairobi</h2>
              <p className="text-[var(--text-2)] max-w-md mx-auto">
                The first library system with a real AI librarian - not just search filters.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 stagger">
              {[
                {
                  icon: Sparkles,
                  title: 'AI librarian',
                  body: 'Chat with our AI to discover books, get reading lists, and find exactly what you need - in plain language.',
                },
                {
                  icon: BookOpen,
                  title: 'Borrow & buy',
                  body: 'Borrow for 14 days or buy to keep. Pay with M-Pesa or card. Books delivered across Nairobi for KES 150.',
                },
                {
                  icon: Users,
                  title: 'For every reader',
                  body: 'Members, librarians, and admins each get a tailored view. Role-based access that just works.',
                },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="card p-6 animate-fade-up hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-[var(--r-md)] bg-[var(--gold-dim)] flex items-center justify-center mb-4">
                    <Icon size={18} className="text-[var(--gold-light)]" />
                  </div>
                  <h3 className="text-[16px] mb-2" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
                  <p className="text-[13px] text-[var(--text-2)] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="relative card overflow-hidden p-12 text-center">
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, var(--gold) 0%, transparent 70%)`,
                }}
              />
              <p className="text-[11px] text-[var(--gold)] uppercase tracking-widest mb-4">Get started today</p>
              <h2 className="mb-4">Your next great read is waiting.</h2>
              <p className="text-[var(--text-2)] mb-8 max-w-md mx-auto">
                Join free. Borrow immediately. Buy with M-Pesa. Delivered to your door.
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Link href="/register" className="btn btn-primary btn-lg">Create free account</Link>
                <Link href="/books" className="btn btn-ghost btn-lg">Browse first</Link>
              </div>
            </div>
          </div>
        </section>

        <AiChatWidget />

        <footer className="border-t border-[var(--border)] py-8">
          <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[4px] bg-[var(--gold)] flex items-center justify-center">
                <BookOpen size={12} className="text-[var(--ink)]" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)' }} className="text-[14px] font-medium">JOS Library</span>
            </div>
            <p className="text-[12px] text-[var(--text-3)]">
              &copy; {new Date().getFullYear()} JOS Library - Nairobi, Kenya
            </p>
            <div className="flex gap-4">
              {['Books', 'Borrow', 'Orders', 'Login'].map((l) => (
                <Link key={l} href={`/${l.toLowerCase()}`} className="text-[12px] text-[var(--text-3)] hover:text-[var(--text)] transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}