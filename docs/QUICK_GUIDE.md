# 🚀 QUICK START GUIDE - Online Academy Platform

## 📋 Overview
A multi-tenant SaaS platform for Arabic-speaking instructors to create and manage their own online academies.

### Key Features
- **Multi-tenant architecture** - Each instructor gets their own academy
- **Arabic-first** with full RTL support
- **Three personas**: Super Admin, Instructor, Student
- **Monolith architecture** - Single NestJS backend, two Next.js frontends

---

## 🏗️ Architecture

### Tech Stack
**Backend:**
- NestJS 10+ (TypeScript)
- MongoDB + Mongoose
- JWT Authentication
- Paymob Payment Integration

**Frontend:**
- Next.js 14+ (App Router)
- React 18+ with TypeScript
- TailwindCSS (RTL configured)
- React Query + Zustand
- Arabic fonts (Cairo)

### Project Structure
```
/monorepo
├── /backend                 # NestJS API (serves all)
├── /frontend-platform       # Marketing + Instructor Dashboard + Admin
├── /frontend-academy        # Student-facing academies (multi-tenant)
└── /shared                  # Shared types & translations
```

---

## 🎯 Core Concepts

### Multi-Tenancy
- Each instructor has one **Tenant** (academy)
- All data scoped by `tenantId`
- Students belong to specific tenant
- Complete data isolation

### User Roles
1. **Admin** - Platform owner, manages everything
2. **Instructor** - Academy owner, creates courses
3. **Student** - Learns in specific academy

### Revenue Model
- **Commission-based** - Platform takes percentage of instructor sales
- **Flexible tiers** - Commission decreases as revenue increases
- **Payouts** - Instructors request withdrawals

---

## 📦 Core Entities

### User
- Roles: admin, instructor, student
- Email-based authentication
- Belongs to tenant (instructors and students)

### Tenant (Academy)
- Owned by one instructor
- Has unique slug (URL)
- Branding (logo, colors, fonts)
- Subscription pricing settings

### Course
- Belongs to tenant
- Has lessons (video/PDF/text)
- One-time purchase or subscription access
- Draft/Published status

### Enrollment
- Links student to course
- Tracks progress
- Created after payment or subscription

### Transaction
- Payment records
- Commission calculated per transaction
- Links to course or subscription

### Subscription
- Monthly or annual plans
- Grants access to all courses
- Auto-renewal with recurring billing

### Exam
- MCQ, Essay, or Mixed types
- Auto-grading for MCQ
- Visibility rules based on custom fields

### Custom Fields
- Instructor-defined registration fields
- Used for student segmentation
- Powers exam visibility rules

---

## 🌐 Application Routes

### Frontend Platform (`/frontend-platform`)
**Public Marketing:**
- `/` - Landing page
- `/features` - Features page
- `/pricing` - Pricing tiers
- `/about` - About us
- `/contact` - Contact form

**Authentication:**
- `/signup` - Instructor signup
- `/login` - Instructor/Admin login
- `/verify-email` - Email verification
- `/forgot-password` - Password reset

**Instructor Dashboard:**
- `/dashboard` - Overview
- `/dashboard/academy` - Academy settings
- `/dashboard/pages` - Page builder
- `/dashboard/courses` - Course management
- `/dashboard/students` - Student management
- `/dashboard/exams` - Exam management
- `/dashboard/finance` - Revenue & payouts
- `/dashboard/domain` - Domain settings

**Admin Panel:**
- `/admin` - Admin dashboard
- `/admin/tenants` - Tenant management
- `/admin/payouts` - Payout requests
- `/admin/commissions` - Commission tiers

### Frontend Academy (`/frontend-academy`)
**Student Routes (all under `/a/[tenantSlug]`):**
- `/` - Academy home (server-driven)
- `/courses` - Course catalog
- `/courses/[slug]` - Course details
- `/auth/signup` - Student signup
- `/auth/login` - Student login
- `/checkout/course/[slug]` - Course checkout
- `/checkout/subscription` - Subscription checkout
- `/my-courses` - Enrolled courses
- `/learn/[course]/[lesson]` - Course player
- `/exams` - Available exams
- `/exams/[id]` - Take exam
- `/my-exams` - Exam history
- `/subscription` - Manage subscription
- `/profile` - Student profile

---

## 🔑 Key Features by Persona

### Super Admin
- View platform statistics
- Manage all tenants/instructors
- Configure commission tiers
- Approve/reject payout requests
- Moderate courses
- Platform settings

### Instructor
- Create and manage academy
- Build custom pages (page builder)
- Upload courses with lessons
- Create exams with questions
- Define custom student fields
- Create discount codes
- Set subscription pricing
- Track students and progress
- View revenue and request payouts
- Grade essay exams

### Student
- Register on specific academy
- Browse and purchase courses
- Subscribe for all-access
- Apply discount codes
- Watch video lessons
- Track learning progress
- Take exams
- View results and feedback
- Manage subscription

---

## 💰 Payment & Commission Flow

### Purchase Flow
1. Student selects course/subscription
2. Optional: Apply discount code
3. Payment via Paymob
4. Commission calculated based on instructor's tier
5. Transaction created with commission data
6. Enrollment created (or subscription activated)
7. Confirmation email sent

### Commission Tiers (Example)
- **Bronze**: $0 - $10,000 → 20% commission
- **Silver**: $10,001 - $50,000 → 15% commission
- **Gold**: $50,001+ → 10% commission

### Payout Flow
1. Instructor requests payout
2. Admin reviews request
3. Admin approves/rejects
4. If approved: Admin marks as paid
5. Balance deducted from instructor

---

## 🌍 Arabic & RTL Implementation

### Critical Requirements
- **All UI text in Arabic**
- **dir="rtl"** on HTML elements
- **TailwindCSS directional utilities**: `ms-`, `me-`, `start-`, `end-`
- **Arabic fonts**: Cairo (primary)
- **Date/Number formatting**: Arabic locale
- **Email templates**: Arabic with RTL HTML

### RTL Best Practices
```jsx
// ✅ Correct
<div className="ms-4 me-2 text-start">
  <button>إرسال</button>
</div>

// ❌ Wrong
<div className="ml-4 mr-2 text-left">
  <button>Submit</button>
</div>
```

---

## 📅 Implementation Phases

### Phase 1: Project Setup
- Monorepo structure
- Dependencies installation
- RTL configuration
- Arabic fonts setup

### Phase 1.5: Marketing Website
- Landing page
- Features, pricing, about, contact pages
- All in Arabic

### Phase 2: Auth + Tenant + Basic Dashboard
- Instructor signup/login
- Tenant creation
- Basic dashboard layout
- Email verification

### Phase 3: Course Management
- Course CRUD
- Lesson management (video/PDF/text)
- File uploads
- Publish/unpublish

### Phase 4: Student Flow & Enrollment
- Student auth
- Course catalog
- Course player
- Progress tracking

### Phase 5: Payments (Basic)
- Paymob integration
- Course purchase flow
- Checkout pages
- Success/failure handling

### Phase 6: Server-Driven UI
- Page builder for instructors
- Dynamic section rendering
- Academy home page customization

### Phase 7: Finance & Payouts
- Transaction history
- Revenue dashboard
- Payout requests
- Admin payout management

### Phase 8: Admin Panel
- Platform statistics
- Tenant management
- Payout approval workflow

### Phase 9: Email & Notifications
- Email templates (Arabic)
- Transactional emails
- Notification system

### Phase 10: Hardening & Polish
- Security middlewares
- Logging
- Error handling
- Performance optimization

### Phase 11: Subscriptions & Discounts
- Monthly/annual subscriptions
- Discount code system
- Recurring billing

### Phase 12: Custom Fields & Segmentation
- Custom registration fields
- Student filtering
- Field-based grouping

### Phase 13: Exams & Assessments
- Exam creation
- MCQ and essay questions
- Auto-grading
- Manual grading interface
- Visibility rules

### Phase 14: Flexible Commissions
- Commission tier configuration
- Dynamic commission calculation
- Tier progression tracking

### Phase 15: Polish & Arabic UX
- Translation review
- RTL testing
- Accessibility
- Performance tuning

### Phase 16: Domain & Subdomain (Optional)
- Subdomain setup
- Custom domain support
- DNS verification

### Phase 17: Additional Features (Future)
- Real-time notifications
- Advanced analytics
- Reviews & ratings
- Certificates
- Live sessions
- Mobile apps

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation
```bash
# Clone repository
git clone <repo-url>
cd sass-elearning-monorepo

# Install backend dependencies
cd backend
npm install

# Install platform frontend dependencies
cd ../frontend-platform
npm install

# Install academy frontend dependencies
cd ../frontend-academy
npm install

# Install shared dependencies
cd ../shared
npm install
```

### Environment Setup
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend Platform
cp frontend-platform/.env.example frontend-platform/.env

# Frontend Academy
cp frontend-academy/.env.example frontend-academy/.env
```

### Running Locally
```bash
# Terminal 1: Backend (port 3000)
cd backend
npm run start:dev

# Terminal 2: Platform Frontend (port 3001)
cd frontend-platform
npm run dev

# Terminal 3: Academy Frontend (port 3002)
cd frontend-academy
npm run dev
```

### Access Points
- **Backend API**: http://localhost:3000
- **Platform**: http://localhost:3001
- **Academy**: http://localhost:3002

---

## 📚 Key Backend Modules

### AuthModule
- User registration & login
- JWT token management
- Email verification
- Password reset

### TenantModule
- Tenant CRUD
- Settings management
- Branding configuration

### CourseModule
- Course & lesson CRUD
- Publishing logic
- File uploads

### EnrollmentModule
- Enrollment creation
- Access checking
- Progress tracking

### PaymentModule
- Paymob integration
- Transaction management
- Payout requests

### SubscriptionModule
- Subscription lifecycle
- Recurring billing
- Access grants

### DiscountModule
- Discount code management
- Validation & application

### ExamModule
- Exam & question CRUD
- Submission handling
- Auto-grading & manual grading

### CustomFieldModule
- Field definition
- Validation
- Student filtering

### CommissionModule
- Tier configuration
- Commission calculation

### UiConfigModule
- Page builder backend
- Section management

### EmailModule
- Email sending
- Arabic templates

---

## 🔐 Security Features

- JWT-based authentication
- Role-based authorization
- Multi-tenant data isolation
- Password hashing (bcrypt)
- Input validation (class-validator)
- Rate limiting
- CORS configuration
- Helmet security headers
- HTTPS in production

---

## 📊 Database Schema Highlights

### Collections
- `users` - All users (admin, instructor, student)
- `tenants` - Academies
- `courses` - Course catalog
- `lessons` - Course content
- `enrollments` - Student course access
- `progress` - Lesson completion tracking
- `transactions` - Payment records
- `subscriptions` - Subscription records
- `discounts` - Discount codes
- `exams` - Exam definitions
- `questions` - Exam questions
- `examsubmissions` - Student submissions
- `customfields` - Field definitions
- `studentprofiles` - Student data with custom fields
- `commissiontiers` - Commission configuration
- `payouts` - Payout requests
- `pages` - Page builder pages
- `pagesections` - Page sections

### Indexes
- `tenantId` on all multi-tenant collections
- `email` (unique) on users
- `slug` (unique per tenant) on courses
- Compound indexes for performance

---

## 🎨 UI Component Libraries

- **Shadcn/ui** - Base components (adapted for RTL)
- **Lucide React** - Icons (auto-flip in RTL)
- **React Hook Form** - Form management
- **Zod** - Validation schemas
- **React Query** - Data fetching
- **Zustand** - Global state

---

## 📝 Testing Strategy

- Unit tests for services
- Integration tests for APIs
- E2E tests for critical flows
- Manual RTL testing
- Arabic content review
- Payment flow testing (sandbox)

---

## 🌟 Best Practices

1. **Always scope by tenantId** in multi-tenant queries
2. **Use Arabic for all user-facing text**
3. **Test in RTL mode continuously**
4. **Validate all inputs** with DTOs
5. **Handle errors gracefully** with Arabic messages
6. **Log important operations** with correlation IDs
7. **Use transactions** for critical operations
8. **Cache frequently accessed data**
9. **Optimize database queries**
10. **Follow TypeScript strict mode**

---

## 🐛 Common Pitfalls to Avoid

❌ Using `ml-`, `mr-`, `left-`, `right-` in Tailwind
❌ Hardcoding English text
❌ Forgetting `dir="rtl"` attribute
❌ Not filtering by `tenantId`
❌ Exposing internal errors to users
❌ Not validating user input
❌ Hardcoding commission percentages
❌ Not handling payment failures
❌ Forgetting email verification
❌ Not testing in Arabic/RTL

---

## 📞 Support & Resources

- **Architecture Doc**: `/docs/ARCHITECTURE.md` (full specification)
- **Phase Docs**: `/docs/phases/PHASE_*.md` (detailed implementation guides)
- **Shared Types**: `/shared/types/` (TypeScript interfaces)
- **Translations**: `/shared/locales/ar/` (Arabic strings)

---

## 🎯 Success Criteria

A successful implementation includes:
- ✅ All features working in Arabic/RTL
- ✅ Multi-tenancy properly isolated
- ✅ Payment flow end-to-end
- ✅ Commission calculation accurate
- ✅ Email notifications sent
- ✅ Exams auto-grading correctly
- ✅ Page builder functional
- ✅ Mobile responsive
- ✅ Performance optimized
- ✅ Security hardened

---

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] SSL certificates installed
- [ ] Domain/subdomain configured
- [ ] Email provider configured
- [ ] Payment gateway (Paymob) production keys
- [ ] File storage (S3) configured
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] Security audit passed

---

**Ready to build? Start with Phase 1!** 🎉
