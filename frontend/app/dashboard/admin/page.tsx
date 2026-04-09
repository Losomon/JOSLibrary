import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, Users, ShoppingBag, TrendingUp, AlertCircle,
  ArrowRight, Package, Clock, CheckCircle, XCircle,
  BarChart3, Activity, Settings
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { formatKES } from '@/lib/utils-client'
import type { UserProfile } from '@/lib/types'

export const metadata = { title: 'Admin Dashboard' }

async function getAdminStats() {
  const supabase = await createServerClient()

  const [
    booksRes, usersRes, ordersRes, borrowsRes,
    revenueRes, overdueRes, pendingRes, deliveriesRes
  ] = await Promise.all([
    supabase.from('books').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
    supabase.from('borrows').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('orders').select('total_amount').eq('status', 'paid'),
    supabase.from('borrows').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('deliveries').select('id', { count: 'exact', head: true }).eq('status', 'preparing'),
  ])

  const totalRevenue = (revenueRes.data ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0)

  return {
    books:         booksRes.count ?? 0,
    users:         usersRes.count ?? 0,
    paidOrders:    ordersRes.count ?? 0,
    activeBorrows: borrowsRes.count ?? 0,
    totalRevenue,
    overdueCount:  overdueRes.count ?? 0,
    pendingOrders: pendingRes.count ?? 0,
    preparingDeliveries: deliveriesRes.count ?? 0,
  }
}

async function getRecentActivity() {
  const supabase = await createServerClient()

  const [recentOrders, recentBorrows, recentUsers] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, total_amount, status, created_at, user:profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(6),

    supabase
      .from('borrows')
      .select('id, status, borrowed_at, due_date, book:books(title), user:profiles(full_name)')
      .order('borrowed_at', { ascending: false })
      .limit(5),

    supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return {
    recentOrders:  recentOrders.data ?? [],
    recentBorrows: recentBorrows.data ?? [],
    recentUsers:   recentUsers.data ?? [],
  }
}

export default async function AdminDashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [stats, activity] = await Promise.all([getAdminStats(), getRecentActivity()])

  return (
    <div className="min-h-screen bg-[var(--bg)]">

      {/* Top bar */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="container">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--teal)] animate-pulse" />
              <span className="text-[12px] text-[var(--text-3)] uppercase tracking-widest">Admin console</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/librarian" className="btn btn-ghost btn-sm gap-1.5 text-[12px]">
                <BookOpen size={12} /> Switch to librarian
              </Link>
              <Link href="/admin/settings" className="btn btn-ghost btn-sm btn-icon">
                <Settings size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <p className="text-[11px] text-[var(--gold)] uppercase tracking-widest mb-1.5">System overview</p>
          <h1 style={{ fontFamily: 'var(--font-display)' }}>Admin dashboard</h1>
        </div>

        {/* Alert row */}
        {(stats.overdueCount > 0 || stats.pendingOrders > 0) && (
          <div className="flex flex-wrap gap-3 mb-8">
            {stats.overdueCount > 0 && (
              <div className="flex items-center gap-2 bg-[var(--rust)]/10 border border-[var(--rust)]/25 text-[var(--rust)] rounded-[var(--r-md)] px-4 py-2.5 text-[13px]">
                <AlertCircle size={14} />
                {stats.overdueCount} overdue borrow{stats.overdueCount > 1 ? 's' : ''}
                <Link href="/admin/borrows?status=overdue" className="underline underline-offset-2 ml-1">Review →</Link>
              </div>
            )}
            {stats.pendingOrders > 0 && (
              <div className="flex items-center gap-2 bg-[var(--gold)]/10 border border-[var(--gold)]/25 text-[var(--gold-dim)] rounded-[var(--r-md)] px-4 py-2.5 text-[13px]">
                <Clock size={14} />
                {stats.pendingOrders} payment{stats.pendingOrders > 1 ? 's' : ''} pending
                <Link href="/admin/orders?status=pending" className="underline underline-offset-2 ml-1">Review →</Link>
              </div>
            )}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
          {[
            { icon: TrendingUp,  label: 'Total revenue',     value: formatKES(stats.totalRevenue), color: 'text-[var(--gold)]',    href: '/admin/orders' },
            { icon: Users,       label: 'Registered users',  value: stats.users.toLocaleString(),  color: 'text-[var(--teal)]',    href: '/admin/users' },
            { icon: BookOpen,    label: 'Books in catalog',  value: stats.books.toLocaleString(),  color: 'text-[var(--text-2)]',  href: '/admin/books' },
            { icon: ShoppingBag, label: 'Paid orders',       value: stats.paidOrders.toLocaleString(), color: 'text-[var(--text-2)]', href: '/admin/orders' },
          ].map(({ icon: Icon, label, value, color, href }) => (
            <Link key={label} href={href} className="stat-card hover:shadow-md transition-shadow block animate-fade-up group">
              <div className="flex items-center justify-between mb-3">
                <Icon size={16} className={color} />
                <ArrowRight size={12} className="text-[var(--text-3)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="stat-value text-[1.6rem]">{value}</div>
              <div className="stat-label">{label}</div>
            </Link>
          ))}
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Active borrows',       value: stats.activeBorrows,         icon: BookOpen,  color: 'badge-teal',    href: '/admin/borrows' },
            { label: 'Overdue borrows',      value: stats.overdueCount,          icon: AlertCircle, color: stats.overdueCount > 0 ? 'badge-rust' : 'badge-neutral', href: '/admin/borrows?status=overdue' },
            { label: 'Preparing deliveries', value: stats.preparingDeliveries,   icon: Package,   color: 'badge-gold',    href: '/admin/deliveries' },
          ].map(({ label, value, icon: Icon, color, href }) => (
            <Link key={label} href={href} className="card p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
              <span className={`badge ${color} gap-1.5`}>
                <Icon size={10} /> {value}
              </span>
              <span className="text-[13px] text-[var(--text-2)]">{label}</span>
            </Link>
          ))}
        </div>

        {/* Activity grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Recent orders */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: 'var(--font-display)' }}>Recent orders</h3>
              <Link href="/admin/orders" className="btn btn-ghost btn-sm gap-1 text-[12px]">All orders <ArrowRight size={11} /></Link>
            </div>
            <div className="card overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--cream-2)]">
                    <th className="text-left px-4 py-2.5 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Order</th>
                    <th className="text-left px-4 py-2.5 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Customer</th>
                    <th className="text-left px-4 py-2.5 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Amount</th>
                    <th className="text-left px-4 py-2.5 text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.recentOrders.map((order: any, i) => (
                    <tr key={order.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--cream-2)] transition-colors">
                      <td className="px-4 py-3 font-mono text-[12px] text-[var(--text-3)]">{order.order_number}</td>
                      <td className="px-4 py-3 text-[var(--text-2)]">{order.user?.full_name ?? 'Unknown'}</td>
                      <td className="px-4 py-3 font-medium text-[var(--text)]">{formatKES(order.total_amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-[10px] ${
                          order.status === 'paid' || order.status === 'delivered' ? 'badge-teal' :
                          order.status === 'pending' ? 'badge-neutral' :
                          order.status === 'cancelled' ? 'badge-rust' : 'badge-gold'
                        }`}>{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">

            {/* Recent users */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontFamily: 'var(--font-display)' }}>New members</h3>
                <Link href="/admin/users" className="btn btn-ghost btn-sm text-[12px]">All <ArrowRight size={11} /></Link>
              </div>
              <div className="flex flex-col gap-2">
                {activity.recentUsers.map((u: any) => (
                  <div key={u.id} className="card p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--gold-dim)] flex items-center justify-center text-[var(--gold)] text-[12px] font-bold shrink-0">
                      {(u.full_name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[var(--text)] truncate">{u.full_name}</p>
                      <p className="text-[11px] text-[var(--text-3)] capitalize">{u.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)' }} className="mb-4">Quick actions</h3>
              <div className="flex flex-col gap-2">
                {[
                  { href: '/admin/books/new',    icon: BookOpen,    label: 'Add new book' },
                  { href: '/admin/users',         icon: Users,       label: 'Manage users' },
                  { href: '/admin/deliveries',    icon: Package,     label: 'Update deliveries' },
                  { href: '/admin/audit',         icon: Activity,    label: 'View audit logs' },
                ].map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href} className="card p-3 flex items-center gap-3 hover:shadow-sm transition-shadow group">
                    <div className="w-7 h-7 rounded-[6px] bg-[var(--surface)] flex items-center justify-center">
                      <Icon size={13} className="text-[var(--text-3)] group-hover:text-[var(--gold)] transition-colors" />
                    </div>
                    <span className="text-[13px] text-[var(--text-2)] group-hover:text-[var(--text)] transition-colors">{label}</span>
                    <ArrowRight size={12} className="ml-auto text-[var(--text-3)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}