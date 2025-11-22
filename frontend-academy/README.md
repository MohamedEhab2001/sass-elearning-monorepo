# Frontend Academy - Multi-tenant Student Portal

Student-facing application for multi-tenant online academies. Each instructor's academy runs on this platform with custom branding.

## 🚀 Features

- **Multi-tenancy** - Each academy accessed via `/a/[tenantSlug]`
- **Server-driven UI** - Dynamic home pages built with page builder
- **Course Catalog** - Browse and purchase courses
- **Course Player** - Video lessons with progress tracking
- **Exam System** - Take exams and view results
- **Subscriptions** - All-access monthly/annual plans
- **Student Dashboard** - Enrolled courses, exam history, profile
- **Arabic-first** with full RTL support
- **Cairo Font** - Professional Arabic typography
- **Responsive** - Mobile-optimized design

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
# Development mode (runs on port 3002)
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

The application will be available at: `http://localhost:3002`

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   └── a/                        # Academy routes
│       └── [tenantSlug]/         # Multi-tenant dynamic route
│           ├── page.tsx          # Academy home (server-driven)
│           ├── courses/          # Course catalog
│           │   └── [slug]/       # Course details
│           ├── auth/             # Student authentication
│           │   ├── login/
│           │   └── signup/
│           ├── checkout/         # Purchase flows
│           │   ├── course/[slug]/
│           │   └── subscription/
│           ├── my-courses/       # Enrolled courses
│           ├── learn/            # Course player
│           │   └── [course]/[lesson]/
│           ├── exams/            # Exam list
│           │   └── [id]/         # Take exam
│           ├── my-exams/         # Exam history
│           ├── subscription/     # Manage subscription
│           └── profile/          # Student profile
├── components/                   # React components
│   ├── ui/                       # Shadcn/ui components (RTL)
│   ├── layout/                   # Layout components
│   ├── course/                   # Course components
│   ├── player/                   # Video player
│   └── exam/                     # Exam components
├── lib/                          # Utilities
├── hooks/                        # Custom React hooks
├── store/                        # Zustand stores
└── types/                        # TypeScript types
```

## 🌐 Multi-tenancy

Each academy is accessed via:
```
http://localhost:3002/a/[tenantSlug]
```

Examples:
- `http://localhost:3002/a/mohamed-academy`
- `http://localhost:3002/a/programming-hub`
- `http://localhost:3002/a/arabic-courses`

The `tenantSlug` is used to:
- Fetch tenant branding (logo, colors, fonts)
- Filter courses, students, and content
- Scope all data by tenant

## 🎨 Styling & RTL

### TailwindCSS with RTL

Always use directional utilities for RTL support:

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

- `ms-*` - margin-inline-start
- `me-*` - margin-inline-end
- `ps-*` - padding-inline-start
- `pe-*` - padding-inline-end
- `start-*` - inset-inline-start
- `end-*` - inset-inline-end
- `text-start` - text alignment start
- `text-end` - text alignment end

## 🎥 Course Player

Integrated video player with:
- Progress tracking
- Playback speed control
- Fullscreen mode
- Keyboard shortcuts
- Resume from last position

## 📝 Routes

All routes are under `/a/[tenantSlug]`:

### Public
- `/` - Academy home (server-driven)
- `/courses` - Course catalog
- `/courses/[slug]` - Course details

### Authentication
- `/auth/login` - Student login
- `/auth/signup` - Student signup

### Checkout
- `/checkout/course/[slug]` - Purchase course
- `/checkout/subscription` - Subscribe

### Student Dashboard (Protected)
- `/my-courses` - Enrolled courses
- `/learn/[course]/[lesson]` - Course player
- `/exams` - Available exams
- `/exams/[id]` - Take exam
- `/my-exams` - Exam history
- `/subscription` - Manage subscription
- `/profile` - Student profile

## 🔐 Authentication

Students authenticate per academy (tenant-scoped):
- JWT tokens stored in httpOnly cookies
- Automatic token refresh
- Protected routes redirect to login

## 📦 State Management

- **React Query** - Server state, caching
- **Zustand** - Client state (user, cart, player state)
- **React Hook Form + Zod** - Forms and validation

## 🧪 Development

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check
```

## 📝 License

Private - All Rights Reserved
