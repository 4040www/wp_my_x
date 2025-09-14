# My-X – Social Media Platform

A modern social media application built with **Next.js 15**, featuring real-time interactions, notification systems, and advanced search capabilities.

## 🌐 Live Demo

👉 [https://wp-my-x.vercel.app/](https://wp-my-x.vercel.app/)

---

## 🚀 Quick Start

### Prerequisites

* Node.js 18+
* npm or yarn
* PostgreSQL database (Supabase recommended)

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/4040www/wp_my_x.git
cd my-x

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your own configuration

# Generate Prisma client
npx prisma generate

# Apply database schema
npx prisma db push

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

## 📦 Tech Stack

### Core

* **Next.js 15.5.2** – Full-stack React framework
* **React 19.1.0** – UI library
* **TypeScript** – Type safety

### Database & ORM

* **Prisma 6.15.0** – Type-safe ORM
* **PostgreSQL** – Relational database
* **NextAuth.js** – Authentication & session management

### State & Data Fetching

* **SWR** – Data fetching and caching
* **React Hooks** – Local state management

### Real-time

* **Pusher** – Real-time updates and notifications
* **pusher-js** – Client-side integration

### UI & Styling

* **Tailwind CSS** – Utility-first styling
* **Headless UI** – Accessible, unstyled components
* **Lucide React** – Icon library

### Deployment

* **Vercel** – Hosting and deployment platform

## ✨ Features

### 🔐 Authentication

* Google OAuth login / GitHub OAuth login
* Secure session management
* User profile handling

### 📝 Content Management

* Create posts and reposts
* Real-time likes and comments
* Content search
* **Markdown support** with syntax highlighting
* **Pagination & infinite scroll**

### 🔔 Notifications

* Like notifications
* Comment notifications
* Repost notifications
* Instant UI updates
* **Optimistic updates** for better UX

### 🔍 Search

* Search by author
* Search by content
* Live search results

### 📱 Responsive Design

* Mobile-first optimization
* Modern UI
* Smooth user experience

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication
│   │   ├── posts/         # Post APIs
│   │   ├── search/        # Search APIs
│   │   └── notifications/ # Notifications APIs
│   ├── login/             # Login page
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
│   ├── Header.tsx
│   ├── PostCard.tsx
│   ├── PostModal.tsx
│   ├── CommentInput.tsx
│   └── PostActions.tsx
├── hooks/                 # Custom React hooks
│   ├── useSWRFeed.ts
│   ├── useSWRSearch.ts
│   ├── useSWRNotifications.ts
│   ├── useRealtimePosts.ts
│   └── useRealtimeNotifications.ts
├── lib/                   # Utilities
│   ├── prisma.ts
│   ├── pusher.ts
│   ├── swr.ts
│   └── notifications.ts
└── types/                 # TypeScript types
    └── post.ts

prisma/
├── schema.prisma          # Database schema
└── migrations/            # Database migrations

public/
├── icons/                 # Icons
└── images/                # Static images
```

## 🗄️ Database Design

### Models

* **User** – User profiles
* **Post** – Posts and reposts
* **Comment** – Comments on posts
* **Notification** – Event notifications
* **Account/Session** – Managed by NextAuth

### Relationships

* A user can create multiple posts
* Posts can have multiple comments
* Supports repost functionality
* Real-time notifications

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"

# Pusher
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-cluster"
PUSHER_APP_ID="your-app-id"
PUSHER_SECRET="your-secret"
```

## 🚀 Deployment

### Deploying to Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically

### Environment Configuration

Set all required variables via the Vercel dashboard.

## 📝 Development Guide

### Adding Features

1. Create a component under `src/components/`
2. Add logic in `src/hooks/`
3. Create an API route in `src/app/api/`
4. Update Prisma schema if needed

### Database Changes

```bash
# After modifying schema.prisma
npx prisma db push

# Create a new migration
npx prisma migrate dev --name your-migration-name
```

---

**Support**: For issues, please check the GitHub Issues section or contact the development team.
