# Bibliotheca Library 📚

> **AI-Powered Library Management & Bookstore System**  
> Built for Kirinyaga County — modern, multilingual, and mobile-first.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=fff)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=fff)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)

---

## What is Bibliotheca?

Bibliotheca is a full-stack library management system that combines traditional library operations with AI-powered discovery, an integrated e-commerce bookstore, and role-based dashboards for members, librarians, and administrators.

It handles everything a modern public library needs — borrowing, reservations, fines, cataloguing, staff management, M-Pesa payments — all enhanced by a conversational AI assistant that helps users find their next great read.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Role-Based Dashboards](#role-based-dashboards)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [AI Integration](#ai-integration)
- [Payment Integration](#payment-integration)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### For Members
- Browse and search 84,000+ book catalogue
- AI-powered book recommendations and natural language search
- Borrow, reserve, and purchase books online
- Track due dates, fines, and borrowing history
- Personal reading list and favourites
- Digital library card with QR code
- Real-time fine calculation with online payment

### For Librarians
- Desk checkout and return processing
- Overdue management with automated notices
- New arrival cataloguing with Dewey Decimal classification
- Member lookup and account management
- Reservation queue and pickup coordination
- AI desk assistant for classification and reader advisory
- Issue and manage library cards

### For Administrators
- System-wide dashboard with live activity feed
- Member management with suspension and reinstatement
- Full transaction ledger (borrows, returns, fines, purchases)
- Acquisition tracking and purchase order management
- Staff scheduling and role management
- AI usage logs and system health monitoring
- Financial reports and borrowing trend analytics
- Configurable system settings (fine rates, loan limits, hours)

### AI Intelligence
- **Conversational AI chatbot** — available 24/7 on public page
- **Staff AI desk assistant** — helps librarians with classification and policies
- **Natural language catalogue search** — "books like Americanah set in Africa"
- **Personalised recommendations** — based on borrowing history and preferences
- **Book quiz engine** — AI-generated literature quizzes by category
- **Auto-tagging and summaries** — for new catalogue entries

### E-Commerce
- Buy books with delivery or in-store pickup
- Shopping cart with borrow/buy/reserve modes
- M-Pesa STK Push integration (Kenya)
- Paystack fallback for card payments
- Order tracking and delivery status
- Purchase receipt generation

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript 5.8 |
| **Styling** | Tailwind CSS 4.1, shadcn/ui, Framer Motion |
| **Backend** | Next.js API Routes + Server Actions |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (email/password, OAuth) |
| **AI** | xAI Grok API (via `/api/ai/*`) |
| **Payments** | M-Pesa Daraja API, Paystack |
| **State** | TanStack Query, React Hook Form, Zod |
| **Icons** | Lucide React |
| **Notifications** | Sonner (toast system) |
| **Fonts** | Cormorant Garamond, DM Sans, JetBrains Mono |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│          Next.js 15 — App Router                 │
│   /dashboard/member  /dashboard/librarian        │
│   /dashboard/admin   /books   /(auth)            │
└────────────────────┬────────────────────────────┘
                     │  Server Actions / API Routes
          ┌──────────▼──────────┐
          │   Next.js Backend    │
          │  /api/books          │
          │  /api/ai/chat        │
          │  /api/borrows        │
          │  /api/checkout       │
          │  /api/webhooks/mpesa │
          └──────┬──────┬───────┘
                 │      │
     ┌───────────▼──┐  ┌▼──────────────┐
     │   Supabase   │  │  xAI Grok API │
     │  PostgreSQL  │  │  AI Chat/Reco │
     │  Auth + RLS  │  └───────────────┘
     └──────────────┘
           │
     ┌─────▼──────────────┐
     │  Payments           │
     │  M-Pesa Daraja API  │
     │  Paystack           │
     └─────────────────────┘
```

---

## Project Structure

```
Bibliotheca-Library/
│
├── frontend/                          # Next.js 15 frontend
│   ├── app/
│   │   ├── (auth)/                   # Auth routes
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Role-redirect landing
│   │   │   │
│   │   │   ├── admin/                # Admin dashboard (10 pages)
│   │   │   │   ├── layout.tsx        # Admin sidebar + nav
│   │   │   │   ├── page.tsx          # Overview + stats
│   │   │   │   ├── members/          # Member CRUD
│   │   │   │   ├── catalogue/        # Book management
│   │   │   │   ├── transactions/     # Full TX ledger
│   │   │   │   ├── overdue/          # Overdue action centre
│   │   │   │   ├── fines/            # Fine accounts + waivers
│   │   │   │   ├── reservations/     # Pickup queue
│   │   │   │   ├── acquisitions/     # New arrivals + orders
│   │   │   │   ├── staff/            # Staff + schedules
│   │   │   │   ├── reports/          # Analytics + exports
│   │   │   │   ├── ai-logs/          # AI request monitoring
│   │   │   │   └── settings/         # System config
│   │   │   │
│   │   │   ├── member/               # Member dashboard (10 pages)
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx          # My books + due dates
│   │   │   │   ├── books/            # Browse + borrow
│   │   │   │   ├── reservations/     # My reservations
│   │   │   │   ├── fines/            # My fines + payment
│   │   │   │   ├── reading-list/     # Saved to read
│   │   │   │   ├── favourites/       # Starred books
│   │   │   │   ├── card/             # Digital library card
│   │   │   │   ├── profile/          # Personal details
│   │   │   │   └── settings/         # Preferences + notifications
│   │   │   │
│   │   │   └── librarian/            # Librarian dashboard (12 pages)
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx          # Today's queue
│   │   │       ├── checkout/         # Check-out desk
│   │   │       ├── returns/          # Return processing
│   │   │       ├── catalogue/        # Catalogue management
│   │   │       ├── arrivals/         # New arrivals to shelve
│   │   │       ├── members/          # Member lookup
│   │   │       ├── reservations/     # Pickup coordination
│   │   │       ├── overdue/          # Overdue notices
│   │   │       ├── fines/            # Fine collection
│   │   │       ├── issue-card/       # Card issuance
│   │   │       └── settings/         # Shift preferences
│   │   │
│   │   ├── books/                    # Public catalogue page
│   │   ├── api/                      # API route handlers
│   │   │   ├── books/route.ts
│   │   │   ├── ai/
│   │   │   │   ├── chat/route.ts
│   │   │   │   ├── search/route.ts
│   │   │   │   └── recommend/route.ts
│   │   │   ├── borrows/route.ts
│   │   │   ├── checkout/route.ts
│   │   │   └── webhooks/
│   │   │       └── mpesa/route.ts
│   │   │
│   │   ├── actions/                  # Server Actions
│   │   ├── globals.css               # Tailwind + design tokens
│   │   ├── layout.tsx                # Root layout
│   │   └── middleware.ts             # Auth + role protection
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── label.tsx
│   │   ├── providers/
│   │   │   ├── ThemeProvider.tsx     # Dark/light mode
│   │   │   └── QueryProvider.tsx     # TanStack Query
│   │   ├── books/
│   │   │   └── BookCard.tsx
│   │   └── ai/
│   │       └── AiChatWidget.tsx
│   │
│   └── lib/
│       ├── supabase.ts               # Supabase client
│       ├── auth.ts                   # Auth helpers
│       ├── types.ts                  # Global TypeScript types
│       └── utils.ts                  # Utility functions
│
└── backend/
    └── library-ai/                   # AI backend service
        ├── app/
        │   ├── api/                  # Grok API handlers
        │   ├── lib/
        │   │   └── grok.ts           # Grok client + prompts
        │   └── components/
        ├── supabase/
        │   └── migrations/           # DB schema migrations
        └── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18.17+
- npm or pnpm
- Supabase account (free tier works)
- xAI Grok API key
- M-Pesa Daraja API credentials (for payments)

### 1. Clone the repository

```bash
git clone https://github.com/Losomon/Bibliotheca-Library.git
cd Bibliotheca-Library
```

### 2. Set up the backend (AI service)

```bash
cd backend/library-ai
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# xAI Grok
GROK_API_KEY=your-grok-api-key
GROK_MODEL=grok-3-mini

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

```bash
npm install
npm run dev
# Backend running on http://localhost:3001
```

### 3. Set up the frontend

```bash
cd ../../frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Backend
AI_BACKEND_URL=http://localhost:3001

# Payments
MPESA_CONSUMER_KEY=your-mpesa-key
MPESA_CONSUMER_SECRET=your-mpesa-secret
MPESA_PASSKEY=your-mpesa-passkey
MPESA_SHORTCODE=174379
PAYSTACK_SECRET_KEY=sk_test_your-paystack-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npm install
npm run dev
# Frontend running on http://localhost:3000
```

### 4. Run database migrations

```bash
cd backend/library-ai
npx supabase db push
```

Open `http://localhost:3000` — you're live. 🎉

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase public anon key |
| `AI_BACKEND_URL` | ✅ | URL of the AI backend service |
| `MPESA_CONSUMER_KEY` | ⚠️ | M-Pesa Daraja consumer key |
| `MPESA_CONSUMER_SECRET` | ⚠️ | M-Pesa Daraja consumer secret |
| `MPESA_PASSKEY` | ⚠️ | M-Pesa STK Push passkey |
| `MPESA_SHORTCODE` | ⚠️ | M-Pesa till/paybill number |
| `PAYSTACK_SECRET_KEY` | ⚠️ | Paystack secret key |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public app URL for redirects |

### Backend (`backend/library-ai/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `GROK_API_KEY` | ✅ | xAI Grok API key |
| `GROK_MODEL` | ✅ | Grok model name (e.g. `grok-3-mini`) |

> ⚠️ = Required only for payment features. The app works without payments enabled.

---

## Role-Based Dashboards

Middleware at `frontend/app/middleware.ts` reads the user's role from Supabase Auth metadata and redirects accordingly:

| Role | Entry point | Pages |
|---|---|---|
| **Member** | `/dashboard/member` | Dashboard, Books, Reservations, Fines, Reading List, Favourites, Card, Profile, Settings |
| **Librarian** | `/dashboard/librarian` | Dashboard, Checkout, Returns, Catalogue, Arrivals, Members, Reservations, Overdue, Fines, Issue Card, Settings |
| **Admin** | `/dashboard/admin` | Dashboard, Members, Catalogue, Transactions, Overdue, Fines, Reservations, Acquisitions, Staff, Reports, AI Logs, Settings |

Roles are assigned at registration and stored in `user_metadata.role`. RLS policies in Supabase enforce data access by role at the database level.

---

## API Reference

All routes are under `frontend/app/api/`.

### Books

```
GET    /api/books              List books (with filters: genre, available, search)
GET    /api/books/:id          Get single book with availability
POST   /api/books              Add book to catalogue (librarian/admin)
PATCH  /api/books/:id          Update book record
DELETE /api/books/:id          Remove book (admin only)
```

### AI

```
POST   /api/ai/chat            Conversational AI query
         body: { messages: Message[], context?: string }

POST   /api/ai/search          Natural language catalogue search
         body: { query: string }

POST   /api/ai/recommend       Personalised recommendations
         body: { userId: string, history?: string[] }
```

### Borrowing

```
GET    /api/borrows            List borrows (filtered by user/status)
POST   /api/borrows            Create borrow record
PATCH  /api/borrows/:id        Update (renew, return, flag overdue)
GET    /api/borrows/fines      Calculate outstanding fines
```

### E-Commerce

```
POST   /api/checkout           Create order + initiate payment
GET    /api/orders/:id         Get order status
POST   /api/webhooks/mpesa     M-Pesa payment webhook
POST   /api/webhooks/paystack  Paystack payment webhook
```

---

## Database Schema

Key tables in Supabase PostgreSQL:

```sql
-- Core tables
books           (id, title, author, isbn, genre, dewey_code, copies_total, 
                 copies_available, price_ksh, description, cover_color)

members         (id, user_id, card_number, membership_type, status, 
                 joined_at, fines_outstanding)

borrows         (id, member_id, book_id, borrowed_at, due_date, 
                 returned_at, fine_ksh, status)

reservations    (id, member_id, book_id, reserved_at, status, 
                 expires_at, pickup_by)

fines           (id, borrow_id, member_id, amount_ksh, 
                 paid_at, waived_at, status)

-- E-commerce
orders          (id, member_id, items, total_ksh, 
                 payment_method, payment_status, delivery_status)

-- Operations
staff           (id, user_id, name, role, shift_pattern, status)
acquisitions    (id, title, author, isbn, copies, cost_ksh, 
                 received_at, classified_at, dewey_code, status)

-- AI
ai_logs         (id, source, query, response_ms, token_count, 
                 status, created_at)
```

Row Level Security (RLS) is enabled on all tables. Members can only read their own borrows and fines. Librarians have read/write on operational tables. Admins have full access.

---

## AI Integration

Bibliotheca uses **xAI Grok** via `backend/library-ai/app/lib/grok.ts`.

### System Prompts by Context

Three distinct AI personas are used:

**Public Librarian** (`/books` page)
```
Warm, knowledgeable public assistant. Helps visitors discover books,
answers library policy questions, runs book quizzes.
```

**Librarian Desk** (`/dashboard/librarian`)
```
Efficient staff assistant. Knows Dewey Decimal classification,
member records, overdue procedures, reader advisory for patrons.
```

**Member Assistant** (`/dashboard/member`)
```
Personal reading companion. Knows the member's borrowing history,
due dates, reading list — makes tailored recommendations.
```

### Book Card Response Format

When the AI recommends a book in the catalogue, it appends a structured card:

```
BOOK_CARD:{"id":1,"title":"Things Fall Apart","reason":"..."}
```

The frontend parses this and renders an actionable card with Borrow / Buy / Details buttons directly inside the chat bubble.

---

## Payment Integration

### M-Pesa (Primary — Kenya)

Uses Safaricom Daraja API with STK Push:

1. User clicks "Pay Ksh X" in cart
2. `/api/checkout` calls Daraja to initiate STK Push
3. M-Pesa PIN prompt sent to member's phone
4. Safaricom calls `/api/webhooks/mpesa` with result
5. Order status updated, receipt generated

```typescript
// Trigger STK Push
const response = await mpesa.stkPush({
  phoneNumber: member.phone,
  amount: order.total_ksh,
  accountReference: `LIB-${order.id}`,
  transactionDesc: 'Bibliotheca Book Purchase'
})
```

### Paystack (Fallback — Card)

For non-M-Pesa users (card, bank transfer):

```typescript
const session = await paystack.transaction.initialize({
  email: member.email,
  amount: order.total_ksh * 100, // kobo
  callback_url: `${APP_URL}/orders/${order.id}/confirm`
})
```

---

## Development

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format

# Build for production
npm run build

# Run production build
npm start

# Supabase local dev (optional)
npx supabase start
npx supabase db reset     # Apply migrations fresh
npx supabase db push      # Push to remote
```

---

## Contributing

Contributions are welcome. This project uses a feature-branch workflow.

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/Bibliotheca-Library.git

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes with clear commits
git commit -m "feat: add member reading history export"
git commit -m "fix: correct fine calculation for renewals"
git commit -m "docs: update API reference for /api/borrows"

# 4. Push
git push origin feature/your-feature-name

# 5. Open a Pull Request to:
#    base: 1-backend-and-frontend-implementaion
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructure, no feature change |
| `chore:` | Build, tooling, config |

### Code Standards

- TypeScript strict mode — no `any` unless justified
- All API routes must have Zod validation
- All database queries go through Supabase client — no raw SQL in components
- Components must be < 200 lines — extract if larger
- Every new page needs a loading state and error boundary

---

## Deployment

### Vercel (Recommended)

```bash
# Deploy frontend
cd frontend
vercel --prod

# Deploy backend
cd backend/library-ai
vercel --prod
```

Set all environment variables in the Vercel dashboard under each project's settings.

### Self-hosted (Docker)

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## License

MIT © 2026 [Losomon](https://github.com/Losomon)

See [LICENSE](LICENSE) for full terms.

---

## Acknowledgments

- [Supabase](https://supabase.com) — Database, Auth, and real-time
- [xAI Grok](https://grok.x.ai) — AI intelligence layer
- [shadcn/ui](https://ui.shadcn.com) — Accessible UI components
- [Tailwind CSS](https://tailwindcss.com) — Utility-first styling
- [Safaricom Daraja](https://developer.safaricom.co.ke) — M-Pesa payments
- [Paystack](https://paystack.com) — Card payment processing

---

<div align="center">

**[⭐ Star on GitHub](https://github.com/Losomon/Bibliotheca-Library)** &nbsp;·&nbsp;
**[🐛 Report a Bug](https://github.com/Losomon/Bibliotheca-Library/issues)** &nbsp;·&nbsp;
**[💡 Request a Feature](https://github.com/Losomon/Bibliotheca-Library/issues)**

*Built with care for readers everywhere.*

</div>
