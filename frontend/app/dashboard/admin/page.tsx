'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

// SVG Icons
const Icons = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Members: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Catalogue: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Transactions: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10h18M6 14h4M13 14h4M3 6h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />
    </svg>
  ),
  Overdue: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Fines: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 7H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Reservations: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
    </svg>
  ),
  Acquisitions: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Staff: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Reports: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  AILogs: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a10 10 0 0 1 10 10c0 4.5-3 8-7 9v-4" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v4M12 18v4" />
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.07.09a10 10 0 0 0 14.66 0z" />
    </svg>
  ),
  Edit: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3l4 4-7 7H10v-4l7-7z" />
    </svg>
  ),
  Suspend: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Reinstate: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-9-9" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Fine: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
    </svg>
  ),
  Notify: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Export: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Logout: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Alert: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Close: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  DarkMode: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  LightMode: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
    </svg>
  ),
}

// Types remain the same
interface Member {
  id: string
  name: string
  cardNo: string
  type: 'Standard' | 'Scholar' | 'Patron'
  booksOut: string
  status: 'Active' | 'Overdue' | 'Suspended'
  fine?: number
}

interface OverdueBook {
  id: string
  title: string
  author: string
  memberId: string
  dueDate: string
  daysOverdue: number
  fine: number
}

interface Activity {
  id: string
  type: 'borrow' | 'overdue' | 'renew' | 'register' | 'payment'
  memberId: string
  memberName: string
  bookTitle?: string
  amount?: number
  time: string
  color: string
}

interface Alert {
  id: string
  type: 'danger' | 'warning' | 'info'
  icon: string
  title: string
  message: string
  action: string
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')
  const [currentTime, setCurrentTime] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showMemberModal, setShowMemberModal] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  // Stats Data
  const [stats] = useState({
    totalMembers: 12847,
    membersGrowth: '+124 this month',
    booksInCirculation: 3421,
    totalBooks: 84210,
    overdueItems: 47,
    overdueChange: '↑ 8 from last week',
    finesOutstanding: 28540,
    fineAccounts: 89,
    aiQueriesToday: 1284,
    aiResponseTime: 'avg 2.3s response'
  })

  // Members Data
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'Jane Austen', cardNo: 'LIB-004821', type: 'Standard', booksOut: '3/5', status: 'Active' },
    { id: '2', name: 'Kofi Mensah', cardNo: 'LIB-003341', type: 'Scholar', booksOut: '8/15', status: 'Active' },
    { id: '3', name: 'Amina Wanjiku', cardNo: 'LIB-007712', type: 'Patron', booksOut: '2/∞', status: 'Overdue', fine: 300 },
    { id: '4', name: 'David Ochieng', cardNo: 'LIB-001198', type: 'Standard', booksOut: '5/5', status: 'Suspended' },
    { id: '5', name: 'Grace Njeri', cardNo: 'LIB-009003', type: 'Scholar', booksOut: '1/15', status: 'Active' },
  ])

  // Overdue Books
  const [overdueBooks] = useState<OverdueBook[]>([
    { id: '1', title: 'Arrow of God', author: 'Chinua Achebe', memberId: 'LIB-007712', dueDate: 'Mar 18, 2026', daysOverdue: 30, fine: 300 },
    { id: '2', title: 'Weep Not, Child', author: 'Ngũgĩ wa Thiong\'o', memberId: 'LIB-002234', dueDate: 'Mar 28, 2026', daysOverdue: 20, fine: 200 },
    { id: '3', title: 'Wizard of the Crow', author: 'Ngũgĩ wa Thiong\'o', memberId: 'LIB-005567', dueDate: 'Apr 5, 2026', daysOverdue: 12, fine: 120 },
  ])

  // Activities Feed
  const [activities] = useState<Activity[]>([
    { id: '1', type: 'borrow', memberId: 'LIB-004821', memberName: 'Jane Austen', bookTitle: 'Things Fall Apart', time: '2m ago', color: 'var(--green)' },
    { id: '2', type: 'overdue', memberId: 'LIB-007712', memberName: 'Amina Wanjiku', time: '14m ago', color: 'var(--red)' },
    { id: '3', type: 'renew', memberId: 'LIB-003341', memberName: 'Kofi Mensah', bookTitle: '3 books', time: '31m ago', color: 'var(--gold)' },
    { id: '4', type: 'register', memberId: 'LIB-009003', memberName: 'Grace Njeri', time: '1h ago', color: 'var(--blue)' },
    { id: '5', type: 'payment', memberId: 'LIB-001198', memberName: 'David Ochieng', amount: 340, time: '2h ago', color: 'var(--amber)' },
  ])

  // Alerts
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', type: 'danger', icon: '🔴', title: '47 overdue books', message: '12 accounts exceed 30 days. Auto-suspend pending.', action: 'Review' },
    { id: '2', type: 'warning', icon: '🟡', title: 'Catalogue sync', message: '234 new acquisitions pending classification by librarian staff.', action: 'Assign' },
    { id: '3', type: 'info', icon: '🔵', title: 'AI Usage spike', message: 'Public AI assistant hit 92% capacity at 14:00 today. Consider scaling.', action: 'View Logs' },
  ])

  // Chart Data
  const [chartData] = useState([
    { day: 'Mon', value: 82 },
    { day: 'Tue', value: 110 },
    { day: 'Wed', value: 95 },
    { day: 'Thu', value: 143 },
    { day: 'Fri', value: 127 },
    { day: 'Sat', value: 68 },
    { day: 'Sun', value: 41 },
  ])

  // Fine Breakdown
  const [fineBreakdown] = useState([
    { type: 'Standard Members', amount: 18200, percentage: 64, color: 'var(--amber)' },
    { type: 'Scholar Members', amount: 7890, percentage: 28, color: 'var(--blue)' },
    { type: 'Patron Members', amount: 2450, percentage: 9, color: 'var(--gold)' },
  ])

  // Authentication Check
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login?redirect=/dashboard/admin')
        return
      }
      
      const userRole = user.user_metadata?.role
      if (userRole !== 'admin') {
        toast.error('Access denied. Admin only.')
        router.push('/dashboard')
        return
      }
      
      setUser(user)
      setLoading(false)
    }
    
    checkAdmin()
  }, [])

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-GB', { hour12: false }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Dark Mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.body.classList.add('dark-mode')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
      toast.success('Dark mode enabled')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
      toast.success('Light mode enabled')
    }
  }

  // Actions
  const handleExportReport = () => {
    toast.success('Export started. Downloading report...')
    setShowExportModal(false)
  }

  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
    toast.success('Alert dismissed')
  }

  const handleDismissAllAlerts = () => {
    setAlerts([])
    toast.success('All alerts dismissed')
  }

  const handleSendBulkNotice = () => {
    toast.success('Bulk overdue notices sent to affected members')
  }

  const handleNotifyMember = (memberId: string, bookTitle: string) => {
    toast.info(`Notification sent to ${memberId} about "${bookTitle}"`)
  }

  const handleSuspendMember = (member: Member) => {
    toast.warning(`${member.name} has been suspended`)
    setMembers(prev => prev.map(m => 
      m.id === member.id ? { ...m, status: 'Suspended' } : m
    ))
  }

  const handleReinstateMember = (member: Member) => {
    toast.success(`${member.name} has been reinstated`)
    setMembers(prev => prev.map(m => 
      m.id === member.id ? { ...m, status: 'Active' } : m
    ))
  }

  const handleFineMember = (member: Member) => {
    toast.info(`Fine of Ksh ${member.fine || 100} added to ${member.name}'s account`)
  }

  const handleViewMember = (member: Member) => {
    setSelectedMember(member)
    setShowMemberModal(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  // Get status pill color
  const getStatusPill = (status: string) => {
    switch(status) {
      case 'Active': return 'pill-g'
      case 'Overdue': return 'pill-r'
      case 'Suspended': return 'pill-a'
      default: return 'pill-b'
    }
  }

  // Get member type pill
  const getTypePill = (type: string) => {
    switch(type) {
      case 'Standard': return 'pill-b'
      case 'Scholar': return 'pill-g'
      case 'Patron': return 'pill-a'
      default: return 'pill-b'
    }
  }

  // Get alert class
  const getAlertClass = (type: string) => {
    switch(type) {
      case 'danger': return 'alert-r'
      case 'warning': return 'alert-a'
      case 'info': return 'alert-b'
      default: return 'alert-b'
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Top Navigation Bar */}
      <div className="page-nav">
        <a href="#" className="current">
          <Icons.Dashboard /> Admin
        </a>
        <a href="/dashboard/librarian">
          <Icons.Catalogue /> Librarian
        </a>
        <a href="/dashboard">
          <Icons.Dashboard /> Public
        </a>
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? <Icons.LightMode /> : <Icons.DarkMode />}
        </button>
      </div>

      {/* Sidebar */}
      <nav className="admin-sidebar">
        <div className="sb-head">
          <div className="sb-logo">BIBLIOTHECA</div>
          <div className="sb-role">// Admin Control Panel</div>
        </div>

        <div className="sb-sec">
          <div className="sb-sec-lbl">Core</div>
          <div className={`sb-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage('dashboard')}>
            <Icons.Dashboard /> Dashboard
          </div>
          <div className="sb-item" onClick={() => setActivePage('members')}>
            <Icons.Members /> Members 
            <span className="sb-badge badge-amber">{stats.totalMembers.toLocaleString()}</span>
          </div>
          <div className="sb-item" onClick={() => setActivePage('catalogue')}>
            <Icons.Catalogue /> Catalogue 
            <span className="sb-badge badge-amber">{stats.totalBooks.toLocaleString()}</span>
          </div>
          <div className="sb-item" onClick={() => setActivePage('transactions')}>
            <Icons.Transactions /> Transactions
          </div>
        </div>

        <div className="sb-sec">
          <div className="sb-sec-lbl">Operations</div>
          <div className="sb-item" onClick={() => setActivePage('overdue')}>
            <Icons.Overdue /> Overdue 
            <span className="sb-badge badge-red">{stats.overdueItems}</span>
          </div>
          <div className="sb-item" onClick={() => setActivePage('fines')}>
            <Icons.Fines /> Fines 
            <span className="sb-badge badge-red">Ksh {stats.finesOutstanding.toLocaleString()}</span>
          </div>
          <div className="sb-item" onClick={() => setActivePage('reservations')}>
            <Icons.Reservations /> Reservations
          </div>
          <div className="sb-item" onClick={() => setActivePage('acquisitions')}>
            <Icons.Acquisitions /> Acquisitions
          </div>
        </div>

        <div className="sb-sec">
          <div className="sb-sec-lbl">System</div>
          <div className="sb-item" onClick={() => setActivePage('staff')}>
            <Icons.Staff /> Staff Mgmt
          </div>
          <div className="sb-item" onClick={() => setActivePage('reports')}>
            <Icons.Reports /> Reports
          </div>
          <div className="sb-item" onClick={() => setActivePage('ai-logs')}>
            <Icons.AILogs /> AI Logs
          </div>
          <div className="sb-item" onClick={() => setActivePage('settings')}>
            <Icons.Settings /> Settings
          </div>
        </div>

        <div className="sb-bottom">
          <div className="admin-tag">
            <div className="admin-dot"></div>
            <div className="admin-name">Admin · {user?.email?.split('@')[0] || 'Dr. Mwangi'}</div>
            <button className="logout-btn" onClick={handleLogout}>
              <Icons.Logout />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="admin-main">
        <div className="topbar">
          <div className="tb-title">System Dashboard</div>
          <div className="tb-time">{currentTime}</div>
          <button className="tb-btn" onClick={() => setShowExportModal(true)}>
            <Icons.Export /> Export Report
          </button>
          <button className="tb-btn danger" onClick={() => toast.info(`${alerts.length} active alerts`)}>
            <Icons.Alert /> {alerts.length} Alerts
          </button>
        </div>

        <div className="admin-content">
          {/* Stats Strip - Same as before */}
          <div className="stat-strip">
            <div className="stat-box g">
              <div className="stat-lbl">Total Members</div>
              <div className="stat-num gold">{stats.totalMembers.toLocaleString()}</div>
              <div className="stat-change">{stats.membersGrowth}</div>
            </div>
            <div className="stat-box gr">
              <div className="stat-lbl">Books in Circulation</div>
              <div className="stat-num green">{stats.booksInCirculation.toLocaleString()}</div>
              <div className="stat-change">of {stats.totalBooks.toLocaleString()} total</div>
            </div>
            <div className="stat-box r">
              <div className="stat-lbl">Overdue Items</div>
              <div className="stat-num red">{stats.overdueItems}</div>
              <div className="stat-change">{stats.overdueChange}</div>
            </div>
            <div className="stat-box a">
              <div className="stat-lbl">Fines Outstanding</div>
              <div className="stat-num amber">{stats.finesOutstanding.toLocaleString()}</div>
              <div className="stat-change">Ksh · {stats.fineAccounts} accounts</div>
            </div>
            <div className="stat-box b">
              <div className="stat-lbl">AI Queries Today</div>
              <div className="stat-num blue">{stats.aiQueriesToday.toLocaleString()}</div>
              <div className="stat-change">{stats.aiResponseTime}</div>
            </div>
          </div>

          {/* Alerts Panel */}
          {alerts.length > 0 && (
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">
                  <Icons.Alert /> Active System Alerts
                </div>
                <button className="panel-action" onClick={handleDismissAllAlerts}>Dismiss All</button>
              </div>
              <div className="panel-body">
                {alerts.map(alert => (
                  <div key={alert.id} className={`alert-item ${getAlertClass(alert.type)}`}>
                    <span className="alert-icon">{alert.icon}</span>
                    <div className="alert-text">
                      <strong>{alert.title}</strong> — {alert.message}
                    </div>
                    <button className="act-btn" onClick={() => handleDismissAlert(alert.id)}>{alert.action}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Row - Members Table */}
          <div className="row row-main">
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Recent Member Activity</div>
                <button className="panel-action" onClick={() => setActivePage('members')}>View All Members →</button>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Member</th><th>Card No.</th><th>Type</th><th>Books Out</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.id}>
                      <td><strong>{member.name}</strong></td>
                      <td className="mono">{member.cardNo}</td>
                      <td><span className={`pill ${getTypePill(member.type)}`}>{member.type}</span></td>
                      <td className="mono">{member.booksOut}</td>
                      <td><span className={`pill ${getStatusPill(member.status)}`}>{member.status}</span></td>
                      <td>
                        <button className="act-btn" onClick={() => handleViewMember(member)}>
                          <Icons.Edit /> View
                        </button>
                        {member.status !== 'Suspended' ? (
                          <button className="act-btn warn" onClick={() => handleSuspendMember(member)}>
                            <Icons.Suspend /> Suspend
                          </button>
                        ) : (
                          <button className="act-btn" onClick={() => handleReinstateMember(member)}>
                            <Icons.Reinstate /> Reinstate
                          </button>
                        )}
                        {member.status === 'Overdue' && (
                          <button className="act-btn warn" onClick={() => handleFineMember(member)}>
                            <Icons.Fine /> Fine
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right Side Panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Activity Feed */}
              <div className="panel">
                <div className="panel-head">
                  <div className="panel-title">Live Activity Feed</div>
                </div>
                <div className="panel-body" style={{ padding: '0.8rem 1.2rem' }}>
                  {activities.map(activity => (
                    <div key={activity.id} className="feed-item">
                      <div className="feed-dot" style={{ background: activity.color }}></div>
                      <div className="feed-text">
                        <strong>{activity.memberId}</strong> 
                        {activity.type === 'borrow' && ` borrowed ${activity.bookTitle}`}
                        {activity.type === 'overdue' && ` overdue notice sent`}
                        {activity.type === 'renew' && ` renewed ${activity.bookTitle}`}
                        {activity.type === 'register' && ` registered`}
                        {activity.type === 'payment' && ` paid Ksh ${activity.amount}`}
                      </div>
                      <div className="feed-time">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Borrowing Chart */}
              <div className="panel">
                <div className="panel-head">
                  <div className="panel-title">Borrowing — Last 7 Days</div>
                </div>
                <div className="panel-body">
                  <div className="chart-bars">
                    {chartData.map((item, idx) => {
                      const maxValue = Math.max(...chartData.map(d => d.value))
                      const height = Math.round((item.value / maxValue) * 70)
                      const colors = ['var(--gold)', 'var(--green)', 'var(--blue)', 'var(--gold)', 'var(--amber)', 'var(--blue)', 'var(--text3)']
                      return (
                        <div key={idx} className="bar-col">
                          <div className="bar-fill" style={{ height: `${height}px`, background: colors[idx] }}></div>
                          <div className="bar-label">{item.day}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Fine Breakdown */}
              <div className="panel">
                <div className="panel-head">
                  <div className="panel-title">Outstanding Fines</div>
                </div>
                <div className="panel-body">
                  {fineBreakdown.map((fine, idx) => (
                    <div key={idx} className="fine-bar-wrap">
                      <div className="fine-bar-top">
                        <span>{fine.type}</span>
                        <span>Ksh {fine.amount.toLocaleString()}</span>
                      </div>
                      <div className="fine-bar">
                        <div className="fine-bar-fill" style={{ width: `${fine.percentage}%`, background: fine.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Overdue Books Section */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Overdue Books — Immediate Action Required</div>
              <button className="panel-action" onClick={handleSendBulkNotice}>
                <Icons.Notify /> Send Bulk Notice
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Book Title</th><th>Author</th><th>Member</th><th>Due Date</th><th>Days Overdue</th><th>Fine (Ksh)</th><th>Action</th></tr>
              </thead>
              <tbody>
                {overdueBooks.map(book => (
                  <tr key={book.id}>
                    <td><strong>{book.title}</strong></td>
                    <td>{book.author}</td>
                    <td className="mono">{book.memberId}</td>
                    <td className="mono">{book.dueDate}</td>
                    <td><span className={`pill ${book.daysOverdue > 25 ? 'pill-r' : 'pill-a'}`}>{book.daysOverdue} days</span></td>
                    <td className="mono" style={{ color: 'var(--red)' }}>{book.fine}</td>
                    <td>
                      <button className="act-btn warn" onClick={() => handleNotifyMember(book.memberId, book.title)}>
                        <Icons.Notify /> Notify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Export Report</h2>
              <button className="modal-close" onClick={() => setShowExportModal(false)}>
                <Icons.Close />
              </button>
            </div>
            <div className="modal-body">
              <p>Select report type:</p>
              <div className="export-options">
                <button className="export-option" onClick={handleExportReport}>
                  <Icons.Reports /> Member Activity Report
                </button>
                <button className="export-option" onClick={handleExportReport}>
                  <Icons.Catalogue /> Circulation Report
                </button>
                <button className="export-option" onClick={handleExportReport}>
                  <Icons.Fines /> Financial Summary
                </button>
                <button className="export-option" onClick={handleExportReport}>
                  <Icons.Overdue /> Overdue Items Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {showMemberModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedMember.name}</h2>
              <button className="modal-close" onClick={() => setShowMemberModal(false)}>
                <Icons.Close />
              </button>
            </div>
            <div className="modal-body">
              <div className="member-detail">
                <p><strong>Card No:</strong> {selectedMember.cardNo}</p>
                <p><strong>Membership Type:</strong> {selectedMember.type}</p>
                <p><strong>Books Borrowed:</strong> {selectedMember.booksOut}</p>
                <p><strong>Status:</strong> {selectedMember.status}</p>
                {selectedMember.fine && <p><strong>Outstanding Fine:</strong> Ksh {selectedMember.fine}</p>}
              </div>
              <div className="modal-actions">
                <button className="modal-btn primary" onClick={() => toast.info(`Editing ${selectedMember.name}`)}>
                  <Icons.Edit /> Edit Member
                </button>
                <button className="modal-btn secondary" onClick={() => setShowMemberModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}