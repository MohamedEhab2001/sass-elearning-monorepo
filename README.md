# 🎓 Multi-tenant Online Academy SaaS Platform

A comprehensive, Arabic-first SaaS platform for instructors to create and manage their own online academies with full multi-tenancy support.

## 📋 Overview

This platform enables Arabic-speaking instructors to launch their own branded online academies with courses, exams, subscriptions, and payment processing - all with complete data isolation and RTL support.

### Key Features

- **Multi-tenant Architecture** - Each instructor gets their own isolated academy
- **Arabic-First** - Full RTL support with Cairo font
- **Monolith Backend** - Single NestJS API serving all applications
- **Dual Frontend** - Separate apps for platform and student portals
- **Comprehensive Course Management** - Videos, PDFs, text lessons
- **Exam System** - MCQ, essay, and mixed exams with auto-grading
- **Payment Integration** - Paymob payment gateway
- **Subscription Plans** - Monthly and annual all-access subscriptions
- **Page Builder** - Dynamic, server-driven academy home pages
- **Commission System** - Flexible revenue sharing with instructors

---

## 🏗️ Architecture

### Monorepo Structure

```
sass-elearning-monorepo/
├── backend/                 # NestJS API (MongoDB + Mongoose)
├── frontend-platform/       # Next.js - Marketing + Instructor Dashboard + Admin
├── frontend-academy/        # Next.js - Student Portal (Multi-tenant)
├── shared/                  # Shared TypeScript types + Arabic translations
└── docs/                    # Documentation
```

### Tech Stack

**Backend:**
- NestJS 10+
- MongoDB + Mongoose
- JWT Authentication
- Paymob Payment Integration

**Frontend:**
- Next.js 14+ (App Router)
- React 18+ with TypeScript
- TailwindCSS (RTL configured)
- React Query + Zustand
- Cairo Font (Arabic)

---

## 📦 Applications

### 1. Backend (`/backend`)
- Single NestJS monolith serving all frontends
- Multi-tenant data isolation
- Role-based access control (Admin, Instructor, Student)
- RESTful APIs for all features
- **Port:** 3000

### 2. Frontend Platform (`/frontend-platform`)
- Marketing website (landing, features, pricing)
- Instructor dashboard (course management, analytics, finance)
- Admin panel (tenant management, payouts, commissions)
- **Port:** 3001

### 3. Frontend Academy (`/frontend-academy`)
- Student-facing multi-tenant academies
- Dynamic branding per academy
- Course catalog, player, exams
- Student dashboard and profile
- **Port:** 3002

### 4. Shared (`/shared`)
- TypeScript type definitions
- Arabic translations (i18n)
- Constants and utilities
- Shared across all apps

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** 6+ ([Download](https://www.mongodb.com/try/download/community))
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sass-elearning-monorepo

# Install all dependencies (root + all workspaces)
npm run install:all

# Or install individually
npm install                  # Root dependencies
cd backend && npm install    # Backend
cd ../frontend-platform && npm install
cd ../frontend-academy && npm install
cd ../shared && npm install
```

### Environment Setup

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI, JWT secret, etc.

# Frontend Platform
cp frontend-platform/.env.example frontend-platform/.env.local

# Frontend Academy
cp frontend-academy/.env.example frontend-academy/.env.local
```

### Running the Platform

```bash
# Run all applications concurrently
npm run dev:all

# Or run individually in separate terminals:

# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Platform Frontend
npm run dev:platform

# Terminal 3: Academy Frontend
npm run dev:academy
```

### Access Points

- **Backend API:** http://localhost:3000/api
- **Platform (Marketing + Dashboard):** http://localhost:3001
- **Academy (Student Portal):** http://localhost:3002

---

## 📁 Detailed Structure

### Backend Structure

```
backend/src/
├── common/              # Shared utilities, guards, decorators
├── config/              # Configuration files
├── modules/             # Feature modules
│   ├── auth/            # Authentication & JWT
│   ├── users/           # User management
│   ├── tenants/         # Tenant (Academy) management
│   ├── courses/         # Course CRUD
│   ├── lessons/         # Lesson management
│   ├── enrollments/     # Student enrollments
│   ├── payments/        # Payment processing
│   ├── subscriptions/   # Subscription management
│   ├── exams/           # Exam system
│   └── ...              # Other modules
└── database/            # Schemas
```

### Frontend Platform Structure

```
frontend-platform/src/
├── app/
│   ├── (marketing)/     # Public pages
│   ├── (auth)/          # Login, signup
│   ├── dashboard/       # Instructor dashboard
│   └── admin/           # Admin panel
├── components/          # React components
├── lib/                 # Utilities & API client
├── hooks/               # Custom hooks
└── store/               # Zustand stores
```

### Frontend Academy Structure

```
frontend-academy/src/
├── app/
│   └── a/[tenantSlug]/  # Multi-tenant routes
│       ├── courses/     # Course catalog
│       ├── auth/        # Student auth
│       ├── checkout/    # Payment flows
│       ├── learn/       # Course player
│       └── exams/       # Exam system
├── components/          # React components
├── lib/                 # Utilities
└── store/               # Zustand stores
```

---

## 🛠️ Development

### Common Commands

```bash
# Development
npm run dev:all              # Run all apps
npm run dev:backend          # Backend only
npm run dev:platform         # Platform only
npm run dev:academy          # Academy only

# Build
npm run build:all            # Build all apps
npm run build:backend
npm run build:platform
npm run build:academy

# Lint & Type Check
npm run lint:all             # Lint all projects
npm run type-check:all       # TypeScript check

# Clean
npm run clean                # Remove node_modules and build artifacts
```

---

## 🌍 Multi-Tenancy

### How it Works

1. Each instructor creates an academy with a unique **slug**
2. Students access academy via: `http://localhost:3002/a/[slug]`
3. All data (courses, students, enrollments) scoped by `tenantId`
4. Complete data isolation between academies

### Example URLs

- `http://localhost:3002/a/mohamed-academy`
- `http://localhost:3002/a/programming-hub`
- `http://localhost:3002/a/arabic-courses`

---

## 🎨 Arabic & RTL Support

### Critical Requirements

- ✅ ALL UI text in Arabic
- ✅ `dir="rtl"` on HTML elements
- ✅ TailwindCSS directional utilities (`ms-`, `me-`, `start-`, `end-`)
- ✅ Cairo font family
- ✅ Arabic date/number formatting
- ✅ Email templates in Arabic with RTL HTML

### RTL Best Practices

```tsx
// ✅ Correct - RTL-friendly
<div className="ms-4 me-2 text-start">
  <p>محتوى عربي</p>
</div>

// ❌ Wrong - NOT RTL-friendly
<div className="ml-4 mr-2 text-left">
  <p>Content</p>
</div>
```

### Available Utilities

| Standard | RTL-Friendly | Description |
|----------|--------------|-------------|
| `ml-*` | `ms-*` | margin-inline-start |
| `mr-*` | `me-*` | margin-inline-end |
| `pl-*` | `ps-*` | padding-inline-start |
| `pr-*` | `pe-*` | padding-inline-end |
| `left-*` | `start-*` | inset-inline-start |
| `right-*` | `end-*` | inset-inline-end |
| `text-left` | `text-start` | text alignment |
| `text-right` | `text-end` | text alignment |

---

## 💰 Payment Flow

1. Student selects course or subscription
2. Applies discount code (optional)
3. Redirects to Paymob checkout
4. Commission calculated based on instructor tier
5. Transaction recorded
6. Enrollment/subscription activated
7. Confirmation email sent

### Commission Tiers (Example)

- **Bronze:** $0 - $10,000 → 20% commission
- **Silver:** $10,001 - $50,000 → 15% commission
- **Gold:** $50,001+ → 10% commission

---

## 📚 Core Entities

- **User** - Admin, Instructor, or Student
- **Tenant** - Academy (one per instructor)
- **Course** - Contains lessons, pricing, status
- **Lesson** - Video, PDF, or text content
- **Enrollment** - Links student to course
- **Progress** - Tracks lesson completion
- **Transaction** - Payment records
- **Subscription** - Monthly/annual plans
- **Exam** - MCQ, essay, or mixed
- **Question** - Exam questions
- **ExamSubmission** - Student answers and scores

---

## 🔐 Authentication & Authorization

### Roles

1. **Admin** - Platform owner, manages everything
2. **Instructor** - Academy owner, creates courses
3. **Student** - Enrolled in specific academy

### JWT Tokens

- Stored in httpOnly cookies
- Includes: `userId`, `role`, `tenantId`
- 7-day expiration (configurable)

---

## 📝 Shared Types

All TypeScript types are defined in `/shared/types/`:

- `user.types.ts` - User-related types
- `tenant.types.ts` - Academy/tenant types
- `course.types.ts` - Course and lesson types
- `enrollment.types.ts` - Enrollment and progress
- `payment.types.ts` - Transactions
- `subscription.types.ts` - Subscription plans
- `exam.types.ts` - Exams and questions
- `common.types.ts` - Shared utilities

Import in any app:

```typescript
import { IUser, ICourse, ITenant } from '@academy/shared';
```

---

## 🌐 Internationalization (i18n)

All translations in `/shared/locales/ar/`:

- `common.json` - General UI
- `auth.json` - Authentication
- `dashboard.json` - Dashboard labels
- `courses.json` - Course-related
- `exams.json` - Exam system
- `payments.json` - Payment flows
- `errors.json` - Error messages

Using `next-intl` in Next.js:

```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('common');
  return <h1>{t('welcome')}</h1>; // مرحباً
}
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage

# Frontend tests
cd frontend-platform
npm run test

cd ../frontend-academy
npm run test
```

---

## 🚀 Production Build

```bash
# Build all applications
npm run build:all

# Start production servers
npm run start:backend
npm run start:platform
npm run start:academy
```

---

## 📦 Database

### MongoDB Setup

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:6

# Or install locally
# https://www.mongodb.com/docs/manual/installation/
```

### Collections

- `users` - All users
- `tenants` - Academies
- `courses` - Course catalog
- `lessons` - Lesson content
- `enrollments` - Student enrollments
- `progress` - Lesson tracking
- `transactions` - Payments
- `subscriptions` - Subscription records
- `exams` - Exam definitions
- `questions` - Questions
- `examsubmissions` - Student submissions

---

## 🎯 Implementation Phases

This project is built in phases:

1. ✅ **Phase 1** - Project setup (current)
2. **Phase 2** - Auth + Tenant + Basic Dashboard
3. **Phase 3** - Course Management
4. **Phase 4** - Student Flow & Enrollment
5. **Phase 5** - Payments (Basic)
6. **Phase 6** - Server-Driven UI
7. **Phase 7** - Finance & Payouts
8. **Phase 8** - Admin Panel
9. **Phase 9** - Email & Notifications
10. **Phase 10** - Hardening & Polish
11. **Phase 11** - Subscriptions & Discounts
12. **Phase 12** - Custom Fields & Segmentation
13. **Phase 13** - Exams & Assessments
14. **Phase 14** - Flexible Commissions
15. **Phase 15** - Polish & Arabic UX
16. **Phase 16** - Domain & Subdomain (Optional)
17. **Phase 17** - Additional Features (Future)

---

## 📖 Documentation

- **Quick Guide:** `/docs/QUICK_GUIDE.md`
- **Full Architecture:** `/docs/ARCHITECTURE.md`
- **Phase Guides:** `/docs/PHASE_*.md`
- **Backend README:** `/backend/README.md`
- **Platform README:** `/frontend-platform/README.md`
- **Academy README:** `/frontend-academy/README.md`

---

## 🤝 Contributing

1. Follow Arabic-first principles
2. Use RTL-friendly TailwindCSS utilities
3. Maintain TypeScript strict mode
4. Write descriptive commit messages in English
5. Test all features in RTL mode

---

## 📝 License

Private - All Rights Reserved

---

## 🆘 Support

For questions or issues:
1. Check the `/docs` folder
2. Review individual README files
3. Contact the development team

---

**Built with ❤️ for the Arabic-speaking education community**
