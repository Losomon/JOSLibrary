# JOSLibrary AI 📚🤖

**A modern AI-powered Library Management + Bookstore System** built for JOSLibrary, Kenya.

This full-stack application combines traditional library operations (borrowing) with e-commerce features (buying books), powered by intelligent AI assistance.

## ✨ Key Features

### 📖 Library Management
- Browse and search books
- Borrow books with due dates and automatic fine calculation
- Real-time availability tracking
- Librarian & Admin dashboards

### 🤖 AI-Powered Intelligence
- **AI Librarian Chatbot** – Ask anything in natural language (powered by Grok-4)
- **Natural Language Search** – "Show me sci-fi books under 500 KES written after 2020"
- **Smart Recommendations** – Personalized suggestions based on borrow and purchase history
- Auto-generation of book summaries and tags

### 🛒 E-commerce Features
- Buy books directly
- Shopping cart system
- Secure checkout with M-Pesa and Paystack support
- Order tracking and delivery management

### 👤 User Roles
- **Member**: Browse, borrow, buy, chat with AI
- **Librarian**: Manage books, handle borrows and returns
- **Admin**: Full system control

## 🛠 Tech Stack

| Category         | Technology                              |
|------------------|-----------------------------------------|
| Framework        | Next.js 15 (App Router) + TypeScript    |
| Styling          | Tailwind CSS + shadcn/ui                |
| Database         | Supabase (PostgreSQL)                   |
| Authentication   | Supabase Auth                           |
| AI               | xAI Grok via `@ai-sdk/xai`              |
| Validation       | Zod                                     |
| Icons            | Lucide React                            |
| Payments         | M-Pesa Daraja + Paystack                |

## 📁 Project Structure

```bash
library-ai/
├── app/
│   ├── api/                 # API Routes (books, ai, orders, webhooks, etc.)
│   ├── actions/             # Server Actions
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   ├── grok.ts          # Grok AI service
│   │   ├── types.ts         # Custom types
│   │   ├── auth.ts          # Auth helpers
│   │   └── database.types.ts # Auto-generated Supabase types
│   └── middleware.ts
├── public/
├── .env.local
└── README.md
