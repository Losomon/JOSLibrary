'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { BookOpen, ShoppingCart, Star, Clock, CheckCircle } from 'lucide-react'
import { cn, formatKES } from '@/lib/utils-client'
import type { Book } from '@/lib/types'

interface BookCardProps {
  book: Book
  onAddToCart?: (book: Book) => void
  onBorrow?: (book: Book) => void
  loading?: boolean
  className?: string
}

export function BookCard({ book, onAddToCart, onBorrow, loading, className }: BookCardProps) {
  const canBorrow  = book.available && book.current_copies > 0
  const canBuy     = book.is_for_sale && book.stock_quantity > 0
  const isLowStock = book.stock_quantity > 0 && book.stock_quantity <= 3

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: .2, ease: 'easeOut' }}
      className={cn('group relative flex flex-col', className)}
    >
      {/* Cover */}
      <Link href={`/books/${book.id}`} className="block relative aspect-[2/3] rounded-[var(--r-md)] overflow-hidden bg-[var(--cream-2)] mb-3">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[var(--cream-2)] to-[var(--cream-3)]">
            <BookOpen size={32} className="text-[var(--text-3)] mb-2" />
            <p
              style={{ fontFamily: 'var(--font-display)' }}
              className="text-[var(--text-2)] text-center text-[13px] font-medium leading-snug line-clamp-3"
            >
              {book.title}
            </p>
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {canBorrow && (
            <span className="badge badge-teal text-[10px]">
              <BookOpen size={9} /> Borrow
            </span>
          )}
          {canBuy && (
            <span className="badge badge-gold text-[10px]">
              <ShoppingCart size={9} /> Buy
            </span>
          )}
        </div>

        {/* Low stock warning */}
        {isLowStock && (
          <div className="absolute bottom-2 left-2 right-2">
            <span className="badge badge-rust text-[10px] w-full justify-center">
              Only {book.stock_quantity} left
            </span>
          </div>
        )}

        {/* Hover overlay with quick actions */}
        <div className="absolute inset-0 bg-[var(--ink)]/0 group-hover:bg-[var(--ink)]/40 transition-all duration-300 flex items-end p-3 gap-2 opacity-0 group-hover:opacity-100">
          {canBorrow && onBorrow && (
            <button
              onClick={(e) => { e.preventDefault(); onBorrow(book) }}
              disabled={loading}
              className="btn btn-sm flex-1 bg-[var(--teal)] text-white border-0 hover:bg-[var(--teal-light)] text-[12px]"
            >
              {loading ? <span className="spinner" /> : <><BookOpen size={12} /> Borrow</>}
            </button>
          )}
          {canBuy && onAddToCart && (
            <button
              onClick={(e) => { e.preventDefault(); onAddToCart(book) }}
              disabled={loading}
              className="btn btn-primary btn-sm flex-1 text-[12px]"
            >
              {loading ? <span className="spinner" /> : <><ShoppingCart size={12} /> Add</>}
            </button>
          )}
        </div>
      </Link>

      {/* Meta */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <Link href={`/books/${book.id}`}>
          <h3
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-[14px] font-medium text-[var(--text)] leading-snug line-clamp-2 hover:text-[var(--gold)] transition-colors"
          >
            {book.title}
          </h3>
        </Link>
        <p className="text-[12px] text-[var(--text-3)] truncate">{book.author}</p>

        {/* Price + copies row */}
        <div className="flex items-center justify-between mt-1.5">
          {book.is_for_sale ? (
            <span
              style={{ fontFamily: 'var(--font-display)' }}
              className="text-[13px] font-semibold text-[var(--gold)]"
            >
              {formatKES(book.price)}
            </span>
          ) : (
            <span className="text-[12px] text-[var(--text-3)]">Borrow only</span>
          )}
          <div className="flex items-center gap-1">
            {canBorrow ? (
              <span className="flex items-center gap-0.5 text-[11px] text-[var(--teal-light)]">
                <CheckCircle size={10} /> {book.current_copies}/{book.total_copies}
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-[11px] text-[var(--text-3)]">
                <Clock size={10} /> Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Genre tags */}
        {book.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {book.genres.slice(0, 2).map((g) => (
              <span key={g} className="badge badge-neutral text-[10px]">{g}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* Skeleton version */
export function BookCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="skeleton aspect-[2/3] rounded-[var(--r-md)]" />
      <div className="flex flex-col gap-2">
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  )
}

