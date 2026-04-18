'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

// ============ SVG ICONS ============
const Icons = {
  Queue: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  CheckInOut: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Overdue: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Reservations: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
    </svg>
  ),
  BrowseBooks: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  AddTitle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  EditRecords: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3l4 4-7 7H10v-4l7-7z" />
      <path d="M4 20h16" />
    </svg>
  ),
  NewArrivals: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  MemberLookup: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  IssueCard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  CollectFine: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  CheckOut: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M9 12h6M12 9v6" />
    </svg>
  ),
  Return: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M9 12h6M12 9v6" />
      <path d="M19 12l-4 4-4-4" />
    </svg>
  ),
  Renew: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Fine: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
    </svg>
  ),
  Process: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Classify: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Send: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  DarkMode: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  LightMode: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
    </svg>
  ),
  Close: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
}

// Types
interface Transaction {
  id: string
  memberName: string
  memberCard: string
  bookTitle: string
  bookAuthor: string
  borrowedDate: string
  dueDate: string
  status: 'due-soon' | 'active' | 'overdue'
}

interface ReturnItem {
  id: string
  cardNo: string
  bookTitle: string
  author: string
  memberName: string
  status: 'ontime' | 'overdue' | 'reserved'
  days?: number
  fine?: number
}

interface NewArrival {
  id: string
  title: string
  author: string
  category: string
  copies: number
  spineColor: string
}

export default function LibrarianDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [activePage, setActivePage] = useState('queue')
  const [currentTime, setCurrentTime] = useState('')
  const [memberCard, setMemberCard] = useState('')
  const [bookId, setBookId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // AI Chat State
  const [aiPanelOpen, setAiPanelOpen] = useState(true)
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()
  const router = useRouter()

  // Staff Data
  const staffData = {
    name: 'Ms. Mary Kamau',
    initials: 'MK',
    shift: '08:00 – 16:00'
  }

  // Task Stats
  const [stats] = useState({
    checkoutsToday: 18,
    returnsToday: 11,
    readyPickup: 9,
    overdueItems: 47
  })

  // Transactions Data
  const [transactions] = useState<Transaction[]>([
    { id: '1', memberName: 'Jane Austen', memberCard: 'LIB-004821', bookTitle: 'Things Fall Apart', bookAuthor: 'Chinua Achebe', borrowedDate: 'Apr 15', dueDate: 'Apr 20', status: 'due-soon' },
    { id: '2', memberName: 'Kofi Mensah', memberCard: 'LIB-003341', bookTitle: 'Americanah', bookAuthor: 'Chimamanda Adichie', borrowedDate: 'Apr 10', dueDate: 'May 1', status: 'active' },
    { id: '3', memberName: 'Amina Wanjiku', memberCard: 'LIB-007712', bookTitle: 'Arrow of God', bookAuthor: 'Chinua Achebe', borrowedDate: 'Mar 10', dueDate: 'Mar 31', status: 'overdue' },
  ])

  // Return Queue
  const [returnQueue] = useState<ReturnItem[]>([
    { id: '1', cardNo: 'LIB-002219', bookTitle: 'Weep Not, Child', author: 'Ngũgĩ wa Thiong\'o', memberName: 'Grace Njeri', status: 'ontime' },
    { id: '2', cardNo: 'LIB-005567', bookTitle: 'Season of Migration', author: 'Tayeb Salih', memberName: 'David Ochieng', status: 'overdue', days: 4, fine: 40 },
    { id: '3', cardNo: 'LIB-009003', bookTitle: 'Purple Hibiscus', author: 'Chimamanda Adichie', memberName: 'Pending pickup', status: 'reserved' },
  ])

  // New Arrivals
  const [newArrivals] = useState<NewArrival[]>([
    { id: '1', title: 'The Famished Road', author: 'Ben Okri', category: 'Fiction', copies: 2, spineColor: 'linear-gradient(160deg,#4a2c0a,#7a3010)' },
    { id: '2', title: 'Born a Crime', author: 'Trevor Noah', category: 'Memoir', copies: 1, spineColor: 'linear-gradient(160deg,#1a3a5a,#2a5a8a)' },
    { id: '3', title: 'Homegoing', author: 'Yaa Gyasi', category: 'Fiction', copies: 3, spineColor: 'linear-gradient(160deg,#1a4a2a,#2a6a3a)' },
  ])

  // Authentication Check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login?redirect=/dashboard/librarian')
        return
      }
      
      const userRole = user.user_metadata?.role
      if (userRole !== 'librarian' && userRole !== 'admin') {
        toast.error('Access denied. Librarian only.')
        router.push('/dashboard')
        return
      }
      
      setUser(user)
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  // Live Clock & Date
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-GB', { hour12: false }))
    }
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
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

  // AI Chat Functions
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'bot',
        content: "Good morning, Mary! I'm here to assist with your desk duties. I can look up member records, suggest book classifications, help with reader recommendations, explain policies, or assist with difficult member situations. What do you need?"
      }])
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isAiLoading) return

    const userMessage = inputMessage.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInputMessage('')
    setIsAiLoading(true)

    // Mock AI response (replace with actual API call)
    setTimeout(() => {
      let response = ""
      if (userMessage.toLowerCase().includes('member')) {
        response = "I can help with member lookups. Which member card number would you like me to check? (e.g., LIB-004821 for Jane Austen)"
      } else if (userMessage.toLowerCase().includes('overdue')) {
        response = "There are 47 overdue items currently. The most overdue is 'Arrow of God' (17 days, fine Ksh 170). Would you like to send reminder notices?"
      } else if (userMessage.toLowerCase().includes('classify')) {
        response = "For book classification, I recommend using the Dewey Decimal System. Fiction goes in the 800s. Would you like specific guidance for a particular book?"
      } else {
        response = "I'm here to help with member lookups, book classification, recommendations, library policies, and daily desk operations. What specific assistance do you need?"
      }
      setMessages(prev => [...prev, { role: 'bot', content: response }])
      setIsAiLoading(false)
    }, 1000)
  }

  // Checkout/Return Functions
  const handleCheckout = () => {
    if (!memberCard || !bookId) {
      toast.error('Please enter member card and book details')
      return
    }
    toast.success(`Checked out "${bookId}" to ${memberCard}`)
    setMemberCard('')
    setBookId('')
  }

  const handleReturn = () => {
    if (!bookId) {
      toast.error('Please enter book details to return')
      return
    }
    toast.success(`Return processed for "${bookId}"`)
    setBookId('')
  }

  const handleRenew = (transaction: Transaction) => {
    toast.info(`Renewed "${transaction.bookTitle}" for ${transaction.memberName}`)
  }

  const handleFine = (transaction: Transaction) => {
    toast.info(`Fine added to ${transaction.memberName}'s account`)
  }

  const handleProcessReturn = (item: ReturnItem) => {
    toast.success(`Processed return for "${item.bookTitle}"`)
  }

  const handleClassify = (book: NewArrival) => {
    toast.info(`Opening classification for "${book.title}"`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const getStatusPill = (status: string) => {
    switch(status) {
      case 'due-soon': return <span className="pill psoon">Due Soon</span>
      case 'active': return <span className="pill pok">Active</span>
      case 'overdue': return <span className="pill pdue">Overdue</span>
      default: return null
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="librarian-loading">
        <div className="loading-spinner"></div>
        <p>Loading librarian desk...</p>
      </div>
    )
  }

  return (
    <div className="librarian-dashboard">
      {/* Top Navigation Bar */}
      <div className="page-nav">
        <a href="/dashboard/librarian" className="current">
          <Icons.CheckInOut /> Librarian
        </a>
        <a href="/dashboard">
          <Icons.BrowseBooks /> Public
        </a>
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? <Icons.LightMode /> : <Icons.DarkMode />}
        </button>
      </div>

      {/* Sidebar */}
      <nav className="librarian-sidebar">
        <div className="sb-head">
          <div className="sb-logo">Bibliotheca</div>
          <div className="sb-role">Librarian Desk</div>
          <div className="sb-staff">
            <div className="staff-av">{staffData.initials}</div>
            <div className="staff-info">
              <div className="staff-name">{staffData.name}</div>
              <div className="staff-shift">Shift: {staffData.shift}</div>
            </div>
          </div>
        </div>

        <div className="sb-sec">
          <div className="sb-lbl">Desk</div>
          <div className={`sb-item ${activePage === 'queue' ? 'active' : ''}`} onClick={() => setActivePage('queue')}>
            <Icons.Queue /> Today's Queue
          </div>
          <div className="sb-item" onClick={() => setActivePage('checkinout')}>
            <Icons.CheckInOut /> Check-in / Out <span className="sb-count">{stats.checkoutsToday + stats.returnsToday}</span>
          </div>
          <div className="sb-item" onClick={() => setActivePage('overdue')}>
            <Icons.Overdue /> Overdue Returns <span className="sb-count sb-urgent">{stats.overdueItems}</span>
          </div>
          <div className="sb-item" onClick={() => setActivePage('reservations')}>
            <Icons.Reservations /> Reservations <span className="sb-count">{stats.readyPickup}</span>
          </div>
        </div>

        <div className="sb-sec">
          <div className="sb-lbl">Catalogue</div>
          <div className="sb-item" onClick={() => setActivePage('browse')}>
            <Icons.BrowseBooks /> Browse Books
          </div>
          <div className="sb-item" onClick={() => setActivePage('add')}>
            <Icons.AddTitle /> Add New Title
          </div>
          <div className="sb-item" onClick={() => setActivePage('edit')}>
            <Icons.EditRecords /> Edit Records
          </div>
          <div className="sb-item" onClick={() => setActivePage('arrivals')}>
            <Icons.NewArrivals /> New Arrivals <span className="sb-count">12</span>
          </div>
        </div>

        <div className="sb-sec">
          <div className="sb-lbl">Members</div>
          <div className="sb-item" onClick={() => setActivePage('lookup')}>
            <Icons.MemberLookup /> Member Lookup
          </div>
          <div className="sb-item" onClick={() => setActivePage('card')}>
            <Icons.IssueCard /> Issue Card
          </div>
          <div className="sb-item" onClick={() => setActivePage('fine')}>
            <Icons.CollectFine /> Collect Fine
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="librarian-main">
        <div className="topbar">
          <div>
            <span className="tb-greeting">{getGreeting()}, {staffData.name.split(' ')[1]?.replace(',', '') || 'Mary'}.</span>
            <span className="tb-date">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="search-wrap">
            <span className="search-icon"><Icons.Search /></span>
            <input 
              type="text" 
              placeholder="Search member, book title, ISBN…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="tb-badge warn" onClick={() => setActivePage('overdue')}>
            <Icons.Overdue /> {stats.overdueItems} Overdue
          </button>
          <button className="tb-badge info" onClick={() => setActivePage('arrivals')}>
            <Icons.NewArrivals /> 12 New Arrivals
          </button>
        </div>

        <div className="librarian-content">
          {/* Task Strip */}
          <div className="task-strip">
            <div className="task-card">
              <div className="tc-top"><span className="tc-icon"><Icons.CheckInOut /></span></div>
              <div className="tc-count">{stats.checkoutsToday}</div>
              <div className="tc-label">Check-outs Today</div>
              <div className="tc-bar" style={{ width: '60%', background: 'var(--gold)', opacity: 0.5 }}></div>
            </div>
            <div className="task-card">
              <div className="tc-top"><span className="tc-icon"><Icons.Return /></span></div>
              <div className="tc-count ok">{stats.returnsToday}</div>
              <div className="tc-label">Returns Today</div>
              <div className="tc-bar" style={{ width: '40%', background: 'var(--sage)', opacity: 0.5 }}></div>
            </div>
            <div className="task-card">
              <div className="tc-top"><span className="tc-icon"><Icons.Reservations /></span></div>
              <div className="tc-count" style={{ color: 'var(--blue)' }}>{stats.readyPickup}</div>
              <div className="tc-label">Ready for Pickup</div>
              <div className="tc-bar" style={{ width: '35%', background: 'var(--blue)', opacity: 0.5 }}></div>
            </div>
            <div className="task-card">
              <div className="tc-top"><span className="tc-icon"><Icons.Overdue /></span></div>
              <div className="tc-count urgent">{stats.overdueItems}</div>
              <div className="tc-label">Overdue Items</div>
              <div className="tc-bar" style={{ width: '85%', background: 'var(--red)', opacity: 0.4 }}></div>
            </div>
          </div>

          {/* Checkout Panel */}
          <div className="panel checkout-panel">
            <div className="ph">
              <div className="pt">Check-out / Return Books</div>
              <button className="pa" onClick={() => toast.info('New member form coming soon')}>
                <Icons.AddTitle /> New Member
              </button>
            </div>
            <div className="pb">
              <div className="co-form">
                <div className="field">
                  <label>Member Card No.</label>
                  <input 
                    type="text" 
                    placeholder="LIB-XXXXXX" 
                    value={memberCard}
                    onChange={(e) => setMemberCard(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Book ISBN / Title</label>
                  <input 
                    type="text" 
                    placeholder="ISBN or search title…"
                    value={bookId}
                    onChange={(e) => setBookId(e.target.value)}
                  />
                </div>
                <div className="co-buttons">
                  <button className="co-btn" onClick={handleCheckout}>
                    <Icons.CheckOut /> Check Out
                  </button>
                  <button className="co-btn return" onClick={handleReturn}>
                    <Icons.Return /> Return
                  </button>
                </div>
              </div>

              <table className="lib-table">
                <thead>
                  <tr><th>Member</th><th>Book</th><th>Borrowed</th><th>Due</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>
                        <strong style={{ color: 'var(--ink)' }}>{transaction.memberName}</strong>
                        <br /><span className="mono">{transaction.memberCard}</span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--ink)' }}>{transaction.bookTitle}</strong>
                        <br /><span style={{ fontStyle: 'italic', fontSize: '0.7rem' }}>{transaction.bookAuthor}</span>
                      </td>
                      <td className="mono">{transaction.borrowedDate}</td>
                      <td className="mono">{transaction.dueDate}</td>
                      <td>{getStatusPill(transaction.status)}</td>
                      <td>
                        <button className="abt" onClick={() => handleRenew(transaction)}>
                          <Icons.Renew /> Renew
                        </button>
                        <button className="abt r" onClick={() => handleFine(transaction)}>
                          <Icons.Fine /> Fine
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Returns Queue */}
          <div className="panel returns-panel">
            <div className="ph">
              <div className="pt">Today's Return Queue</div>
              <button className="pa" onClick={() => toast.info('Processing all returns')}>Process All</button>
            </div>
            <div className="pb">
              {returnQueue.map(item => (
                <div key={item.id} className="ret-item">
                  <div className="ret-num">{item.cardNo}</div>
                  <div className="ret-info">
                    <div className="ret-title">{item.bookTitle} — {item.author}</div>
                    <div className="ret-member">{item.memberName} · Returned 08:42</div>
                  </div>
                  <div className={`ret-days ${item.status === 'overdue' ? 'overdue' : item.status === 'reserved' ? 'reserved' : 'ontime'}`}>
                    {item.status === 'overdue' && `+${item.days} days`}
                    {item.status === 'ontime' && 'On time'}
                    {item.status === 'reserved' && 'Reserved'}
                  </div>
                  <button className={`abt ${item.status === 'overdue' ? 'r' : ''}`} onClick={() => handleProcessReturn(item)}>
                    {item.status === 'overdue' ? `Fine Ksh ${item.fine}` : 'Process'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Desk Assistant & New Arrivals */}
          <div className="right-col">
            {/* AI Assistant Panel */}
            <div className="ai-panel">
              <div className="ai-head">
                <div className="ai-orb"><Icons.Send /></div>
                <div>
                  <div className="ai-title-text">Desk Assistant</div>
                  <div className="ai-sub">AI · Staff Mode</div>
                </div>
                <button className="ai-close" onClick={() => setAiPanelOpen(!aiPanelOpen)}>
                  <Icons.Close />
                </button>
              </div>
              
              {aiPanelOpen && (
                <>
                  <div className="ai-msgs">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`ai-msg ${msg.role === 'user' ? 'user' : 'bot'}`}>
                        {msg.content}
                      </div>
                    ))}
                    {isAiLoading && (
                      <div className="ai-msg bot">
                        <div className="typing">
                          <div className="td"></div>
                          <div className="td"></div>
                          <div className="td"></div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="ai-chips">
                    {['📋 Member LIB-007712', '📚 Classify new book', '📖 Recommend for teen', '💰 Overdue policy?', '🔄 Renewal rules'].map((chip, idx) => (
                      <span key={idx} className="chip" onClick={() => {
                        setInputMessage(chip.replace(/^[^\s]+\s/, ''))
                        setTimeout(() => sendMessage(), 100)
                      }}>
                        {chip}
                      </span>
                    ))}
                  </div>

                  <div className="ai-row">
                    <textarea 
                      className="ai-inp" 
                      rows={1}
                      placeholder="Ask anything about library operations…"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    />
                    <button className="ai-go" onClick={sendMessage} disabled={isAiLoading || !inputMessage.trim()}>
                      <Icons.Send />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* New Arrivals */}
            <div className="panel arrivals-panel">
              <div className="ph">
                <div className="pt">New Arrivals — To Shelve</div>
              </div>
              <div className="pb">
                {newArrivals.map(book => (
                  <div key={book.id} className="cat-item">
                    <div className="cat-spine" style={{ background: book.spineColor }}></div>
                    <div className="cat-info">
                      <div className="cat-title">{book.title}</div>
                      <div className="cat-author">{book.author}</div>
                      <div className="cat-meta">{book.category} · {book.copies} {book.copies === 1 ? 'copy' : 'copies'}</div>
                    </div>
                    <button className="abt" onClick={() => handleClassify(book)}>
                      <Icons.Classify /> Classify
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}