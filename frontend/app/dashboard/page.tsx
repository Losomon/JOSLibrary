'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

// ============ SVG ICONS (same as before, plus new ones) ============
const Icons = {
  Search: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>),
  Cart: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>),
  User: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>),
  Sun: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /></svg>),
  Moon: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>),
  Close: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
  ChevronDown: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>),
  ChevronUp: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>),
  Book: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>),
  Calendar: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
  Clock: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>),
  Location: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>),
  Star: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>),
  Send: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>),
  Borrow: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M9 12h6M12 9v6" /></svg>),
  Buy: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" /></svg>),
  Reserve: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg>),
  Info: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>),
  Event: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>),
  Target: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>),
  Chat: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>),
  Filter: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3" /></svg>),
  Africa: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z" /><path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10" /></svg>),
  Fiction: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>),
  History: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>),
  Science: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" /></svg>),
  Children: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5z" /><path d="M5 22v-5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v5" /></svg>),
  Business: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>),
  Remove: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
  Check: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>),
  Facebook: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>),
  Twitter: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>),
  Instagram: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="5" /><line x1="17" y1="7" x2="17.01" y2="7" /></svg>),
  ArrowRight: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>),
  Rocket: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2s-4 4-4 8 4 8 4 8 4-4 4-8-4-8-4-8z" /><circle cx="12" cy="10" r="2" /></svg>),
  Shield: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>),
  Truck: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>),
}

// Types and data (same as before, plus testimonials)
interface Book {
  id: number
  title: string
  author: string
  genre: string
  cover1: string
  cover2: string
  avail: number
  total: number
  price: number
  isbn: string
  year: number
  pages: number
  description: string
  reviews: string[]
}

interface CartItem {
  id: number
  title: string
  author: string
  price: number
  type: 'borrow' | 'buy' | 'reserve'
  cover1: string
  cover2: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  bookSuggestion?: Book
}

interface Testimonial {
  id: number
  name: string
  role: string
  content: string
  rating: number
  avatar: string
}

const BOOKS: Book[] = [
  { id: 1, title: 'Things Fall Apart', author: 'Chinua Achebe', genre: 'african', cover1: '#4a2c0a', cover2: '#8b3a1a', avail: 4, total: 6, price: 1200, isbn: '978-0385474542', year: 1958, pages: 209, description: 'A classic of world literature set in 19th-century Nigeria.', reviews: ['A landmark of African literature — UNESCO', 'A perfect novel — The Guardian'] },
  { id: 2, title: 'Americanah', author: 'Chimamanda Ngozi Adichie', genre: 'african', cover1: '#1a2c4a', cover2: '#2a4a6a', avail: 2, total: 5, price: 1500, isbn: '978-0307455925', year: 2013, pages: 477, description: 'A bold novel about race, love, and identity.', reviews: ['Powerful and engrossing — New York Times'] },
  { id: 3, title: 'Petals of Blood', author: 'Ngũgĩ wa Thiong\'o', genre: 'african', cover1: '#2a4a1a', cover2: '#3d5c2a', avail: 5, total: 5, price: 1100, isbn: '978-0142007020', year: 1977, pages: 345, description: 'A scorching indictment of post-independence Kenya.', reviews: ['A revolutionary text — Transition Magazine'] },
  { id: 4, title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', genre: 'fiction', cover1: '#4a2a0a', cover2: '#7a4a0a', avail: 0, total: 4, price: 1400, isbn: '978-1400095209', year: 2006, pages: 433, description: 'Set during the Nigerian-Biafran War.', reviews: ['Devastating and powerful — The Times'] },
  { id: 5, title: 'Born a Crime', author: 'Trevor Noah', genre: 'history', cover1: '#2a1a1a', cover2: '#4a2a2a', avail: 1, total: 3, price: 1600, isbn: '978-0399588174', year: 2016, pages: 304, description: 'The wildly entertaining memoir from The Daily Show host.', reviews: ['Hugely funny and moving — Spectator'] },
  { id: 6, title: 'The Famished Road', author: 'Ben Okri', genre: 'fiction', cover1: '#1a2a1a', cover2: '#2a4a2a', avail: 2, total: 3, price: 1300, isbn: '978-0385425131', year: 1991, pages: 500, description: 'Booker Prize winner. A spirit child in Nigeria.', reviews: ['One of the great African novels — Independent'] },
  { id: 7, title: 'Homegoing', author: 'Yaa Gyasi', genre: 'african', cover1: '#2a1a3a', cover2: '#4a2a5a', avail: 3, total: 4, price: 1350, isbn: '978-1101971062', year: 2016, pages: 320, description: 'A stunning debut spanning three centuries.', reviews: ['A heartbreaking epic — Guardian'] },
  { id: 8, title: 'The River and the Source', author: 'Margaret Ogola', genre: 'african', cover1: '#3a2a0a', cover2: '#5a4a18', avail: 2, total: 3, price: 950, isbn: '978-9966888976', year: 1994, pages: 279, description: 'Four generations of Kenyan women.', reviews: ['A rich and rewarding read — East African Standard'] },
]

const EVENTS = [
  { id: 1, title: 'Things Fall Apart Book Club', date: 'April 25, 2026', time: '2:00 PM', location: 'Main Hall', description: 'Join our monthly book club discussing Chinua Achebe\'s masterpiece.' },
  { id: 2, title: 'Children\'s Reading Hour', date: 'Every Saturday', time: '10:00 AM', location: 'Children\'s Section', description: 'Stories and activities for ages 4-10.' },
  { id: 3, title: 'Digital Library Workshop', date: 'May 2, 2026', time: '3:00 PM', location: 'Computer Lab', description: 'Learn to use our digital resources.' },
]

const TESTIMONIALS: Testimonial[] = [
  { id: 1, name: 'Jane Austen', role: 'Standard Member', content: 'Bibliotheca has completely transformed my reading experience. The AI librarian helps me discover books I never would have found!', rating: 5, avatar: 'JA' },
  { id: 2, name: 'Kofi Mensah', role: 'Scholar Member', content: 'Being able to borrow and buy books in one place is incredible. The delivery is fast and the selection is amazing.', rating: 5, avatar: 'KM' },
  { id: 3, name: 'Dr. Sarah Wanjiku', role: 'Patron Member', content: 'As a researcher, having access to both physical and digital collections is invaluable. Bibliotheca is a game-changer.', rating: 5, avatar: 'SW' },
]

export default function PublicDashboard() {
  const [user, setUser] = useState<any>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'catalog' | 'events' | 'about'>('catalog')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [availOnly, setAvailOnly] = useState(false)
  const [mode, setMode] = useState<'borrow' | 'buy'>('borrow')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showNewsletter, setShowNewsletter] = useState(false)
  
  // AI Chat State
  const [isAiOpen, setIsAiOpen] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiTab, setAiTab] = useState<'chat' | 'quiz' | 'mybooks'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  // Show newsletter modal after 5 seconds (only for non-logged-in users)
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        const hasSeen = localStorage.getItem('newsletter_seen')
        if (!hasSeen) {
          setShowNewsletter(true)
        }
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [user])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light')
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
  }

  const getFilteredBooks = () => {
    let filtered = BOOKS
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(b => b.genre === selectedGenre)
    }
    if (availOnly) {
      filtered = filtered.filter(b => b.avail > 0)
    }
    if (searchQuery) {
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return filtered
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length > 1) {
      const results = BOOKS.filter(b =>
        b.title.toLowerCase().includes(query.toLowerCase()) ||
        b.author.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
      setSearchResults(results)
      setShowSearch(true)
    } else {
      setShowSearch(false)
    }
  }

  const addToCart = (book: Book, type: 'borrow' | 'buy' | 'reserve') => {
    if (type === 'borrow' && book.avail === 0) {
      toast.error('No copies available for borrowing')
      return
    }
    if (cart.find(c => c.id === book.id && c.type === type)) {
      toast.info('Already in cart')
      return
    }
    setCart([...cart, { id: book.id, title: book.title, author: book.author, price: book.price, type, cover1: book.cover1, cover2: book.cover2 }])
    toast.success(`${type === 'borrow' ? '📚' : type === 'buy' ? '🛒' : '🔖'} "${book.title}" added to cart`)
  }

  const removeFromCart = (id: number, type: string) => {
    setCart(cart.filter(c => !(c.id === id && c.type === type)))
    toast.info('Item removed')
  }

  const getCartTotal = () => cart.filter(c => c.type === 'buy').reduce((sum, c) => sum + c.price, 0)

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Welcome to <strong>Bibliotheca!</strong> I'm your AI librarian. I can help you find books, recommend your next read, answer questions about library hours, membership, or quiz you on literature. What would you like today?"
      }])
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isAiLoading) return

    const userMsg = inputMessage.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInputMessage('')
    setIsAiLoading(true)

    setTimeout(() => {
      let response = ""
      const query = userMsg.toLowerCase()
      
      if (query.includes('recommend') || query.includes('suggest')) {
        const rec = BOOKS.find(b => b.genre === 'african' && b.avail > 0)
        response = `I highly recommend <strong>${rec?.title}</strong> by ${rec?.author}. It's a masterpiece of African literature! Would you like to borrow or buy it?`
        setMessages(prev => [...prev, { role: 'assistant', content: response, bookSuggestion: rec }])
      } else if (query.includes('hour') || query.includes('open')) {
        response = "📅 Our hours:<br/>• Mon-Thu: 08:00 - 19:00<br/>• Fri: 08:00 - 18:00<br/>• Sat: 09:00 - 16:00<br/>• Sunday: Closed"
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
      } else if (query.includes('join') || query.includes('card')) {
        response = "✨ To join Bibliotheca, visit our front desk with ID and photo. Membership is FREE for Standard (5 books, 3 weeks), or upgrade to Scholar (Ksh 500/yr) for digital access!"
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
      } else {
        response = "I'm here to help with book recommendations, library hours, membership, and more! Try asking about 'African fiction' or 'how to join'."
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
      }
      setIsAiLoading(false)
    }, 1000)
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Thanks for subscribing! Check your inbox for updates.')
    setShowNewsletter(false)
    localStorage.setItem('newsletter_seen', 'true')
  }

  const filteredBooks = getFilteredBooks()

  return (
    <div className="public-dashboard">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-logo">𝔅 Bibliotheca</div>
        
        <div className="nav-search">
          <span className="ns-icon"><Icons.Search /></span>
          <input 
            ref={searchRef}
            type="text" 
            placeholder="Search titles, authors, genres…"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            onFocus={() => searchQuery && setShowSearch(true)}
          />
          {showSearch && searchResults.length > 0 && (
            <div className="search-dd open">
              {searchResults.map(book => (
                <div key={book.id} className="sd-item" onClick={() => { setSelectedBook(book); setShowModal(true); setShowSearch(false) }}>
                  <div className="sd-sp" style={{ background: `linear-gradient(155deg, ${book.cover1}, ${book.cover2})` }}></div>
                  <div>
                    <div className="sd-title">{book.title}</div>
                    <div className="sd-auth">{book.author}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nav-right">
          <button className="icon-btn" onClick={toggleDarkMode}>
            {darkMode ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          <div className="cart-wrap">
            <button className="icon-btn" onClick={() => setShowCart(true)}><Icons.Cart /></button>
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </div>
          {user ? (
            <Link href="/dashboard/member" className="user-btn in">
              <div className="u-av">{user.email?.[0].toUpperCase()}</div>
              <span>{user.email?.split('@')[0]}</span>
            </Link>
          ) : (
            <Link href="/login" className="user-btn"><Icons.User /> Sign In</Link>
          )}
        </div>
      </nav>

      {/* Hero Section - Marketing Focus */}
      <div className="hero">
        <div className="hero-badge">
          <Icons.Rocket /> Kenya's First AI-Powered Library
        </div>
        <h1 className="h-title">Where books meet<br /><em>intelligence.</em></h1>
        <p className="h-sub">Borrow free, reserve titles, or purchase your favourites. 84,000+ books delivered to your door across Nairobi.</p>
        
        {/* CTA Buttons for Marketing */}
        <div className="hero-cta">
          <Link href="/books" className="btn-primary-hero">
            Browse Catalog <Icons.ArrowRight />
          </Link>
          <Link href="/register" className="btn-secondary-hero">
            Join Free →
          </Link>
        </div>

        <div className="h-stats">
          <div className="hs"><div className="hs-n">84K+</div><div className="hs-l">Titles</div></div>
          <div className="hs"><div className="hs-n">12K+</div><div className="hs-l">Members</div></div>
          <div className="hs"><div className="hs-n">Free</div><div className="hs-l">To Join</div></div>
          <div className="hs"><div className="hs-n">24/7</div><div className="hs-l">AI Help</div></div>
        </div>
      </div>

      {/* Features Section - Marketing */}
      <div className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Icons.Borrow /></div>
            <h3>Borrow for Free</h3>
            <p>Standard members borrow 5 books for 3 weeks. No fees, just reading.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Icons.Truck /></div>
            <h3>Doorstep Delivery</h3>
            <p>Books delivered across Nairobi for only Ksh 150. Return at any library branch.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Icons.Shield /></div>
            <h3>Secure & Simple</h3>
            <p>M-Pesa, card, or cash. Your data is always protected.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Icons.Chat /></div>
            <h3>AI Librarian</h3>
            <p>Get personalized recommendations 24/7 from our AI assistant.</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => setActiveTab('catalog')}>
          <Icons.Book /> Catalog
        </button>
        <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
          <Icons.Event /> Events
        </button>
        <button className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
          <Icons.Info /> About
        </button>
      </div>

      {/* Filter Bar (Catalog only) */}
      {activeTab === 'catalog' && (
        <div className="filter-bar">
          <span className="filter-label"><Icons.Filter /> Genre:</span>
          <button className={`filter-chip ${selectedGenre === 'all' ? 'active' : ''}`} onClick={() => setSelectedGenre('all')}>All</button>
          <button className={`filter-chip ${selectedGenre === 'african' ? 'active' : ''}`} onClick={() => setSelectedGenre('african')}><Icons.Africa /> African Lit</button>
          <button className={`filter-chip ${selectedGenre === 'fiction' ? 'active' : ''}`} onClick={() => setSelectedGenre('fiction')}><Icons.Fiction /> Fiction</button>
          <button className={`filter-chip ${selectedGenre === 'history' ? 'active' : ''}`} onClick={() => setSelectedGenre('history')}><Icons.History /> History</button>
          <div className="filter-divider"></div>
          <button className={`avail-toggle ${availOnly ? 'active' : ''}`} onClick={() => setAvailOnly(!availOnly)}>
            <span className="toggle-track"><span className="toggle-thumb"></span></span>
            Available only
          </button>
          <div className="filter-divider"></div>
          <div className="mode-toggle">
            <button className={`mode-btn ${mode === 'borrow' ? 'active' : ''}`} onClick={() => setMode('borrow')}><Icons.Borrow /> Borrow</button>
            <button className={`mode-btn ${mode === 'buy' ? 'active' : ''}`} onClick={() => setMode('buy')}><Icons.Buy /> Buy</button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="main-layout">
        {/* Left Content */}
        <div className="content-area">
          {activeTab === 'catalog' && (
            <>
              <div className="section-header">
                <h2>Featured Books</h2>
                <div className="flex items-center gap-3">
                  <span className="section-count">{filteredBooks.length} titles</span>
                  <Link href="/books" className="view-all-link">
                    View all books →
                  </Link>
                </div>
              </div>
              <div className="books-grid">
                {filteredBooks.map((book, i) => {
                  const availability = book.avail > 2 ? 'available' : book.avail > 0 ? 'limited' : 'unavailable'
                  const availText = book.avail > 2 ? `${book.avail} available` : book.avail > 0 ? `${book.avail} left` : 'Reserved'
                  return (
                    <motion.div key={book.id} className="book-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <div className="book-cover" style={{ background: `linear-gradient(155deg, ${book.cover1}, ${book.cover2})` }} onClick={() => { setSelectedBook(book); setShowModal(true) }}>
                        <div className="availability-dot" data-status={availability}></div>
                        <div className="book-cover-title">{book.title}</div>
                      </div>
                      <div className="book-details">
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-author">{book.author}</p>
                        <div className="book-meta">
                          {mode === 'borrow' ? (
                            <span className={`book-price free ${book.avail === 0 ? 'unavailable' : ''}`}>{book.avail > 0 ? 'Free' : '—'}</span>
                          ) : (
                            <span className="book-price">Ksh {book.price.toLocaleString()}</span>
                          )}
                          <span className={`book-status ${availability}`}>{availText}</span>
                        </div>
                        <div className="book-actions">
                          {mode === 'borrow' ? (
                            <>
                              <button className="btn-primary" disabled={book.avail === 0} onClick={() => addToCart(book, 'borrow')}>
                                <Icons.Borrow /> {book.avail > 0 ? 'Borrow' : 'Unavailable'}
                              </button>
                              <button className="btn-secondary" onClick={() => addToCart(book, 'reserve')}>
                                <Icons.Reserve /> Reserve
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="btn-primary" onClick={() => addToCart(book, 'buy')}>
                                <Icons.Buy /> Buy Ksh {book.price}
                              </button>
                              <button className="btn-secondary" onClick={() => addToCart(book, 'reserve')}>
                                <Icons.Reserve /> Reserve
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </>
          )}

          {activeTab === 'events' && (
            <div className="events-section">
              <h2>Upcoming Events</h2>
              <div className="events-grid">
                {EVENTS.map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-icon"><Icons.Event /></div>
                    <div className="event-details">
                      <h3>{event.title}</h3>
                      <div className="event-meta">
                        <span><Icons.Calendar /> {event.date}</span>
                        <span><Icons.Clock /> {event.time}</span>
                        <span><Icons.Location /> {event.location}</span>
                      </div>
                      <p>{event.description}</p>
                      <button className="event-rsvp" onClick={() => toast.info('RSVP feature coming soon')}>RSVP <Icons.ArrowRight /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hours-card">
                <h3><Icons.Calendar /> Library Hours</h3>
                <div className="hours-list">
                  <div className="hour-row"><span>Monday - Thursday</span><span>08:00 – 19:00</span></div>
                  <div className="hour-row"><span>Friday</span><span>08:00 – 18:00</span></div>
                  <div className="hour-row"><span>Saturday</span><span>09:00 – 16:00</span></div>
                  <div className="hour-row"><span>Sunday</span><span className="closed">Closed</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="about-section">
              <div className="about-hero">
                <h2>About Bibliotheca</h2>
                <p>Serving Kirinyaga County since 1892</p>
              </div>
              <div className="about-grid">
                <div className="about-card">
                  <h3><Icons.Book /> Our Mission</h3>
                  <p>To provide free and equal access to information, knowledge, and cultural heritage, fostering a love for reading and lifelong learning in our community.</p>
                </div>
                <div className="about-card">
                  <h3><Icons.Star /> Membership Benefits</h3>
                  <ul>
                    <li><Icons.Check /> Borrow up to 5 books (Standard) or 15 (Scholar)</li>
                    <li><Icons.Check /> Access to digital library 24/7</li>
                    <li><Icons.Check /> Free Wi-Fi and computer access</li>
                    <li><Icons.Check /> Priority event registration</li>
                  </ul>
                </div>
                <div className="about-card">
                  <h3><Icons.Location /> Visit Us</h3>
                  <p><strong>Address:</strong> Kutus Town Centre, Kirinyaga County</p>
                  <p><strong>Phone:</strong> +254 700 000 000</p>
                  <p><strong>Email:</strong> info@bibliotheca.ke</p>
                  <div className="social-links">
                    <a href="#"><Icons.Facebook /> Facebook</a>
                    <a href="#"><Icons.Twitter /> Twitter</a>
                    <a href="#"><Icons.Instagram /> Instagram</a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Panel */}
        <div className={`ai-panel ${isAiOpen ? 'open' : 'collapsed'}`}>
          <div className="ai-header" onClick={() => setIsAiOpen(!isAiOpen)}>
            <div className="ai-orb">✦</div>
            <div>
              <div className="ai-title">Librarian AI</div>
              <div className="ai-sub">24/7 Assistant</div>
            </div>
            <button className="ai-toggle">{isAiOpen ? <Icons.ChevronDown /> : <Icons.ChevronUp />}</button>
          </div>
          
          {isAiOpen && (
            <>
              <div className="ai-tabs">
                <button className={`ai-tab ${aiTab === 'chat' ? 'active' : ''}`} onClick={() => setAiTab('chat')}><Icons.Chat /> Chat</button>
                <button className={`ai-tab ${aiTab === 'quiz' ? 'active' : ''}`} onClick={() => setAiTab('quiz')}><Icons.Target /> Quiz</button>
                <button className={`ai-tab ${aiTab === 'mybooks' ? 'active' : ''}`} onClick={() => setAiTab('mybooks')}><Icons.Book /> My Books</button>
              </div>

              <div className="ai-content">
                {aiTab === 'chat' && (
                  <>
                    <div className="chat-messages">
                      {messages.map((msg, i) => (
                        <div key={i} className={`message ${msg.role === 'user' ? 'user' : 'ai'}`}>
                          <div className="message-avatar">{msg.role === 'user' ? <Icons.User /> : '✦'}</div>
                          <div className="message-bubble" dangerouslySetInnerHTML={{ __html: msg.content }} />
                          {msg.bookSuggestion && (
                            <div className="book-suggestion">
                              <div className="suggestion-cover" style={{ background: `linear-gradient(155deg, ${msg.bookSuggestion.cover1}, ${msg.bookSuggestion.cover2})` }}></div>
                              <div className="suggestion-info">
                                <strong>{msg.bookSuggestion.title}</strong>
                                <span>{msg.bookSuggestion.author}</span>
                                <div className="suggestion-actions">
                                  <button onClick={() => addToCart(msg.bookSuggestion!, 'borrow')}><Icons.Borrow /> Borrow</button>
                                  <button onClick={() => addToCart(msg.bookSuggestion!, 'buy')}><Icons.Buy /> Buy Ksh {msg.bookSuggestion.price}</button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {isAiLoading && (
                        <div className="message ai">
                          <div className="message-avatar">✦</div>
                          <div className="message-bubble"><div className="typing-dots"><span></span><span></span><span></span></div></div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-suggestions">
                      {['Recommend African fiction', 'Opening hours', 'How to join', 'Quiz me'].map(s => (
                        <button key={s} className="suggestion-chip" onClick={() => { setInputMessage(s); setTimeout(() => sendMessage(), 100) }}>
                          {s === 'Recommend African fiction' && <Icons.Africa />}
                          {s === 'Opening hours' && <Icons.Clock />}
                          {s === 'How to join' && <Icons.User />}
                          {s === 'Quiz me' && <Icons.Target />}
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="chat-input">
                      <textarea placeholder="Ask your librarian..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
                      <button onClick={sendMessage} disabled={isAiLoading || !inputMessage.trim()}><Icons.Send /></button>
                    </div>
                  </>
                )}

                {aiTab === 'quiz' && (
                  <div className="quiz-content">
                    <div className="quiz-message">
                      <div className="message-ai">✦</div>
                      <div className="quiz-bubble">Test your knowledge! Choose a category to start the quiz.</div>
                    </div>
                    <div className="quiz-categories">
                      <button onClick={() => toast.info('Quiz feature - ask the AI!')}><Icons.Africa /> African Literature</button>
                      <button onClick={() => toast.info('Quiz feature - ask the AI!')}><Icons.Book /> Kenyan Authors</button>
                      <button onClick={() => toast.info('Quiz feature - ask the AI!')}><Icons.History /> World Classics</button>
                    </div>
                  </div>
                )}

                {aiTab === 'mybooks' && (
                  <div className="mybooks-content">
                    {!user ? (
                      <div className="login-prompt">
                        <p>Sign in to see your borrowed books, due dates, and reading history.</p>
                        <Link href="/login" className="login-btn"><Icons.User /> Sign In</Link>
                      </div>
                    ) : (
                      <div className="borrowed-list">
                        <div className="borrowed-header">Currently Borrowed · 3 of 5</div>
                        <div className="borrowed-item">
                          <div className="borrowed-cover" style={{ background: 'linear-gradient(155deg, #4a2c0a, #8b3a1a)' }}></div>
                          <div className="borrowed-info">
                            <div className="borrowed-title">Things Fall Apart</div>
                            <div className="borrowed-author">Chinua Achebe</div>
                            <div className="borrowed-due due-soon">Due Apr 20 · 3 days</div>
                          </div>
                          <button className="renew-btn" onClick={() => toast.success('Renewed!')}><Icons.Borrow /> Renew</button>
                        </div>
                        <div className="fine-status"><Icons.Check /> No outstanding fines · Ksh 0</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Testimonials Section - Marketing */}
      <div className="testimonials-section">
        <div className="testimonials-header">
          <h2>Loved by readers</h2>
          <p>Join thousands of happy members</p>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-stars">
                {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
              </div>
              <p className="testimonial-content">"{testimonial.content}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.avatar}</div>
                <div>
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section - Marketing */}
      <div className="newsletter-section">
        <div className="newsletter-content">
          <h3>Get book recommendations straight to your inbox</h3>
          <p>Subscribe to our newsletter for weekly reading picks, author events, and exclusive offers.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input type="email" placeholder="Your email address" required />
            <button type="submit">Subscribe →</button>
          </form>
          <p className="newsletter-note">No spam. Unsubscribe anytime.</p>
        </div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div className="cart-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCart(false)} />
            <motion.div className="cart-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
              <div className="cart-header">
                <h3><Icons.Cart /> Your Cart</h3>
                <button onClick={() => setShowCart(false)}><Icons.Close /></button>
              </div>
              <div className="cart-items">
                {cart.length === 0 ? (
                  <div className="cart-empty">Your cart is empty</div>
                ) : (
                  cart.map(item => (
                    <div key={`${item.id}-${item.type}`} className="cart-item">
                      <div className="cart-cover" style={{ background: `linear-gradient(155deg, ${item.cover1}, ${item.cover2})` }}></div>
                      <div className="cart-info">
                        <div className="cart-title">{item.title}</div>
                        <div className="cart-author">{item.author}</div>
                        <span className={`cart-type ${item.type}`}>{item.type === 'borrow' ? 'Borrow' : item.type === 'buy' ? 'Buy' : 'Reserve'}</span>
                        {item.type === 'buy' && <div className="cart-price">Ksh {item.price}</div>}
                      </div>
                      <button className="cart-remove" onClick={() => removeFromCart(item.id, item.type)}><Icons.Remove /></button>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="cart-footer">
                  <div className="cart-total">Total: Ksh {getCartTotal().toLocaleString()}</div>
                  <button className="checkout-btn" onClick={() => { toast.success('Checkout successful!'); setCart([]); setShowCart(false) }}>Checkout <Icons.ArrowRight /></button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Book Modal */}
      <AnimatePresence>
        {showModal && selectedBook && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-cover" style={{ background: `linear-gradient(155deg, ${selectedBook.cover1}, ${selectedBook.cover2})` }}>
                <button className="modal-close" onClick={() => setShowModal(false)}><Icons.Close /></button>
                <div>
                  <h2>{selectedBook.title}</h2>
                  <p>{selectedBook.author}</p>
                </div>
              </div>
              <div className="modal-body">
                <div className="modal-meta">
                  <span className="meta-tag">{selectedBook.year}</span>
                  <span className="meta-tag">{selectedBook.pages} pages</span>
                  <span className="meta-tag">{selectedBook.genre}</span>
                </div>
                <p className="modal-desc">{selectedBook.description}</p>
                <div className="modal-availability">
                  <span>Availability:</span>
                  <strong>{selectedBook.avail} of {selectedBook.total} copies</strong>
                </div>
                <div className="modal-actions">
                  <button className="modal-btn primary" disabled={selectedBook.avail === 0} onClick={() => { addToCart(selectedBook, 'borrow'); setShowModal(false) }}>
                    <Icons.Borrow /> {selectedBook.avail > 0 ? 'Borrow Free' : 'Unavailable'}
                  </button>
                  <button className="modal-btn" onClick={() => { addToCart(selectedBook, 'reserve'); setShowModal(false) }}>
                    <Icons.Reserve /> Reserve
                  </button>
                  <button className="modal-btn buy" onClick={() => { addToCart(selectedBook, 'buy'); setShowModal(false) }}>
                    <Icons.Buy /> Buy Ksh {selectedBook.price}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Newsletter Popup Modal */}
      <AnimatePresence>
        {showNewsletter && !user && (
          <motion.div className="modal-overlay newsletter-popup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewsletter(false)}>
            <motion.div className="newsletter-modal" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <button className="newsletter-close" onClick={() => { setShowNewsletter(false); localStorage.setItem('newsletter_seen', 'true') }}><Icons.Close /></button>
              <div className="newsletter-icon">📚</div>
              <h3>Love reading?</h3>
              <p>Get weekly book recommendations, author interviews, and exclusive library news delivered to your inbox.</p>
              <form onSubmit={handleSubscribe}>
                <input type="email" placeholder="Your email address" required />
                <button type="submit">Subscribe →</button>
              </form>
              <p className="newsletter-skip" onClick={() => { setShowNewsletter(false); localStorage.setItem('newsletter_seen', 'true') }}>No thanks, I'd rather browse</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .public-dashboard {
          min-height: 100vh;
          background: var(--bg);
          color: var(--ink);
        }

        /* Navigation (same as before) */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 0.75rem 2rem;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--gold);
        }
        .nav-search {
          flex: 1;
          max-width: 400px;
          position: relative;
        }
        .nav-search input {
          width: 100%;
          padding: 0.6rem 1rem 0.6rem 2.2rem;
          border: 1px solid var(--border);
          border-radius: 40px;
          background: var(--bg2);
          font-size: 0.85rem;
          outline: none;
        }
        .ns-icon {
          position: absolute;
          left: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
        }
        .search-dd {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          margin-top: 0.5rem;
          box-shadow: var(--shadow);
          z-index: 10;
        }
        .sd-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 1rem;
          cursor: pointer;
          border-bottom: 1px solid var(--border);
        }
        .sd-item:hover { background: var(--bg2); }
        .sd-sp { width: 28px; height: 40px; border-radius: 3px; }
        .sd-title { font-size: 0.8rem; font-weight: 500; }
        .sd-auth { font-size: 0.7rem; color: var(--muted); }
        .nav-right { display: flex; align-items: center; gap: 0.75rem; }
        .icon-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--bg2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-wrap { position: relative; }
        .cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--rust);
          color: white;
          font-size: 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-btn {
          padding: 0.4rem 1rem;
          border-radius: 30px;
          border: 1px solid var(--border);
          background: var(--bg2);
          font-size: 0.8rem;
          cursor: pointer;
          text-decoration: none;
          color: var(--ink);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .user-btn.in {
          background: var(--gold);
          color: white;
          border-color: var(--gold);
        }
        .u-av {
          width: 24px; height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), var(--rust));
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.3rem;
        }

        /* Hero Section - Marketing Focus */
        .hero {
          text-align: center;
          padding: 4rem 2rem;
          background: linear-gradient(135deg, var(--bg), var(--bg2));
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(184,134,11,0.1);
          border: 1px solid rgba(184,134,11,0.2);
          border-radius: 30px;
          padding: 0.4rem 1rem;
          font-size: 0.7rem;
          color: var(--gold);
          margin-bottom: 1.5rem;
        }
        .h-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3.5rem;
          font-weight: 300;
          margin-bottom: 1rem;
        }
        .h-title em {
          color: var(--rust);
          font-style: italic;
        }
        .h-sub {
          max-width: 600px;
          margin: 0 auto 1.5rem;
          color: var(--muted);
          line-height: 1.6;
          font-size: 1rem;
        }
        .hero-cta {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .btn-primary-hero {
          padding: 0.7rem 1.5rem;
          background: var(--gold);
          color: var(--ink);
          border-radius: 40px;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s;
        }
        .btn-primary-hero:hover {
          transform: translateY(-2px);
        }
        .btn-secondary-hero {
          padding: 0.7rem 1.5rem;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 40px;
          text-decoration: none;
          color: var(--ink);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s;
        }
        .btn-secondary-hero:hover {
          transform: translateY(-2px);
        }
        .h-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
        }
        .hs { text-align: center; }
        .hs-n {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--gold);
        }
        .hs-l { font-size: 0.65rem; color: var(--muted); }

        /* Features Section - Marketing */
        .features-section {
          padding: 4rem 2rem;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .feature-card {
          text-align: center;
          padding: 1.5rem;
        }
        .feature-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 1rem;
          background: rgba(184,134,11,0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gold);
        }
        .feature-card h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        .feature-card p {
          font-size: 0.8rem;
          color: var(--muted);
          line-height: 1.5;
        }

        /* Tab Navigation */
        .tab-nav {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
        }
        .tab-btn {
          padding: 0.5rem 1.5rem;
          border-radius: 30px;
          border: none;
          background: transparent;
          font-size: 0.85rem;
          cursor: pointer;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .tab-btn.active {
          background: var(--gold);
          color: white;
        }

        /* Filter Bar */
        .filter-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          overflow-x: auto;
        }
        .filter-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        .filter-chip {
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: transparent;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .filter-chip.active {
          background: var(--gold);
          color: white;
          border-color: var(--gold);
        }
        .filter-divider { width: 1px; height: 20px; background: var(--border); }
        .avail-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.75rem;
        }
        .toggle-track {
          width: 32px; height: 18px;
          border-radius: 9px;
          background: var(--border);
          position: relative;
        }
        .toggle-thumb {
          width: 14px; height: 14px;
          border-radius: 50%;
          background: white;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: left 0.2s;
        }
        .avail-toggle.active .toggle-thumb { left: 16px; }
        .mode-toggle {
          display: flex;
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
        }
        .mode-btn {
          padding: 0.3rem 0.8rem;
          border: none;
          background: transparent;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .mode-btn.active {
          background: var(--ink2);
          color: white;
        }

        /* Main Layout */
        .main-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          min-height: calc(100vh - 200px);
        }
        .content-area { padding: 2rem; overflow-y: auto; }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 1.5rem;
        }
        .section-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 400;
        }
        .section-count { font-size: 0.75rem; color: var(--muted); }
        .view-all-link {
          font-size: 0.75rem;
          color: var(--gold);
          text-decoration: none;
        }

        /* Books Grid */
        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        .book-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .book-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow);
        }
        .book-cover {
          height: 160px;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 0.75rem;
          cursor: pointer;
        }
        .availability-dot {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .availability-dot[data-status="available"] { background: #4caf50; }
        .availability-dot[data-status="limited"] { background: #ff9800; }
        .availability-dot[data-status="unavailable"] { background: #f44336; }
        .book-cover-title {
          color: rgba(255,255,255,0.85);
          font-style: italic;
          font-size: 0.75rem;
        }
        .book-details { padding: 0.75rem; }
        .book-title { font-size: 0.85rem; font-weight: 600; margin-bottom: 0.2rem; line-height: 1.3; }
        .book-author { font-size: 0.7rem; color: var(--muted); margin-bottom: 0.5rem; }
        .book-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .book-price { font-size: 0.75rem; font-weight: 500; }
        .book-price.free { color: var(--sage); }
        .book-status {
          font-size: 0.6rem;
          padding: 0.15rem 0.4rem;
          border-radius: 10px;
        }
        .book-status.available { background: rgba(76,175,80,0.1); color: #4caf50; }
        .book-status.limited { background: rgba(255,152,0,0.1); color: #ff9800; }
        .book-status.unavailable { background: rgba(244,67,54,0.1); color: #f44336; }
        .book-actions { display: flex; gap: 0.4rem; }
        .btn-primary, .btn-secondary {
          flex: 1;
          padding: 0.35rem;
          border-radius: 6px;
          font-size: 0.65rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.2rem;
        }
        .btn-primary {
          background: var(--ink2);
          color: white;
          border: none;
        }
        .btn-primary:disabled {
          background: var(--border);
          cursor: not-allowed;
        }
        .btn-secondary {
          background: transparent;
          border: 1px solid var(--border);
        }

        /* Events Section */
        .events-section { padding: 1rem; }
        .events-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .event-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
        }
        .event-icon { font-size: 2rem; }
        .event-details h3 { margin-bottom: 0.5rem; }
        .event-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.7rem;
          color: var(--muted);
          margin-bottom: 0.5rem;
        }
        .event-meta span { display: flex; align-items: center; gap: 0.2rem; }
        .event-rsvp {
          margin-top: 0.5rem;
          padding: 0.3rem 1rem;
          background: none;
          border: 1px solid var(--gold);
          border-radius: 20px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }
        .hours-card {
          padding: 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
        }
        .hours-card h3 { display: flex; align-items: center; gap: 0.4rem; }
        .hours-list { margin-top: 1rem; }
        .hour-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border);
        }
        .closed { color: var(--rust); }

        /* About Section */
        .about-section { padding: 1rem; }
        .about-hero { text-align: center; margin-bottom: 2rem; }
        .about-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        .about-card {
          padding: 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
        }
        .about-card h3 {
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .about-card ul { list-style: none; padding: 0; }
        .about-card li {
          padding: 0.25rem 0;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        .social-links a {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          text-decoration: none;
          color: var(--muted);
        }

        /* AI Panel */
        .ai-panel {
          background: var(--ink2);
          border-left: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          height: calc(100vh - 200px);
          position: sticky;
          top: 120px;
        }
        .ai-panel.collapsed { height: auto; }
        .ai-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .ai-orb {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), var(--rust));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        .ai-title { font-family: 'Cormorant Garamond', serif; font-size: 1rem; color: var(--gold-l); }
        .ai-sub { font-size: 0.65rem; color: rgba(255,255,255,0.3); }
        .ai-toggle {
          margin-left: auto;
          background: none;
          border: none;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
        }
        .ai-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .ai-tab {
          flex: 1;
          padding: 0.6rem;
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 0.7rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
        }
        .ai-tab.active {
          color: var(--gold);
          border-bottom: 2px solid var(--gold);
        }
        .ai-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }

        /* Chat Styles */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .message { display: flex; gap: 0.5rem; }
        .message.user { flex-direction: row-reverse; }
        .message-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.1);
        }
        .message-bubble {
          max-width: 80%;
          padding: 0.5rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          line-height: 1.5;
        }
        .message.ai .message-bubble {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .message.user .message-bubble {
          background: rgba(196,144,48,0.15);
        }
        .typing-dots {
          display: flex;
          gap: 4px;
          padding: 0.25rem;
        }
        .typing-dots span {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--gold);
          animation: blink 1.4s infinite;
        }
        @keyframes blink {
          0%, 60%, 100% { opacity: 0.2; }
          30% { opacity: 1; }
        }
        .book-suggestion {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          display: flex;
          gap: 0.5rem;
        }
        .suggestion-cover {
          width: 40px; height: 56px;
          border-radius: 4px;
        }
        .suggestion-info { flex: 1; }
        .suggestion-info strong { display: block; font-size: 0.75rem; }
        .suggestion-info span { font-size: 0.65rem; color: var(--muted); }
        .suggestion-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }
        .suggestion-actions button {
          padding: 0.2rem 0.5rem;
          font-size: 0.6rem;
          border-radius: 4px;
          background: var(--gold);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        .chat-suggestions {
          padding: 0.5rem 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .suggestion-chip {
          padding: 0.25rem 0.6rem;
          font-size: 0.65rem;
          border-radius: 20px;
          background: rgba(196,144,48,0.1);
          border: 1px solid rgba(196,144,48,0.2);
          color: var(--gold-l);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .chat-input {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .chat-input textarea {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          resize: none;
          color: white;
        }
        .chat-input button {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: var(--gold);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Quiz Styles */
        .quiz-content { padding: 1rem; }
        .quiz-message { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .quiz-bubble {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 0.75rem;
          font-size: 0.8rem;
        }
        .quiz-categories { display: flex; flex-direction: column; gap: 0.5rem; }
        .quiz-categories button {
          padding: 0.6rem;
          border-radius: 8px;
          background: rgba(196,144,48,0.1);
          border: 1px solid rgba(196,144,48,0.2);
          color: var(--gold-l);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        /* My Books Styles */
        .mybooks-content { padding: 1rem; }
        .login-prompt {
          text-align: center;
          padding: 2rem 1rem;
        }
        .login-prompt p {
          margin-bottom: 1rem;
          color: var(--muted);
        }
        .login-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          background: var(--gold);
          border-radius: 30px;
          text-decoration: none;
          color: var(--ink);
        }
        .borrowed-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .borrowed-header {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 0.5rem;
        }
        .borrowed-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
        }
        .borrowed-cover {
          width: 40px; height: 56px;
          border-radius: 4px;
        }
        .borrowed-info { flex: 1; }
        .borrowed-title { font-weight: 500; }
        .borrowed-author { font-size: 0.7rem; color: var(--muted); }
        .borrowed-due { font-size: 0.65rem; margin-top: 0.2rem; }
        .borrowed-due.due-soon { color: #ff9800; }
        .renew-btn {
          padding: 0.25rem 0.5rem;
          background: var(--gold);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        .fine-status {
          padding: 0.5rem;
          background: rgba(76,175,80,0.1);
          border-radius: 8px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        /* Testimonials Section */
        .testimonials-section {
          padding: 4rem 2rem;
          background: var(--bg);
          border-top: 1px solid var(--border);
        }
        .testimonials-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .testimonials-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .testimonials-header p {
          color: var(--muted);
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .testimonial-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
        }
        .testimonial-stars {
          color: var(--gold);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        .testimonial-content {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-2);
          margin-bottom: 1rem;
        }
        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .author-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), var(--rust));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
        }
        .author-name {
          font-weight: 600;
          font-size: 0.85rem;
        }
        .author-role {
          font-size: 0.7rem;
          color: var(--muted);
        }

        /* Newsletter Section */
        .newsletter-section {
          padding: 4rem 2rem;
          background: linear-gradient(135deg, var(--ink), var(--ink2));
          color: white;
          text-align: center;
        }
        .newsletter-content {
          max-width: 500px;
          margin: 0 auto;
        }
        .newsletter-content h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
        }
        .newsletter-content p {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 1.5rem;
        }
        .newsletter-form {
          display: flex;
          gap: 0.5rem;
        }
        .newsletter-form input {
          flex: 1;
          padding: 0.8rem 1rem;
          border: none;
          border-radius: 40px;
          font-size: 0.9rem;
        }
        .newsletter-form button {
          padding: 0.8rem 1.5rem;
          background: var(--gold);
          border: none;
          border-radius: 40px;
          cursor: pointer;
          font-weight: 600;
        }
        .newsletter-note {
          font-size: 0.7rem;
          margin-top: 0.8rem;
          opacity: 0.5;
        }

        /* Newsletter Popup */
        .newsletter-popup {
          z-index: 1000;
        }
        .newsletter-modal {
          background: var(--surface);
          border-radius: 24px;
          padding: 2rem;
          max-width: 420px;
          text-align: center;
          position: relative;
        }
        .newsletter-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--muted);
        }
        .newsletter-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .newsletter-modal h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .newsletter-modal p {
          font-size: 0.85rem;
          color: var(--muted);
          margin-bottom: 1.5rem;
        }
        .newsletter-modal form {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .newsletter-modal input {
          padding: 0.8rem 1rem;
          border: 1px solid var(--border);
          border-radius: 40px;
          background: var(--bg);
        }
        .newsletter-modal button {
          padding: 0.8rem;
          background: var(--gold);
          border: none;
          border-radius: 40px;
          cursor: pointer;
          font-weight: 600;
        }
        .newsletter-skip {
          font-size: 0.7rem;
          color: var(--muted);
          margin-top: 1rem;
          cursor: pointer;
        }

        /* Cart Drawer */
        .cart-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 200;
        }
        .cart-drawer {
          position: fixed;
          right: 0;
          top: 0;
          bottom: 0;
          width: 360px;
          background: var(--surface);
          z-index: 201;
          display: flex;
          flex-direction: column;
          box-shadow: -2px 0 8px rgba(0,0,0,0.1);
        }
        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border);
        }
        .cart-header h3 { display: flex; align-items: center; gap: 0.4rem; }
        .cart-items { flex: 1; overflow-y: auto; padding: 1rem; }
        .cart-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border);
        }
        .cart-cover {
          width: 40px; height: 56px;
          border-radius: 4px;
        }
        .cart-info { flex: 1; }
        .cart-title { font-weight: 500; font-size: 0.8rem; }
        .cart-author { font-size: 0.7rem; color: var(--muted); }
        .cart-type {
          font-size: 0.6rem;
          padding: 0.1rem 0.3rem;
          border-radius: 4px;
        }
        .cart-type.borrow { background: rgba(76,175,80,0.1); color: #4caf50; }
        .cart-type.buy { background: rgba(255,152,0,0.1); color: #ff9800; }
        .cart-type.reserve { background: rgba(33,150,243,0.1); color: #2196f3; }
        .cart-price { font-size: 0.7rem; font-weight: 600; margin-top: 0.2rem; }
        .cart-remove {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
        }
        .cart-footer {
          padding: 1rem;
          border-top: 1px solid var(--border);
        }
        .cart-total { font-weight: 600; margin-bottom: 1rem; }
        .checkout-btn {
          width: 100%;
          padding: 0.75rem;
          background: var(--gold);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }
        .cart-empty {
          text-align: center;
          padding: 2rem;
          color: var(--muted);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          z-index: 300;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          background: var(--surface);
          border-radius: 16px;
          overflow: hidden;
        }
        .modal-cover {
          height: 160px;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 1rem;
        }
        .modal-cover h2 { color: white; font-family: 'Cormorant Garamond', serif; }
        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0,0,0,0.5);
          border: none;
          color: white;
          width: 32px; height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-body { padding: 1rem; }
        .modal-meta { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .meta-tag {
          padding: 0.2rem 0.6rem;
          background: var(--bg2);
          border-radius: 20px;
          font-size: 0.7rem;
        }
        .modal-desc {
          font-size: 0.85rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        .modal-availability {
          padding: 0.75rem;
          background: var(--bg2);
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .modal-actions { display: flex; gap: 0.5rem; }
        .modal-btn {
          flex: 1;
          padding: 0.6rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
        }
        .modal-btn.primary {
          background: var(--ink2);
          color: white;
        }
        .modal-btn.buy {
          background: var(--gold);
          color: var(--ink);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
          .main-layout {
            grid-template-columns: 1fr;
          }
          .ai-panel {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: auto;
            max-height: 60vh;
            z-index: 50;
          }
          .books-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }
          .hero-cta {
            flex-direction: column;
            align-items: center;
          }
          .newsletter-form {
            flex-direction: column;
          }
        }
        @media (max-width: 600px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          .h-stats {
            gap: 1rem;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  )
}