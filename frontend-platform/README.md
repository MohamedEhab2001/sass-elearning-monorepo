# Frontend Platform - Online Academy SaaS

Marketing website, Instructor Dashboard, and Admin Panel for the Academy Platform.

## 🚀 Features

- **Marketing Pages** - Landing, features, pricing, about, contact
- **Instructor Dashboard** - Course management, student analytics, finance
- **Admin Panel** - Platform management, tenant oversight, payouts
- **Arabic-first** with full RTL support
- **Cairo Font** - Professional Arabic typography
- **Responsive** - Mobile-first design with TailwindCSS
- **Type-safe** - Full TypeScript coverage

## 📋 Prerequisites

- Node.js 18+
- npm or yarn

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local
```

## ⚙️ Configuration

Edit `.env.local` file:

```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Application URLs
NEXT_PUBLIC_PLATFORM_URL=http://localhost:3001
NEXT_PUBLIC_ACADEMY_URL=http://localhost:3002
```

## 🏃 Running the Application

```bash
# Development mode (runs on port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

The application will be available at: `http://localhost:3001`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Marketing pages group
│   │   ├── features/
│   │   ├── pricing/
│   │   ├── about/
│   │   └── contact/
│   ├── (auth)/            # Auth pages group
│   │   ├── login/
│   │   ├── signup/
│   │   ├── verify-email/
│   │   └── forgot-password/
│   ├── dashboard/         # Instructor dashboard
│   │   ├── academy/       # Academy settings
│   │   ├── pages/         # Page builder
│   │   ├── courses/       # Course management
│   │   ├── students/      # Student management
│   │   ├── exams/         # Exam management
│   │   ├── finance/       # Revenue & payouts
│   │   └── domain/        # Domain settings
│   ├── admin/             # Admin panel
│   │   ├── tenants/       # Tenant management
│   │   ├── payouts/       # Payout requests
│   │   └── commissions/   # Commission tiers
│   ├── layout.tsx         # Root layout (RTL, Cairo font)
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Shadcn/ui components (RTL adapted)
│   ├── layout/            # Layout components
│   ├── forms/             # Form components
│   └── dashboard/         # Dashboard components
├── lib/                   # Utilities
│   ├── api.ts             # API client
│   ├── auth.ts            # Auth helpers
│   └── utils.ts           # General utilities
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## 🎨 Styling & RTL

### TailwindCSS with RTL

This project uses TailwindCSS with RTL support. Always use directional utilities:

```tsx
// ✅ Correct - RTL-friendly
<div className="ms-4 me-2 text-start">
  <p>محتوى عربي</p>
</div>

// ❌ Wrong - Not RTL-friendly
<div className="ml-4 mr-2 text-left">
  <p>Content</p>
</div>
```

### Available Utilities

- `ms-*` - margin-inline-start (replaces `ml-`)
- `me-*` - margin-inline-end (replaces `mr-`)
- `ps-*` - padding-inline-start (replaces `pl-`)
- `pe-*` - padding-inline-end (replaces `pr-`)
- `start-*` - inset-inline-start (replaces `left-*`)
- `end-*` - inset-inline-end (replaces `right-*`)
- `text-start` - text alignment start (replaces `text-left`)
- `text-end` - text alignment end (replaces `text-right`)

## 🌐 Internationalization

Using `next-intl` with Arabic as default:

```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('common');
  return <h1>{t('welcome')}</h1>;
}
```

## 📦 State Management

- **React Query** - Server state, caching, data fetching
- **Zustand** - Client state management
- **React Hook Form + Zod** - Form handling and validation

## 🧪 Development

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check
```

## 📝 Routes

### Marketing
- `/` - Landing page
- `/features` - Features page
- `/pricing` - Pricing tiers
- `/about` - About us
- `/contact` - Contact form

### Authentication
- `/login` - Instructor/Admin login
- `/signup` - Instructor signup
- `/verify-email` - Email verification
- `/forgot-password` - Password reset

### Instructor Dashboard
- `/dashboard` - Overview
- `/dashboard/academy` - Academy settings
- `/dashboard/pages` - Page builder
- `/dashboard/courses` - Course management
- `/dashboard/students` - Student management
- `/dashboard/exams` - Exam management
- `/dashboard/finance` - Revenue & payouts
- `/dashboard/domain` - Domain settings

### Admin Panel
- `/admin` - Admin dashboard
- `/admin/tenants` - Tenant management
- `/admin/payouts` - Payout requests
- `/admin/commissions` - Commission tiers

## 📝 License

Private - All Rights Reserved
