ONLINE ACADEMY PLATFORM - COMPREHENSIVE BUILD SPECIFICATION
You are a senior full-stack engineer helping me build a full SaaS "online academy platform" as a MONOLITH, not microservices.
I want you to design and implement the code step-by-step across backend + frontend.
You MUST respect the architecture and constraints below and never switch to microservices.
====================================================
0. PRODUCT IDEA – DETAILED VISION
We are building a multi-tenant SaaS platform for teachers / instructors who want their own online academy.
Core idea:

Each instructor signs up on our main platform.
Our system automatically creates for them:

A private dashboard to manage their academy.
A public website (landing + course catalog + checkout) for their students.


Students don't sign up on the main platform. They sign up on the teacher's academy site only.
All data is isolated per instructor/tenant (multi-tenant).

There are 3 main personas:

Super Admin (platform owner)
Instructor (teacher / academy owner)
Student (end user)

High-level flows:

Super Admin:

Manages the whole platform (tenants, instructors, usage, payouts, commissions).
Configures flexible commission tiers that decrease as instructor sales increase.


Instructor:

Creates an academy.
Designs their landing pages using a page builder.
Uploads courses with video/PDF/text lessons.
Sets subscription pricing and creates pricing pages.
Creates discount codes for courses and subscriptions.
Defines custom registration fields for student segmentation.
Creates and manages exams (MCQ/Essay) with custom visibility rules.
Sells courses (one-time purchase OR monthly subscription).
Tracks students and their progress.
Gets paid (minus our commission).


Student:

Discovers a specific instructor's academy.
Registers on that academy only (fills custom fields).
Buys individual courses OR subscribes monthly for all-access.
Applies discount codes at checkout.
Watches courses and tracks their own progress.
Takes exams and views results.



====================================================
0.3 LANGUAGE & LOCALIZATION REQUIREMENTS
🔴 CRITICAL: This is an Arabic-first SaaS platform targeting Arabic-speaking markets (Egypt, Gulf, MENA).
RTL/LTR Support Requirements:

Full Bidirectional Support:

All three applications MUST support RTL (Right-to-Left) for Arabic
LTR (Left-to-Right) for potential English version (future)
Use dir="rtl" attribute appropriately
TailwindCSS directional utilities (ms-, me-, start-, end- instead of ml-, mr-, left-, right-)


Default Language:

Primary language: Arabic (ar)
All UI text, labels, buttons, messages in Arabic
All default content in Arabic
All email templates in Arabic


Typography & Fonts:

Use Arabic-friendly fonts (e.g., Cairo, Tajawal, Almarai, IBM Plex Sans Arabic)
Proper font sizes for Arabic readability (slightly larger than English)
Line height adjustments for Arabic text (1.7-1.8 for body text)
Font weights: support for 400, 500, 600, 700


Date & Number Formatting:

Use Arabic/Eastern Arabic numerals where appropriate (٠١٢٣٤٥٦٧٨٩)
Option to use Western numerals (0-9) for prices and technical data
Date formats following Arabic conventions (e.g., ١٥ يناير ٢٠٢٤)
Currency: EGP (Egyptian Pound) as default - "ج.م" or "جنيه مصري"
Number formatting: Arabic comma/decimal conventions


Form Validation Messages:

All validation errors in Arabic
User-friendly Arabic error messages
Arabic placeholders in forms
Clear, concise error messaging


Database Content:

All user-facing content stored in Arabic
Support for Arabic characters in all text fields
Proper text encoding (UTF-8)
MongoDB collation: 'ar' for proper Arabic sorting


UI/UX Considerations:

Navigation menus flow right-to-left
Breadcrumbs flow right-to-left
Forms: labels on the right, inputs on the left
Icons that imply direction should flip (arrows, chevrons)
Progress bars fill from right to left
Checkboxes and radio buttons on the right of labels



Implementation Notes:

Frontend: Use next-intl or react-i18next for i18n (even if starting with Arabic only)
Backend: Store language preference per tenant (for future multi-language support)
Design all components with RTL in mind from day one
Test all UI in RTL mode continuously
Avoid hardcoded English text anywhere in code
Use semantic HTML with proper lang and dir attributes

Future Expansion:

Design system should support adding English later
Language switcher can be added in Phase 16+
But START with Arabic/RTL as primary and only language

====================================================
0.5 PROJECT STRUCTURE – THREE SEPARATE ENTITIES
CRITICAL: This is a MONOREPO containing THREE distinct applications:

Backend API (/backend)

Single NestJS monolith serving ALL APIs
Serves both instructor platform AND student academies
One codebase, one deployment
All responses support Arabic content


Marketing & Instructor Platform (/frontend-platform)

Next.js application for:

Public marketing site (landing, pricing, features, about, contact) - sells platform to instructors
Instructor dashboard and tools
Admin panel


Deployed at: platform.yourdomain.com
Full RTL support
All content in Arabic


Student-Facing Academy (/frontend-academy)

Separate Next.js application for student experience
Multi-tenant: serves ALL instructor academies
Uses tenantSlug or custom domain routing
Deployed at: *.yourdomain.com or custom domains
Pages: academy home, courses, login, course player, checkout, exams
Full RTL support
Content in Arabic (customizable per tenant)



Why separate frontends?

Different deployment strategies (platform vs multi-tenant academies)
Different performance optimization needs
Cleaner separation of concerns
Independent scaling and caching strategies
Different branding/theming per application
Separate SEO optimization strategies

Monorepo Structure:
/monorepo
├── /backend                    # NestJS API monolith
│   ├── /src
│   │   ├── /modules           # Feature modules
│   │   ├── /common            # Shared utilities
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
├── /frontend-platform          # Marketing + Instructor Dashboard + Admin
│   ├── /src
│   │   ├── /app               # Next.js App Router
│   │   ├── /components        # Shared components
│   │   ├── /lib               # Utilities
│   │   └── /styles
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.js
├── /frontend-academy           # Student-facing academies
│   ├── /src
│   │   ├── /app               # Next.js App Router
│   │   ├── /components        # Shared components
│   │   ├── /lib               # Utilities
│   │   └── /styles
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.js
├── /shared                     # Shared TypeScript types
│   ├── /types                 # Type definitions
│   ├── /constants             # Constants
│   ├── /locales               # Translations
│   │   └── /ar                # Arabic translations
│   │       ├── common.ts
│   │       ├── auth.ts
│   │       ├── courses.ts
│   │       ├── exams.ts
│   │       └── errors.ts
│   └── /utils                 # Shared utilities
├── package.json                # Root package.json (optional: for monorepo tools)
├── .env.example
├── .gitignore
└── README.md
====================================================

ARCHITECTURE & TECH STACK (MONOLITH)
====================================================

IMPORTANT: Backend is a single NestJS monolith with modules, NOT microservices.
Tech Stack:
Backend:

NestJS 10+ (monolith)
TypeScript 5+
MongoDB (Mongoose) with UTF-8 encoding and Arabic collation
JWT auth (jsonwebtoken + passport-jwt)
RESTful APIs
Class-validator for DTOs
Bcrypt for password hashing

Frontend (Both Apps):

Next.js 14+ (App Router)
React 18+
TypeScript 5+
TailwindCSS 3+ (with RTL support via dir utilities)
Arabic fonts: Cairo (recommended), Tajawal, or Almarai
next-intl or react-i18next for internationalization
React Query (TanStack Query v5) for data fetching
Zustand for client-side global state
React Hook Form for forms
Zod for form validation
Axios for HTTP clients
date-fns with Arabic locale for date formatting

Styling & UI:

TailwindCSS with custom RTL configuration
Shadcn/ui components (adapted for RTL and Arabic)
Lucide React icons (will flip automatically in RTL)
Custom Arabic typography scale

Other Services:

Paymob integration for payments (Egypt)
Email provider: ZeptoMail or SMTP (with Arabic HTML templates)
File storage: Local storage in dev (S3-compatible interface for production)
Domain/subdomain support for each tenant (phase 2, but design for it)

Development Tools:

ESLint + Prettier
Husky for git hooks
TypeScript strict mode
Environment variables management

The NestJS backend is modular internally:
Core Modules:

AuthModule - Authentication & JWT
UserModule - User management
TenantModule - Tenant/Academy management
CourseModule - Course & Lesson management
EnrollmentModule - Student enrollments
ProgressModule - Learning progress tracking
PaymentModule - Paymob integration
SubscriptionModule - Monthly/annual subscriptions
DiscountModule - Discount codes
ExamModule - Exams & assessments
CustomFieldModule - Custom student fields
CommissionModule - Flexible commission tiers
UiConfigModule - Server-driven pages
DomainModule - Custom domains (phase 2)
AdminModule - Admin operations
EmailModule - Email service abstraction

But it is still ONE NestJS app and ONE process (monolith).
====================================================
2. CORE DOMAIN & MULTI-TENANCY MODEL
Multi-tenancy is based on a tenantId representing an academy/instructor.

Each Instructor has exactly one primary Tenant (academy).
All "academy data" is scoped by tenantId:

Courses
Lessons
Pages, UI config
Students
Enrollments
Subscriptions
Exams
Custom fields
Transactions, payouts



Core Entities:
User:
typescript{
  id: string (ObjectId)
  name: string
  email: string (unique, lowercase, indexed)
  passwordHash: string
  role: 'admin' | 'instructor' | 'student'
  tenantId?: string (ObjectId - for instructor: their own tenant; for student: the academy they belong to)
  emailVerified: boolean
  emailVerificationToken?: string
  passwordResetToken?: string
  passwordResetExpires?: Date
  createdAt: Date
  updatedAt: Date
}
Tenant (Academy):
typescript{
  id: string (ObjectId)
  ownerUserId: string (ObjectId, indexed)
  name: string
  slug: string (unique, indexed, lowercase, URL-friendly)
  description?: string
  branding: {
    logo?: string (URL)
    primaryColor: string (hex)
    secondaryColor?: string (hex)
    fontFamily?: string
  }
  plan: 'starter' | 'pro' | 'scale'
  subscriptionPricing?: {
    enabled: boolean
    monthly: number
    annual: number
    currency: string (default: 'EGP')
  }
  status: 'active' | 'suspended' | 'pending'
  settings: {
    allowRegistration: boolean
    requireEmailVerification: boolean
    defaultLanguage: string (default: 'ar')
  }
  domain?: {
    subdomain?: string
    customDomain?: string
    verificationToken?: string
    status: 'pending' | 'verified' | 'failed'
  }
  createdAt: Date
  updatedAt: Date
}
Course:
typescript{
  id: string (ObjectId)
  tenantId: string (ObjectId, indexed)
  instructorId: string (ObjectId, indexed)
  title: string
  slug: string (unique per tenant)
  description: string
  thumbnail?: string (URL)
  price: number
  currency: string (default: 'EGP')
  status: 'draft' | 'published'
  category?: string
  tags: string[]
  level: 'beginner' | 'intermediate' | 'advanced'
  language: string (default: 'ar')
  duration?: number (in minutes)
  metadata: {
    totalLessons?: number
    totalVideos?: number
    totalDuration?: number
  }
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}
Lesson:
typescript{
  id: string (ObjectId)
  courseId: string (ObjectId, indexed)
  tenantId: string (ObjectId, indexed)
  type: 'video' | 'pdf' | 'text' | 'quiz'
  title: string
  description?: string
  order: number
  contentURL?: string (for video/pdf)
  textContent?: string (for text lesson)
  duration?: number (in minutes, for video)
  isFree: boolean (preview lesson)
  resources?: Array<{
    name: string
    url: string
    type: string
  }>
  createdAt: Date
  updatedAt: Date
}
Enrollment:
typescript{
  id: string (ObjectId)
  tenantId: string (ObjectId, indexed)
  studentUserId: string (ObjectId, indexed)
  courseId: string (ObjectId, indexed)
  status: 'active' | 'completed' | 'refunded' | 'expired'
  accessType: 'purchase' | 'subscription'
  purchaseTransactionId?: string (ObjectId)
  subscriptionId?: string (ObjectId)
  progress: {
    completedLessons: number
    totalLessons: number
    percentage: number
    lastAccessedAt?: Date
  }
  completedAt?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}
Progress:
typescript{
  id: string (ObjectId)
  enrollmentId: string (ObjectId, indexed)
  lessonId: string (ObjectId, indexed)
  studentUserId: string (ObjectId, indexed)
  completed: boolean
  completedAt?: Date
  watchTime?: number (seconds)
  lastPosition?: number (seconds, for video)
  createdAt: Date
  updatedAt: Date
}
Transaction (Payments):
typescript{
  id: string (ObjectId)
  tenantId: string (ObjectId, indexed)
  studentUserId: string (ObjectId, indexed)
  type: 'course' | 'subscription'
  courseId?: string (ObjectId, for type='course')
  subscriptionId?: string (ObjectId, for type='subscription')
  amount: number (original amount)
  finalAmount: number (after discount)
  currency: string
  commissionPercentage: number (calculated at time of transaction)
  commissionAmount: number
  instructorEarnings: number (finalAmount - commissionAmount)
  status: 'pending' | 'success' | 'failed' | 'refunded'
  provider: 'paymob'
  providerTransactionId?: string
  providerReferenceId?: string
  discountId?: string (ObjectId, if discount applied)
  discountAmount?: number
  paymentMethod?: string
  metadata?: any
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}
Subscription:
typescript{
  id: string (ObjectId)
  tenantId: string (ObjectId, indexed)
  studentUserId: string (ObjectId, indexed)
  plan: 'monthly' | 'annual'
  price: number
  currency: string
  status: 'active' | 'cancelled' | 'expired' | 'past_due'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  autoRenew: boolean
  lastPaymentTransactionId?: string (ObjectId)
  cancelReason?: string
  createdAt: Date
  updatedAt: Date
  cancelledAt?: Date
  expiredAt?: Date
}
Discount:
typescript{
  id: string (ObjectId)
  tenantId: string (ObjectId, indexed)
  code: string (unique per tenant, uppercase)
  name: string
  description?: string
  type: 'course' | 'subscription' | 'all'
  applicableTo: string[] (courseIds, if course-specific) or null (all courses)
  discountType: 'percentage' | 'fixed'
  value: number
  maxUses?: number
  usedCount: number (default: 0)
  validFrom?: Date
  validTo?: Date
  status: 'active' | 'inactive'
  createdBy: string (ObjectId - instructorId)
  createdAt: Date
  updatedAt: Date
}
DiscountUsage:
typescript{
  id: string (ObjectId)
  discountId: string (ObjectId, indexed)
  transactionId: string (ObjectId, indexed)
  studentUserId: string (ObjectId, indexed)
  tenantId: string (ObjectId, indexed)
  discountAmount: number
  usedAt: Date
}
Exam:
typescript{
  id: string (ObjectId)
  tenantId: string (ObjectId, indexed)
  courseId?: string (ObjectId, optional - can be standalone)
  title: string
  description?: string
  instructions?: string
  type: 'mcq' | 'essay' | 'mixed'
  totalPoints: number
  passingScore: number
  duration?: number (minutes, null = unlimited)
  maxAttempts?: number (null = unlimited)
  availableFrom?: Date
  availableTo?: Date
  visibilityRules?: {
    customField: string
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
    value: any
  }[]
  showResultsImmediately: boolean
  shuffleQuestions: boolean
  status: 'draft' | 'published'
  createdBy: string (ObjectId - instructorId)
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}
Question:
typescript{
  id: string (ObjectId)
  examId: string (ObjectId, indexed)
  tenantId: string (ObjectId, indexed)
  type: 'mcq' | 'essay' | 'true_false'
  questionText: string
  explanation?: string (shown after submission)
  order: number
  points: number
  options?: string[] (for MCQ/true_false)
  correctAnswer?: string | number (for MCQ/true_false)
  metadata?: any
  createdAt: Date
  updatedAt: Date
}
ExamSubmission:
typescript{
  id: string (ObjectId)
  examId: string (ObjectId, indexed)
  studentUserId: string (ObjectId, indexed)
  tenantId: string (ObjectId, indexed)
  attemptNumber: number
  answers: {
    questionId: string
    answer: any
    isCorrect?: boolean (for MCQ)
    pointsEarned?: number
  }[]
  totalScore?: number (null until graded)
  percentage?: number
  passed?: boolean
  status: 'in_progress' | 'submitted' | 'graded'
  startedAt: Date
  submittedAt?: Date
  gradedAt?: Date
  gradedBy?: string (ObjectId - instructorId)
  feedback?: string
  timeSpent?: number (seconds)
  createdAt: Date
  updatedAt: Date
}
CustomField:
typescript{
  id: string (ObjectId)
  tenantId: string (ObjectId, indexed)
  fieldName: string (unique per tenant, snake_case)
  label: string (Arabic label for display)
  fieldType: 'text' | 'select' | 'number' | 'date' | 'email' | 'phone'
  options?: string[] (for select type)
  required: boolean
  order: number
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  helpText?: string
  createdAt: Date
  updatedAt: Date
}
StudentProfile:
typescript{
  id: string (ObjectId)
  userId: string (ObjectId, unique, indexed)
  tenantId: string (ObjectId, indexed)
  customFields: Record<string, any> (fieldName → value)
  avatar?: string
  bio?: string
  phone?: string
  dateOfBirth?: Date
  createdAt: Date
  updatedAt: Date
}
CommissionTier:
typescript{
  id: string (ObjectId)
  minRevenue: number (inclusive)
  maxRevenue?: number (exclusive, null = unlimited)
  commissionPercentage: number (e.g., 20 for 20%)
  order: number
  name: string (e.g., 'Bronze', 'Silver', 'Gold')
  description?: string
  createdAt: Date
  updatedAt: Date
}
Payout:
typescript{
  id: string (ObjectId)
  tenantId: string (ObjectId, indexed)
  instructorUserId: string (ObjectId, indexed)
  amount: number (amount requested)
  currency: string
  commissionTierAtRequest: {
    tierId: string
    tierName: string
    percentage: number
  }
  calculationBreakdown: {
    totalRevenue: number
    totalCommission: number
    availableBalance: number
    previousPayouts: number
  }
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected'
  paymentMethod?: string
  paymentDetails?: any (bank account, etc.)
  notes?: string
  rejectionReason?: string
  requestedAt: Date
  approvedAt?: Date
  paidAt?: Date
  rejectedAt?: Date
  approvedBy?: string (ObjectId - admin)
  createdAt: Date
  updatedAt: Date
}
Page (Server-driven UI):
typescript{
  id: string (ObjectId)
  tenantId: string (ObjectId, indexed)
  name: string
  path: string (e.g., '/', '/about', '/contact')
  slug: string
  status: 'draft' | 'published'
  isHome: boolean
  template?: string (template identifier)
  seo: {
    title: string
    description?: string
    keywords?: string[]
    ogImage?: string
  }
  showInNavbar: boolean
  navLabel?: string
  navOrder?: number
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}
PageSection:
typescript{
  id: string (ObjectId)
  tenantId: string (ObjectId, indexed)
  pageId: string (ObjectId, indexed)
  type: 'hero' | 'features' | 'courses' | 'testimonials' | 'faq' | 'cta' | 'content' | 'pricing' | 'contact'
  order: number
  visible: boolean
  props: Record<string, any> (JSON config for the block)
  // Example props for 'hero':
  // {
  //   title: 'مرحباً بك',
  //   subtitle: 'ابدأ رحلتك التعليمية',
  //   backgroundImage: 'url',
  //   ctaText: 'ابدأ الآن',
  //   ctaLink: '/courses'
  // }
  createdAt: Date
  updatedAt: Date
}
====================================================
3. REQUIRED FEATURES – BY PERSONA
3.1 Super Admin Features (Platform Owner)
Admin Auth:

Login as admin (email/password, JWT based)
No signup - admins are created manually in database
Session management

Admin Dashboard:

Overview KPIs:

Total number of tenants/instructors
Total number of students across all academies
Total revenue (all transactions)
Total commission earned
Total payouts (pending, approved, paid)
Growth charts (tenants, students, revenue over time)


Quick actions: View pending payouts, recent signups

Tenant Management:

List all tenants with search and filters:

By status (active/suspended)
By plan (starter/pro/scale)
By creation date
Search by name/email/slug


View tenant details:

Owner information
Domain/subdomain
Plan and features
Usage statistics (students, courses, revenue)
Total revenue generated
Current commission tier


Suspend / activate tenant
View tenant's courses and students

Instructors:

List all instructor users
Search by email/name
View individual instructor details:

Profile information
Academy details
Total revenue generated
Current commission tier
Revenue to next tier
Number of students
Number of courses


Contact instructor

Payout Management:

View all payout requests
Filter by status (pending/approved/paid/rejected)
View payout details:

Instructor information
Amount requested
Current commission tier applied
Detailed calculation breakdown
Request date


Approve/reject payout with notes
Mark payout as paid
View payout history

Commission Configuration:

Configure commission tiers (tiered structure):

Create new tier
Edit existing tier
Set revenue thresholds (min/max)
Set commission percentage
Reorder tiers


Example structure:

Bronze: EGP 0 - EGP 10,000 → 20% commission
Silver: EGP 10,001 - EGP 50,000 → 15% commission
Gold: EGP 50,001+ → 10% commission


Preview how tiers affect instructor earnings
View instructors per tier

Content Moderation:

List all courses across all tenants
Filter by status, tenant, category
Search courses
View course details
Hide/block inappropriate course
Restore blocked course

Platform Settings:

Configure global settings
Email templates management
Payment gateway configuration
System maintenance mode

Reports & Analytics:

Revenue reports
Commission reports
Growth analytics
Export data to CSV/Excel

Admin Routes (in /frontend-platform):

/admin/login - Admin login page
/admin - Admin dashboard overview
/admin/tenants - All tenants list
/admin/tenants/[tenantId] - Detailed tenant view
/admin/instructors - All instructors list
/admin/instructors/[instructorId] - Instructor details
/admin/payouts - Payout requests management
/admin/payouts/[payoutId] - Payout details
/admin/commissions - Configure commission tiers
/admin/courses - Course moderation
/admin/reports - Reports and analytics
/admin/settings - Platform settings


3.2 Instructor Features (Academy Owner)
Account & Onboarding:

Instructor signup from marketing site

Choose plan during signup
Fill basic information (name, email, password, academy name)
Academy slug auto-generated from academy name


Email verification (with Arabic email)
Login/logout
Forgot password / reset password (Arabic emails)
Profile management:

Update name, email
Change password
Profile picture upload



Academy Setup:

Basic academy profile:

Academy name (can be changed)
Slug (URL-friendly, unique, can be changed)
Description/bio
Logo upload
Cover image upload


Theme customization:

Primary color picker
Secondary color picker
Font family selection (Arabic fonts)
Preview changes in real-time


Set subscription pricing:

Enable/disable subscription model
Monthly price
Annual price (with suggested discount)
Currency (default: EGP)
Billing settings



Server-Driven Website (Page Builder):

Template selection:

2-3 base templates for Home page
Template previews
One-click template application


Page management:

List all pages
Create new page (Home, About, Contact, FAQ, Pricing, etc.)
Edit existing page
Delete page
Duplicate page


Page builder interface:

Drag-and-drop sections (future enhancement)
Add blocks/sections:

Hero: Main banner with title, subtitle, CTA, background image
Features Grid: Showcase features with icons
Courses Grid: Display published courses
Testimonials: Student testimonials
FAQ: Accordion-style Q&A
Call-to-Action: Conversion section
Contact Form: Contact information and form
Pricing Table: Subscription pricing display
Content Block: Rich text content
Statistics: Numbers showcase


Edit block properties via forms (all in Arabic)
Reorder sections (up/down)
Delete sections
Toggle section visibility


Page settings:

SEO title and description
Meta keywords
OG image
Show in navigation bar (yes/no)
Navigation label
Navigation order


Publish/unpublish page
Mark page as home page
Preview page before publishing

Course Management:

Courses list:

View all courses (drafts + published)
Filter by status, category
Search courses
Sort by date, title, enrollment count


Create new course:

Basic information:

Title (Arabic)
Slug (auto-generated, editable)
Description (rich text, Arabic)
Thumbnail upload
Category selection
Tags (Arabic)
Level (beginner/intermediate/advanced)
Language (default: Arabic)
Price
Currency


Save as draft


Edit course:

Update all basic information
Manage sections and lessons:

Create sections (e.g., "المقدمة", "الفصل الأول")
Reorder sections
Add lessons to sections:

Video lesson: Upload video file, set duration, description
PDF lesson: Upload PDF file, description
Text lesson: Rich text editor with Arabic support
Quiz lesson: Link to exam (future)


Reorder lessons within section
Edit lesson details
Delete lesson
Mark lesson as "free preview"


Upload course resources (downloadable files)
Set course prerequisites (future)


Publish/unpublish course
Delete course (with confirmation)
Duplicate course
View course analytics:

Total enrollments
Completion rate
Average rating (future)
Revenue generated



Subscription & Pricing:

Enable/disable subscription model
Set pricing:

Monthly subscription price
Annual subscription price
Display savings percentage for annual


Configure subscription benefits
Create pricing page using page builder
View subscription analytics:

Active subscribers count
Subscriber growth
Subscription revenue
Churn rate



Discount Management:

List all discount codes
Filter by status (active/inactive)
Create new discount:

Code (uppercase, alphanumeric)
Name (internal use)
Description
Type: Course-specific, Subscription, or All
If course-specific: Select courses
Discount type: Percentage or Fixed amount
Value
Usage limits: Max uses (optional)
Validity period: Valid from/to dates (optional)
Status: Active/Inactive


Edit discount
Activate/deactivate discount
View discount usage:

Times used
Revenue with discount
Students who used it


Delete discount

Custom Student Fields:

List all custom fields
Create new custom field:

Field name (internal, snake_case)
Label (Arabic, display name)
Field type: Text, Select, Number, Date, Email, Phone
If select: Define options (Arabic)
Required: Yes/No
Placeholder text (Arabic)
Help text (Arabic)
Validation rules (min/max, pattern)


Edit custom field
Reorder fields (affects signup form order)
Delete custom field (with warning if in use)
Preview student registration form

Exam & Assessment Management:

List all exams
Filter by status (draft/published), course
Create new exam:

Basic information:

Title (Arabic)
Description (Arabic)
Instructions (Arabic)
Type: MCQ, Essay, or Mixed
Linked to course (optional)
Total points (auto-calculated from questions)
Passing score
Duration (minutes, optional)
Max attempts (optional)


Availability settings:

Available from date/time (optional)
Available to date/time (optional)


Visibility rules (based on custom fields):

Add rule: Field + Operator + Value
Example: "grade equals 12"
Multiple rules (AND logic)


Display settings:

Show results immediately after submission
Shuffle questions order


Save as draft


Edit exam:

Update basic information
Manage questions:

Add question:

MCQ: Question text, options (4 options), correct answer, points, explanation
True/False: Question text, correct answer, points, explanation
Essay: Question text, points, grading rubric


Reorder questions
Edit question
Delete question


Preview exam as student would see it


Publish/unpublish exam
View exam analytics:

Total submissions
Average score
Pass rate
Question difficulty analysis


Grade submissions:

View all submissions
Filter by status (submitted/graded), student
For essay questions:

Read student answer
Assign points
Provide feedback (Arabic)
Mark as graded


MCQ auto-graded
Send notification to student when graded



Student & Enrollment Management:

Students list:

View all students in academy
Display: Name, Email, Enrollment date, # of courses, Last activity
Search students
Filter by custom field values:

Example: Show only students where "grade" = "12"
Multiple filter conditions


Export students to CSV


View student details:

Profile information
Custom field values
Enrolled courses with progress
Exam submissions and scores
Payment history
Activity timeline


Enrollment management:

View enrollments per course
See detailed progress per student
Manual enrollment (grant access)
Revoke access (with reason)


Student groups (based on custom fields):

Create groups based on field values
View group members
Bulk actions on groups (future: send announcements)



Payments & Finance:

Finance overview dashboard:

Total revenue (gross)
Total commission deducted
Net earnings (available balance)
Pending payouts
Revenue chart (by month)
Revenue by source (courses vs subscriptions)


Current commission tier:

Tier name and percentage
Total sales to date
Progress bar to next tier
Revenue needed for next tier


Transactions list:

View all successful transactions
Display: Date, Student, Type (course/subscription), Amount, Commission, Net
Filter by date range, type
Search by student name/email
Export to CSV/Excel


Request payout:

Enter amount to withdraw (cannot exceed available balance)
Enter payment method details (bank account, etc.)
See commission breakdown preview
Submit request
Cannot request payout if balance < minimum threshold (e.g., EGP 100)


Payout history:

View all payout requests
Status: Pending, Approved, Processing, Paid, Rejected
View details of each payout
If rejected: see rejection reason



Domain & Branding (Phase 2):

Subdomain settings:

Set subdomain: myacademy.platform-domain.com
Check availability
Update subdomain


Custom domain:

Add custom domain: myacademy.com
View DNS verification instructions:

Add CNAME or A record
Verification token


Check verification status
Once verified: SSL auto-configured


Domain status display: Pending, Verified, Failed
Test domain link

Settings:

Academy settings:

Allow student registration: On/Off
Require email verification: On/Off
Default language: Arabic (for now)


Notification settings:

Email notifications for: New enrollment, Payout status, New student


Integration settings (future):

Zoom, Google Meet
Analytics tracking


Danger zone:

Deactivate academy (soft delete)



Instructor Routes (in /frontend-platform):

/dashboard - Overview dashboard (KPIs, charts)
/dashboard/academy - Academy settings (profile, branding, theme)
/dashboard/pages - Page management list
/dashboard/pages/new - Create new page
/dashboard/pages/[pageId] - Edit page with builder
/dashboard/courses - Courses list
/dashboard/courses/new - Create new course
/dashboard/courses/[courseId] - Edit course
/dashboard/courses/[courseId]/lessons - Manage lessons
/dashboard/pricing - Subscription pricing settings
/dashboard/discounts - Discount codes management
/dashboard/discounts/new - Create discount
/dashboard/discounts/[discountId] - Edit discount
/dashboard/students - Students list
/dashboard/students/[studentId] - Student details
/dashboard/students/fields - Configure custom fields
/dashboard/exams - Exams list
/dashboard/exams/new - Create exam
/dashboard/exams/[examId] - Edit exam
/dashboard/exams/[examId]/questions - Manage questions
/dashboard/exams/[examId]/submissions - View & grade submissions
/dashboard/finance - Finance overview
/dashboard/finance/transactions - Transactions list
/dashboard/finance/payouts - Payout management
/dashboard/finance/payouts/new - Request payout
/dashboard/domain - Domain & subdomain settings
/dashboard/settings - Academy settings


3.3 Student Features
Student Registration (on instructor's academy only):

Access academy via: /a/[tenantSlug] or custom domain
Registration page:

Standard fields: Name, Email, Password, Confirm Password
Custom fields defined by instructor (collected during signup)
Clear Arabic labels and placeholders
Client-side validation with Arabic error messages
Submit: "إنشاء حساب" (Create account)


Email verification:

Send verification email in Arabic
Click link to verify
Redirect to login


Login page:

Email & Password
"تسجيل الدخول" (Login) button
Link to forgot password
Link to signup


Forgot password:

Enter email
Receive reset link (Arabic email)
Reset password form


Profile management:

Update name, custom fields
Change password
Profile picture upload



Course Discovery:

Academy landing page (server-driven):

Render based on instructor's page builder configuration
Display all published sections/blocks
Navigation menu based on instructor's settings
Branding/theme applied


Course catalog page:

Grid/list view of all published courses
Display: Thumbnail, Title, Description snippet, Price, Level
Filter courses:

By category
By level (beginner/intermediate/advanced)
By price (free/paid)


Search courses by title
Sort by: Latest, Popular, Price (low to high / high to low)


Course details page:

Full description
Instructor information
Course curriculum (sections and lessons visible)
Preview lessons (if marked as free preview)
Price display
Reviews/ratings (future)
"شراء الآن" (Buy Now) button
Or "اشترك للوصول" (Subscribe for Access) if subscription enabled



Subscription vs Purchase:

View subscription pricing page:

Display monthly and annual options
Show benefits of subscription vs individual purchase
Comparison table
"اشترك الآن" (Subscribe Now) CTA


Student can choose:

Option 1: Buy individual course (one-time payment)
Option 2: Subscribe monthly/annually for all-access to all courses



Checkout & Discounts:

Course checkout page:

Course summary
Price display
Discount code input field:

Apply code
Validate code (Ajax)
Show discount applied and new price
Show error if invalid code (in Arabic)


Payment method selection (Paymob)
"إتمام الدفع" (Complete Payment) button


Subscription checkout page:

Subscription plan summary (monthly/annual)
Price per period
Discount code input (if applicable)
Payment method
Terms acceptance checkbox
"اشترك الآن" (Subscribe Now) button


Payment processing:

Redirect to Paymob payment page
After payment:

Success: Redirect to success page
Failed: Redirect to failed page with error message




Success page:

Confirmation message (in Arabic)
Receipt email sent
Link to access course or dashboard


Failed page:

Error message (in Arabic)
Retry payment option
Contact support link



Learning Experience:

"دوراتي" (My Courses) page:

Display enrolled courses:

From purchases
From active subscription (all courses)


Show progress per course (percentage, visual progress bar)
Filter: All, In Progress, Completed
Continue learning button


Course player interface:

Sidebar: List of all lessons with:

Lesson title
Lesson type icon (video/PDF/text)
Completion checkmark if completed
Lock icon if not accessible yet (future: sequential access)


Main area: Current lesson content:

Video: Video player with controls, playback speed, quality settings
PDF: Embedded PDF viewer or download link
Text: Rich text display with proper Arabic typography


Lesson navigation:

Previous lesson button
Next lesson button


Mark as complete button:

Click to mark current lesson as completed
Auto-advance to next lesson


Download resources (if available)
Take notes (future feature)


Progress tracking:

Automatically track which lessons completed
Update course progress percentage
Save video playback position (resume where left off)
Track time spent per lesson (analytics)


"تقدمي" (My Progress) dashboard:

Overview of all enrolled courses
Progress per course with visual indicators
Total time spent learning
Certificates (future: on course completion)



Subscription Management:

"اشتراكي" (My Subscription) page:

If subscribed:

Current plan (monthly/annual)
Price per period
Next billing date
Payment method
Subscription status (active/cancelled/expired)


Manage subscription:

Cancel subscription:

Confirmation modal (in Arabic)
Provide cancellation reason (optional)
Access continues until end of current period


Reactivate subscription (if cancelled but not expired)
Update payment method (future)


Billing history:

List of subscription payments
Download invoice/receipt


If not subscribed:

Show subscription benefits
CTA to subscribe





Exams & Assessments:

"الامتحانات" (Exams) page:

List available exams (filtered by visibility rules + custom fields):

Display: Title, Description, Duration, Passing score, Attempts left


Filter: Available, Completed, Passed, Failed
Take exam button


Taking exam page:

Exam title and instructions
Timer (if duration is set):

Countdown display
Warning when time is running out
Auto-submit when time expires


Question display:

MCQ: Question text, options (radio buttons), single select
True/False: Question text, True/False options
Essay: Question text, large text area for answer


Navigation:

Question palette (grid showing all questions)
Mark for review option
Previous/Next question buttons


Submit exam:

Confirmation modal (check if any unanswered questions)
Final submit button
Cannot edit after submission




Exam result page:

If show results immediately:

Total score (X out of Y points)
Percentage
Passed/Failed status
Time spent
Review answers:

Show correct answers for MCQ
Show student's answer
Show explanations (if provided)


For essay: "قيد التصحيح" (Being graded) message


If not show results immediately:

"تم إرسال إجابتك" (Your answers have been submitted) message
Notification when graded




"امتحاناتي" (My Exams) page:

Exam history:

List of all exam attempts
Display: Exam name, Date, Score, Status, Attempt number


View past results
Retake exam (if attempts remaining)



Notifications:

In-app notification icon (bell):

Unread count badge
Dropdown with recent notifications
Types:

Course enrollment confirmation
New course available (for subscribers)
Exam graded
Subscription renewal reminder
Subscription cancelled/expired




Notification center page:

List all notifications
Mark as read/unread
Clear all



Student Routes (in /frontend-academy):

/a/[tenantSlug] - Academy landing page (server-driven)
/a/[tenantSlug]/courses - Course catalog
/a/[tenantSlug]/courses/[courseSlug] - Course details
/a/[tenantSlug]/pricing - Subscription pricing page
/a/[tenantSlug]/about - About page (if configured by instructor)
/a/[tenantSlug]/contact - Contact page (if configured)
/a/[tenantSlug]/auth/signup - Student signup (with custom fields)
/a/[tenantSlug]/auth/login - Student login
/a/[tenantSlug]/auth/verify-email - Email verification
/a/[tenantSlug]/auth/forgot-password - Forgot password
/a/[tenantSlug]/auth/reset-password - Reset password
/a/[tenantSlug]/checkout/course/[courseSlug] - Course checkout
/a/[tenantSlug]/checkout/subscription - Subscription checkout
/a/[tenantSlug]/checkout/success - Payment success
/a/[tenantSlug]/checkout/failed - Payment failed
/a/[tenantSlug]/my-courses - Student's enrolled courses
/a/[tenantSlug]/my-progress - Overall progress dashboard
/a/[tenantSlug]/learn/[courseSlug] - Course player (first lesson)
/a/[tenantSlug]/learn/[courseSlug]/[lessonId] - Specific lesson player
/a/[tenantSlug]/subscription - Manage subscription
/a/[tenantSlug]/exams - Available exams list
/a/[tenantSlug]/exams/[examId] - Take exam
/a/[tenantSlug]/exams/[examId]/result - View exam result
/a/[tenantSlug]/my-exams - Exam history
/a/[tenantSlug]/profile - Student profile settings
/a/[tenantSlug]/notifications - Notification center

====================================================
4. NON-TECHNICAL & SYSTEM-LEVEL REQUIREMENTS
Multi-tenancy:

Every query and write for academy data MUST be filtered by tenantId
Enforce tenant isolation at service layer (middleware/guards)
Prevent cross-tenant data leaks
Use indexes on tenantId for performance

Security:

JWT-based authentication:

Access tokens (short-lived: 15 minutes)
Refresh tokens (long-lived: 7 days, stored in httpOnly cookie)
Token rotation on refresh


Role-based authorization: admin, instructor, student

Use Guards in NestJS to protect routes
Check role and tenantId ownership


Password security:

Bcrypt with salt rounds = 10
Min password length: 8 characters
Password complexity validation


Input validation:

Use class-validator decorators on all DTOs
Sanitize user input to prevent XSS
Use parameterized queries (Mongoose) to prevent injection


CORS configuration:

Whitelist frontend origins
Credentials: true for cookies


Rate limiting:

Implement rate limiting on auth endpoints
Prevent brute force attacks


Helmet.js for security headers
HTTPS only in production

Observability:

Logging:

Use Winston or Pino for structured logging
Log levels: error, warn, info, debug
Include correlation ID in all logs
Log format: JSON in production, pretty in development


Request logging:

Log all incoming requests (method, URL, user, tenantId)
Log response times


Error handling:

Global exception filter in NestJS
Return consistent error response format:



json    {
      "statusCode": 400,
      "message": "رسالة الخطأ بالعربية",
      "error": "Bad Request",
      "timestamp": "2024-01-15T10:30:00Z"
    }

Don't expose internal errors to users
Health check endpoints:

GET /health - Basic health check
GET /health/db - Database connectivity check



Payment Integration:

Integrate Paymob for card payments in Egypt:

Sandbox mode for development
Support payment flows:

Course purchase: Student pays → Transaction created → webhook confirms → Enrollment created
Subscription: Student pays → Transaction created → webhook confirms → Subscription activated


Handle payment callbacks/webhooks:

Verify webhook signature
Update transaction status
Create enrollment or activate subscription
Send confirmation email


Handle payment failures gracefully
Support refunds (admin-initiated)


Recurring billing for subscriptions:

Attempt to charge on renewal date
Retry failed payments (with exponential backoff)
Notify student of failed payment
Suspend access if payment fails multiple times



Commission Calculation:

Calculate commission per transaction based on instructor's total sales:

On every successful transaction:

Get instructor's cumulative revenue (sum of all successful transactions)
Determine which commission tier they fall into
Calculate commission: transactionAmount × commissionPercentage
Calculate instructor earnings: transactionAmount - commissionAmount
Store commission data in Transaction document




Commission tiers are evaluated in real-time at checkout
Store commission snapshot in payout request (tier at that moment)

Email System:

Use central EmailModule with template support:

Templates in Arabic
HTML email templates with inline CSS
Plain text alternative


Email types:

Authentication:

Email verification (with verification link)
Password reset (with reset link)
Password changed confirmation


Transactions:

Course purchase receipt (with course details, amount, invoice)
Subscription confirmation (with plan details, billing date)
Subscription renewal confirmation
Subscription cancellation confirmation
Subscription expiration warning
Payment failure notification


Instructor:

Payout request received
Payout approved (with payment details)
Payout rejected (with reason)
Payout completed
New student enrolled notification


Student:

Welcome email after registration
Exam submission confirmation
Exam graded notification (with score and link)




Email queuing (future: use Bull or similar):

Queue emails for async sending
Retry failed emails


Unsubscribe mechanism (future)

File Storage:

Development: Local file storage in /uploads directory

Serve static files via NestJS


Production: S3-compatible storage (AWS S3, DigitalOcean Spaces, etc.)

Use presigned URLs for secure file access
Organize by tenant: uploads/[tenantId]/courses/[courseId]/...


Supported file types:

Images: JPG, PNG, WebP (for logos, thumbnails, covers)
Videos: MP4 (for video lessons)
Documents: PDF (for PDF lessons and resources)


File upload validation:

Max file size:

Images: 5 MB
Videos: 500 MB
PDFs: 20 MB


Virus scanning (future)


Generate thumbnails for videos (future)

Database:

MongoDB with Mongoose:

Use indexes on frequently queried fields:

tenantId (on all multi-tenant collections)
email (unique on User collection)
slug (on Tenant and Course collections)
status fields


Use compound indexes where appropriate:

{tenantId: 1, slug: 1} for tenant-scoped slugs


Enable MongoDB collation for Arabic text: {locale: 'ar'}


Soft deletes (where appropriate):

Add deletedAt field instead of hard delete
Filter out deleted documents in queries


Audit fields:

createdAt, updatedAt (automatic with Mongoose timestamps)
createdBy, updatedBy (where relevant)



Performance:

Pagination:

Implement pagination on all list endpoints
Default page size: 20 items
Return total count for UI pagination


Caching (future):

Cache frequently accessed data (e.g., tenant config, published courses)
Use Redis for caching
Invalidate cache on updates


Database query optimization:

Use select() to return only needed fields
Avoid N+1 queries (use populate wisely)
Use lean() for read-only queries (returns plain objects)



Architecture Constraint:

NO microservices
One NestJS app with clearly separated modules (AuthModule, TenantModule, etc.)
Modules should be loosely coupled and communicate via service interfaces
Shared code in /common or /shared directories within backend

====================================================
5. FRONTEND APPS – ROUTES & PAGES
5.1 Marketing & Instructor Platform (/frontend-platform)
Public Marketing Site
Purpose: Sell the platform to potential instructors.
Pages:
/ - Landing Page

Hero section:

Main headline: "أنشئ أكاديميتك التعليمية الخاصة" (Create your own educational academy)
Subheadline: Value proposition
Primary CTA: "ابدأ مجاناً" (Start Free) → /signup
Secondary CTA: "تعرف على المزايا" (Explore Features) → /features
Hero image/video


Features section:

Grid of 6-8 key features with icons and descriptions
E.g., "إدارة الدورات", "قبول المدفوعات", "تخصيص كامل", etc.


How it works:

3-4 steps with illustrations
"سجل حسابك" → "أنشئ دوراتك" → "اربح المال"


Pricing preview:

Show 3 pricing tiers
CTA: "اعرض جميع الخطط" → /pricing


Testimonials:

3-4 testimonials from instructors (can be placeholder initially)
Name, photo, academy name


Call-to-action:

Final conversion section
"جاهز للبدء؟ أنشئ أكاديميتك الآن"
CTA button → /signup


Footer:

Links: Features, Pricing, About, Contact, Terms, Privacy
Social media icons
Newsletter signup (future)
Copyright



/features - Features Page

Detailed explanation of platform features:

إدارة الدورات: Create unlimited courses, upload videos/PDFs, organize lessons
إدارة الطلاب: Track student progress, custom registration fields, student groups
قبول المدفوعات: Integrated payment via Paymob, support for EGP
الاشتراكات: Offer monthly/annual subscriptions for all courses
كوبونات الخصم: Create discount codes with flexible rules
الامتحانات: Create MCQ and essay exams with auto-grading
صفحات قابلة للتخصيص: Drag-and-drop page builder for academy website
العلامة التجارية: Custom logo, colors, fonts, domain
الدعم: Arabic support, comprehensive documentation
الأمان: Secure payment processing, data encryption


Each feature with icon, title, description, screenshot/illustration
CTA at bottom: "ابدأ الآن" → /signup

/pricing - Pricing Page

Pricing tiers comparison:

3 tiers: Starter, Pro, Scale
Toggle: Monthly / Annual (show savings for annual)
For each tier:

Tier name
Price in EGP per month
Feature list (checkmarks for included features)
CTA button: "ابدأ بهذه الخطة" → /signup?plan=starter




Example tiers:

Starter (EGP 199/month):

Up to 50 students
10 courses
Basic features
No custom domain


Pro (EGP 499/month):

Up to 500 students
Unlimited courses
All features
Custom subdomain
Priority support


Scale (EGP 999/month):

Unlimited students
Unlimited courses
All features
Custom domain
White-label option (future)
Dedicated support




FAQ section below pricing
CTA: "لست متأكداً؟ اتصل بنا" → /contact

/about - About Page

Mission statement: Why we built this platform
Vision: Empowering Arabic educators
Team section (optional):

Founder(s) photo and bio


Contact information
Company values

/contact - Contact Page

Contact form:

Name, Email, Subject, Message
Submit button: "إرسال" (Send)
Form sends email to support


Contact information:

Email: support@platform.com
Phone: +20 XXX XXX XXXX
Address (if applicable)


Social media links:

Facebook, Twitter, LinkedIn, Instagram


Office location map (optional)

/terms - Terms of Service

Platform terms of service in Arabic
Sections: Introduction, User accounts, Instructor obligations, Student obligations, Payment terms, Intellectual property, Liability, Termination, etc.

/privacy - Privacy Policy

Privacy policy in Arabic
Sections: Data collection, Data usage, Data sharing, Cookies, User rights, Contact information

Authentication Pages
/signup - Instructor Signup

Reads ?plan=starter from query string (pre-selected plan)
Form fields:

الاسم الكامل (Full Name) - required
البريد الإلكتروني (Email) - required, validated
كلمة المرور (Password) - required, min 8 chars, strength meter
تأكيد كلمة المرور (Confirm Password) - required, must match
اسم الأكاديمية (Academy Name) - required
(Plan is pre-selected, displayed but not editable during signup)
Checkbox: I agree to Terms and Privacy Policy (required)


Submit button: "إنشاء حساب" (Create Account)
Loading state during submission
Error handling with Arabic messages
After successful signup:

Show success message: "تم إنشاء حسابك بنجاح! تحقق من بريدك الإلكتروني"
Send verification email
Redirect to email verification reminder page


Link to login: "لديك حساب؟ تسجيل الدخول"

/login - Instructor/Admin Login

Form fields:

البريد الإلكتروني (Email)
كلمة المرور (Password)
"تذكرني" (Remember me) checkbox


Submit button: "تسجيل الدخول" (Login)
Link to forgot password: "نسيت كلمة المرور؟"
Link to signup: "لا تملك حساب؟ سجل الآن"
After successful login:

If role = instructor: redirect to /dashboard
If role = admin: redirect to /admin



/verify-email - Email Verification

Page shown after clicking verification link in email
Success: "تم تفعيل بريدك الإلكتروني بنجاح"
Redirect to login after 3 seconds
Failure: "رابط التفعيل غير صالح أو منتهي الصلاحية"
Option to resend verification email

/forgot-password - Forgot Password

Form field:

البريد الإلكتروني (Email)


Submit button: "إرسال رابط إعادة التعيين" (Send Reset Link)
Success message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك"
Link back to login

/reset-password - Reset Password

Reads token from query string: ?token=...
Form fields:

كلمة المرور الجديدة (New Password)
تأكيد كلمة المرور (Confirm Password)


Submit button: "إعادة تعيين كلمة المرور" (Reset Password)
Success: "تم تغيير كلمة المرور بنجاح"
Redirect to login

Instructor Dashboard (Protected)
All dashboard pages require authentication and role=instructor.
Layout:

Sidebar navigation (RTL):

Logo at top
Menu items:

لوحة التحكم (Dashboard)
الأكاديمية (Academy)

الإعدادات (Settings)
الصفحات (Pages)
النطاق (Domain)


الدورات (Courses)
التسعير (Pricing)

الاشتراكات (Subscriptions)
كوبونات الخصم (Discounts)


الطلاب (Students)

قائمة الطلاب (Student List)
الحقول المخصصة (Custom Fields)


الامتحانات (Exams)
المالية (Finance)

نظرة عامة (Overview)
المعاملات (Transactions)
السحوبات (Payouts)


الإعدادات (Settings)


Logout button at bottom


Top bar:

Breadcrumbs
User profile dropdown (name, avatar, logout)
Notification icon (future)



/dashboard - Dashboard Overview

KPI cards:

إجمالي الطلاب (Total Students)
الدورات المنشورة (Published Courses)
إجمالي الإيرادات (Total Revenue)
الرصيد المتاح (Available Balance)


Charts:

Revenue over time (line chart)
Enrollments over time (bar chart)
Top courses by enrollment


Recent activity:

Recent enrollments
Recent transactions
Pending exam submissions


Quick actions:

إنشاء دورة جديدة (Create New Course)
طلب سحب (Request Payout)
عرض الطلاب (View Students)



/dashboard/academy - Academy Settings

Tabs:

الملف الشخصي (Profile):

Academy name (editable)
Slug (editable, with availability check)
Description (textarea)
Save button


العلامة التجارية (Branding):

Logo upload (with preview)
Cover image upload
Primary color picker (with live preview)
Secondary color picker
Font family selection
Save button


الإعدادات (Settings):

Allow student registration (toggle)
Require email verification (toggle)
Save button





/dashboard/pages - Pages List

Table of pages:

Columns: Name, Path, Status, Home, Show in Nav, Actions
Actions: Edit, Delete, Duplicate


Button: "إنشاء صفحة جديدة" (Create New Page) → /dashboard/pages/new
Filter by status: All, Published, Draft

/dashboard/pages/new - Create New Page

Form:

Page name
Path (auto-generated from name, editable)
Template selection (if using templates)
Save as draft button


After creation, redirect to edit page

/dashboard/pages/[pageId] - Edit Page (Page Builder)

Left sidebar: Section library

Drag or click to add sections: Hero, Features, Courses, Testimonials, FAQ, CTA, Content, Pricing, Contact


Center: Page preview/canvas

Display added sections in order
Each section has:

Settings icon: Opens modal to edit section props
Reorder icons: Move up/down
Delete icon
Toggle visibility




Right sidebar: Page settings

Page name
Path
SEO settings (title, description, keywords)
Show in navigation (checkbox)
Navigation label
Navigation order
Is home page (checkbox)


Top bar actions:

Save draft
Preview (opens in new tab)
Publish
Unpublish (if already published)



/dashboard/courses - Courses List

Table of courses:

Columns: Thumbnail, Title, Status, Enrollments, Revenue, Created, Actions
Actions: Edit, Delete, Duplicate, Publish/Unpublish


Button: "إنشاء دورة جديدة" (Create New Course) → /dashboard/courses/new
Filters: Status (All, Published, Draft), Category
Search: By title

/dashboard/courses/new - Create Course

Form (Step 1: Basic Info):

Title (required)
Slug (auto-generated, editable)
Description (rich text editor)
Thumbnail upload
Category (select)
Tags (multi-select or comma-separated)
Level (select: Beginner, Intermediate, Advanced)
Language (default: Arabic)
Price
Currency (default: EGP)
Save as draft button


After creation, redirect to edit page for adding lessons

/dashboard/courses/[courseId] - Edit Course

Tabs:

المعلومات الأساسية (Basic Info):

Same form as creation
Save button
Publish/Unpublish button
Delete button (with confirmation)


المحتوى (Content):

Sections list:

Display sections in order
Each section has:

Section title (editable inline)
Lessons list (collapsible):

Lesson title, type icon, duration, free badge, actions (Edit, Delete)
Reorder lessons (drag-and-drop or up/down buttons)


Add lesson button (opens modal)
Reorder section buttons
Delete section button


Button: "إضافة قسم جديد" (Add New Section)


Add lesson modal:

Lesson type: Video, PDF, Text
Lesson title
Description
Order (auto-incremented)
Is free preview (checkbox)
Based on type:

Video: Upload video file, set duration
PDF: Upload PDF file
Text: Rich text editor


Save button




الإحصائيات (Analytics):

Total enrollments
Completion rate
Average time per lesson
Revenue generated
Enrollments chart over time





/dashboard/pricing - Pricing Settings

Tabs:

الاشتراكات (Subscriptions):

Enable subscription model (toggle)
If enabled:

Monthly price (input)
Annual price (input)
Show savings calculation
Save button




كوبونات الخصم (Discount Codes):

Table of discount codes:

Columns: Code, Type, Discount, Uses, Status, Actions
Actions: Edit, Activate/Deactivate, Delete


Button: "إنشاء كوبون جديد" (Create New Discount) → Opens modal





Create/Edit Discount Modal:

Form:

Code (uppercase, alphanumeric, required)
Name (internal use)
Description
Type: Course-specific, Subscription, All (radio buttons)
If course-specific: Select courses (multi-select)
Discount type: Percentage, Fixed amount (radio buttons)
Value (number input)
Max uses (number input, optional)
Valid from (date picker, optional)
Valid to (date picker, optional)
Status: Active, Inactive (radio buttons)
Save button



/dashboard/students - Students List

Table of students:

Columns: Name, Email, Enrollment Date, # of Courses, Last Activity, Actions
Actions: View Details


Search: By name or email
Filters:

By custom field values (dynamic filters based on defined fields)
Example: "Grade = 12", "Location = Cairo"
Add filter button (opens modal to select field, operator, value)


Button: "تصدير إلى CSV" (Export to CSV)
Button: "الحقول المخصصة" (Custom Fields) → /dashboard/students/fields

/dashboard/students/[studentId] - Student Details

Student profile:

Name, Email, Profile picture
Custom field values (display all)
Enrollment date, Last activity


Enrolled courses:

Table: Course name, Progress, Status
Click to view detailed progress


Exam submissions:

Table: Exam name, Score, Status, Date


Payment history:

Table: Date, Type, Amount, Status



/dashboard/students/fields - Custom Fields Configuration

Table of custom fields:

Columns: Label, Field Name, Type, Required, Order, Actions
Actions: Edit, Delete, Reorder (up/down buttons)


Button: "إضافة حقل جديد" (Add New Field) → Opens modal
Preview: Show how signup form will look

Create/Edit Custom Field Modal:

Form:

Field name (snake_case, auto-generated from label)
Label (Arabic, required)
Field type: Text, Select, Number, Date, Email, Phone (select)
If type=select: Options (textarea, one per line)
Required (checkbox)
Placeholder (optional)
Help text (optional)
Validation (optional):

Min value/length
Max value/length
Pattern (regex)


Save button



/dashboard/exams - Exams List

Table of exams:

Columns: Title, Type, Course, Status, Submissions, Avg Score, Actions
Actions: Edit, Publish/Unpublish, View Submissions, Delete


Button: "إنشاء امتحان جديد" (Create New Exam) → /dashboard/exams/new
Filters: Status (All, Published, Draft), Type (MCQ, Essay, Mixed)

/dashboard/exams/new - Create Exam

Form (Step 1: Basic Info):

Title (required)
Description
Instructions (rich text)
Type: MCQ, Essay, Mixed (radio buttons)
Linked to course (select, optional)
Passing score (number, required)
Duration (minutes, optional)
Max attempts (number, optional)
Available from (datetime, optional)
Available to (datetime, optional)
Show results immediately (checkbox)
Shuffle questions (checkbox)
Save as draft button


After creation, redirect to edit page for adding questions

/dashboard/exams/[examId] - Edit Exam

Tabs:

المعلومات (Info):

Same form as creation
Save button
Publish/Unpublish button
Delete button


الأسئلة (Questions):

List of questions:

Display: Question text (truncated), Type, Points, Actions (Edit, Delete)
Reorder questions (drag-and-drop or up/down)


Button: "إضافة سؤال" (Add Question) → Opens modal
Total points displayed (auto-calculated)


قواعد الظهور (Visibility Rules):

List of rules:

Display: Field + Operator + Value
Delete rule button


Button: "إضافة قاعدة" (Add Rule) → Opens modal
Note: All rules use AND logic


الإرسالات (Submissions):

Redirect to /dashboard/exams/[examId]/submissions





Add/Edit Question Modal:

Form:

Question type: MCQ, Essay, True/False (radio buttons)
Question text (rich text editor, required)
Points (number, required)
Based on type:

MCQ:

Option 1-4 (text inputs, all required)
Correct answer (radio buttons or select)


True/False:

Correct answer (radio buttons: True, False)


Essay:

Grading rubric (textarea, optional)




Explanation (rich text, optional) - shown to student after submission
Save button



Add Visibility Rule Modal:

Form:

Custom field (select from defined fields)
Operator: Equals, Not Equals, Contains, Greater Than, Less Than (select)
Value (input, type depends on field type)
Add button



/dashboard/exams/[examId]/submissions - View & Grade Submissions

Table of submissions:

Columns: Student, Attempt, Score, Status, Submitted At, Actions
Actions: View/Grade (if status=submitted), View Result (if status=graded)


Filters: Status (All, Submitted, Graded), Student
Click "View/Grade" → Opens grading interface

Grading Interface:

Student info: Name, Email, Attempt number
Exam info: Title, Total points, Passing score
Questions list:

For each question:

Question text
Student's answer
Based on type:

MCQ: Auto-graded, show correct answer, points earned
Essay:

Student's answer (text display)
Points input (max = question points)
Feedback textarea (optional)




Points earned display




Total score display (auto-calculated)
Overall feedback textarea (optional)
Save & Continue button (saves current progress)
Submit Grade button (marks as graded, sends notification)
Cancel button

/dashboard/finance - Finance Overview

KPI cards:

إجمالي الإيرادات (Total Revenue - gross)
إجمالي العمولات (Total Commission Deducted)
صافي الأرباح (Net Earnings)
الرصيد المتاح (Available Balance - can withdraw)
السحوبات المعلقة (Pending Payouts)


Current commission tier card:

Tier name and icon (Bronze/Silver/Gold)
Commission percentage
Total sales to date
Progress bar to next tier
Revenue needed for next tier


Revenue chart (line chart, by month)
Revenue breakdown (pie chart):

Course sales
Subscription revenue



/dashboard/finance/transactions - Transactions List

Table of transactions:

Columns: Date, Student, Type, Course/Subscription, Amount, Commission, Net, Status
Status badge: Success, Pending, Failed


Filters:

Date range (date pickers)
Type: All, Course, Subscription
Status: All, Success, Pending, Failed


Search: By student name/email
Button: "تصدير" (Export to CSV/Excel)

/dashboard/finance/payouts - Payouts Management

Available balance card:

Current available balance (large display)
Button: "طلب سحب" (Request Payout) → /dashboard/finance/payouts/new

Disabled if balance < minimum threshold (e.g., EGP 100)




Payout requests table:

Columns: Date, Amount, Status, Requested At, Processed At, Actions
Status badges: Pending, Approved, Processing, Paid, Rejected
Actions: View Details (opens modal)


Filters: Status (All, Pending, Approved, Paid, Rejected)

Payout Details Modal:

Payout information:

Amount requested
Status
Requested at
Commission tier at request
Calculation breakdown:

Total revenue
Total commission
Available balance
Previous payouts


Payment method details
Notes (if any)
If rejected: Rejection reason
If paid: Paid at, Payment reference


Close button

/dashboard/finance/payouts/new - Request Payout

Form:

Available balance display (read-only)
Amount to withdraw (number input, required):

Validation: Must be ≤ available balance and ≥ minimum threshold


Payment method selection (future: multiple options, for now: bank transfer)
Payment details:

Bank name
Account holder name
Account number (IBAN)
Any additional details


Notes (textarea, optional)
Commission breakdown display:

Shows current tier
Estimated commission on this payout (informational)


Submit button: "طلب السحب" (Request Payout)


After submission:

Success message
Redirect to payouts list
Notification sent to admin



/dashboard/domain - Domain Settings

Tabs:

النطاق الفرعي (Subdomain):

Current subdomain display (if set)
Input field: [desired].platform-domain.com
Check availability button
Save button
If set: Preview link


النطاق المخصص (Custom Domain):

Current custom domain display (if set)
Input field: Enter your domain (e.g., myacademy.com)
Add domain button
Once added:

Verification status: Pending, Verified, Failed
DNS instructions:

"Add the following DNS records to your domain:"
CNAME record: www → platform-domain.com
A record: @ → IP_ADDRESS
TXT record: _verification → TOKEN


Check verification button (re-checks DNS)
Remove domain button


If verified: SSL status (auto-configured)





/dashboard/settings - Academy Settings

Form:

Allow student registration (toggle)
Require email verification (toggle)
Save button


Profile settings:

Update instructor profile (name, email)
Change password
Profile picture upload


Account danger zone:

Deactivate academy button (soft delete, with confirmation modal)



Admin Panel (Protected)
All admin pages require authentication and role=admin.
Layout:

Similar to instructor dashboard but with admin-specific menu

/admin - Admin Dashboard

KPI cards:

Total Tenants
Total Instructors
Total Students
Total Revenue
Total Commission Earned
Pending Payouts (count)


Charts:

Tenants growth (line chart)
Revenue growth (line chart)
Commission earned (bar chart)


Recent activity:

Recent tenant signups
Recent payout requests
Recent high-value transactions


Quick actions:

View Pending Payouts
View Tenants
Configure Commissions



/admin/tenants - Tenants List

Table:

Columns: Name, Owner Email, Slug, Plan, Status, Students, Revenue, Created, Actions
Actions: View Details, Suspend/Activate


Filters: Status, Plan
Search: By name, email, slug

/admin/tenants/[tenantId] - Tenant Details

Tenant information:

Name, Slug, Owner name, Owner email
Plan, Status
Domain/subdomain
Created at


Usage statistics:

Total students
Total courses (published/draft)
Total enrollments
Total revenue generated
Current commission tier
Revenue to next tier


Revenue chart (over time)
Actions:

Suspend tenant (with reason)
Activate tenant
Contact instructor



/admin/instructors - Instructors List

Table:

Columns: Name, Email, Academy, Revenue, Commission Tier, Created, Actions
Actions: View Details


Search: By name or email

/admin/instructors/[instructorId] - Instructor Details

Similar to tenant details but instructor-focused

/admin/payouts - Payout Requests

Table:

Columns: Instructor, Amount, Commission Tier, Status, Requested At, Actions
Actions: View Details, Approve, Reject (for pending), Mark as Paid (for approved)


Filters: Status (All, Pending, Approved, Processing, Paid, Rejected)

Payout Detail & Actions (Modal or Page):

Payout information (same as instructor view)
Calculation breakdown display
Admin actions:

If pending:

Approve button
Reject button (requires reason input)


If approved:

Mark as Paid button (requires payment reference input)




Activity log (who approved, when, etc.)

/admin/commissions - Commission Tiers Configuration

Table of tiers:

Columns: Order, Name, Min Revenue, Max Revenue, Commission %, Actions
Actions: Edit, Delete
Reorder tiers (up/down buttons)


Button: "إضافة شريحة جديدة" (Add New Tier) → Opens modal
Preview section:

Shows how different revenue levels map to commission percentages
Example calculator: Enter revenue → shows tier and commission



Add/Edit Commission Tier Modal:

Form:

Tier name (e.g., Bronze, Silver, Gold)
Min revenue (number, required)
Max revenue (number, optional - null means unlimited)
Commission percentage (number, required, 0-100)
Description (optional)
Order (auto-assigned, can change with reorder)
Save button



/admin/courses - Course Moderation

Table of all courses across all tenants:

Columns: Title, Instructor, Tenant, Status, Enrollments, Published, Actions
Actions: View Details, Block/Unblock


Filters: Status (All, Published, Draft, Blocked), Tenant
Search: By title, instructor

Course Details (Modal):

Course information (all details)
Instructor information
Enrollments count
Admin actions:

Block course (requires reason)
Unblock course


Block reason displayed if blocked

/admin/settings - Platform Settings

General settings:

Platform name
Support email
Minimum payout threshold


Email settings:

SMTP configuration


Payment gateway:

Paymob API keys


Maintenance mode:

Enable/disable (shows maintenance page to users)


Save button


5.2 Student-Facing Academy (/frontend-academy)
All pages are multi-tenant, accessed via /a/[tenantSlug] or custom domain.
Layout:

Top navigation bar (RTL):

Academy logo (click → home)
Navigation menu items (based on instructor's page config)
If logged in:

User avatar dropdown (profile, my courses, exams, subscription, logout)


If not logged in:

Login button
Signup button




Footer:

Links from instructor's config
Copyright
"Powered by Platform Name" (can be hidden in white-label)



Routes:
/a/[tenantSlug] - Academy Home Page

Server-driven rendering based on instructor's page builder config
Fetch page data from backend (path="/", tenantId)
Render sections in order based on PageSection props
Apply tenant branding (colors, fonts, logo)

/a/[tenantSlug]/courses - Course Catalog

Hero section (optional, from page config)
Filters sidebar:

Category filter
Level filter (beginner/intermediate/advanced)
Price filter (free/paid)


Courses grid:

Course card:

Thumbnail
Title
Description (truncated)
Instructor name
Level badge
Price or "مجاناً" (Free)
"عرض التفاصيل" (View Details) button




Pagination (if many courses)

/a/[tenantSlug]/courses/[courseSlug] - Course Details

Breadcrumbs: Home > Courses > [Course Title]
Hero section:

Course title
Instructor name with avatar
Short description
Price or "مجاناً"
Enroll button:

If student not logged in: "سجل للتسجيل" → login/signup
If logged in and not enrolled: "شراء الآن" → checkout
If subscribed: "ابدأ التعلم" → course player
If enrolled: "متابعة التعلم" → course player




Tabs:

نظرة عامة (Overview):

Full description
What you'll learn (bullet points)
Requirements (if any)
Target audience


المنهج (Curriculum):

List of sections and lessons (accordion):

Section title (collapsible)
Lessons list:

Lesson title
Type icon
Duration (if video)
"معاينة مجانية" (Free Preview) badge if applicable
Play icon for preview lessons (modal player)






المدرب (Instructor):

Instructor bio
Other courses by instructor


التقييمات (Reviews) - future feature



/a/[tenantSlug]/pricing - Subscription Pricing

If subscription enabled:

Hero section: "اشترك للوصول إلى جميع الدورات"
Pricing cards:

Monthly plan: Price, benefits, "اشترك شهرياً" button
Annual plan: Price, savings badge, benefits, "اشترك سنوياً" button


Benefits section: What's included in subscription
FAQ section
Comparison table: Subscription vs buying individual courses


If not enabled: Redirect to courses page

/a/[tenantSlug]/auth/signup - Student Signup

Form fields:

Standard fields:

الاسم الكامل (Full Name)
البريد الإلكتروني (Email)
كلمة المرور (Password)
تأكيد كلمة المرور (Confirm Password)


Custom fields (dynamically rendered based on tenant's CustomField config):

Rendered in order
Required fields marked with *
Appropriate input type for each field type




Checkbox: I agree to Terms and Privacy
Submit button: "إنشاء حساب"
Link to login: "لديك حساب؟ سجل الدخول"
After signup:

If email verification required: Show message and redirect to verification reminder
Else: Auto-login and redirect to courses



/a/[tenantSlug]/auth/login - Student Login

Form:

البريد الإلكتروني
كلمة المرور
"تذكرني"


Submit: "تسجيل الدخول"
Links: Forgot password, Signup
After login: Redirect to previous page or courses

/a/[tenantSlug]/auth/verify-email - Email Verification

Similar to platform email verification

/a/[tenantSlug]/auth/forgot-password - Forgot Password

Similar to platform forgot password

/a/[tenantSlug]/auth/reset-password - Reset Password

Similar to platform reset password

/a/[tenantSlug]/checkout/course/[courseSlug] - Course Checkout

Breadcrumbs
Checkout summary:

Course thumbnail and title
Price


Discount code section:

Input field: "كوبون الخصم" (Discount Code)
Apply button
If applied successfully:

Show discount amount
Show new price
Green success message


If failed:

Red error message (in Arabic)




Order summary:

Course price
Discount (if applied)
Total


Payment section:

Payment method: Paymob (display logo)
Submit button: "إتمام الدفع" (Complete Payment)


After clicking submit:

Create transaction in backend
Redirect to Paymob payment page
Paymob redirects back after payment



/a/[tenantSlug]/checkout/subscription - Subscription Checkout

Similar to course checkout but for subscription:

Display selected plan (monthly/annual)
Recurring billing notice
Terms acceptance
Discount code section (if applicable)
Payment button



/a/[tenantSlug]/checkout/success - Payment Success

Success message with checkmark icon
"تم الدفع بنجاح!" (Payment Successful!)
Order details:

Order number
Date
Amount paid


Next steps:

If course: "ابدأ التعلم الآن" button → course player
If subscription: "عرض دوراتي" button → my courses


Receipt email sent notice

/a/[tenantSlug]/checkout/failed - Payment Failed

Error message with X icon
"فشلت عملية الدفع" (Payment Failed)
Error reason (from payment gateway)
Actions:

Retry payment button (back to checkout)
Contact support link



/a/[tenantSlug]/my-courses - Student's Enrolled Courses

Protected route (must be logged in)
Tabs:

جميع الدورات (All Courses)
قيد التقدم (In Progress)
مكتملة** (Completed) 



تملة** (Completed)
Courses grid:
Course card:
Thumbnail
Title
Progress bar with percentage
"متابعة التعلم" (Continue Learning) button → last accessed lesson
Or "ابدأ الآن" (Start Now) if not started
Empty state if no enrollments:
"لم تسجل في أي دورة بعد"
"تصفح الدورات" button → courses catalog
/a/[tenantSlug]/my-progress - Overall Progress Dashboard
Protected route
Overview cards:
إجمالي الدورات المسجلة (Total Enrolled Courses)
الدورات المكتملة (Completed Courses)
إجمالي ساعات التعلم (Total Learning Hours)
معدل الإكمال (Average Completion Rate)
Progress list:
Table/cards showing each course:
Course name
Progress percentage
Completed lessons / Total lessons
Last accessed date
Visual progress bar
"متابعة" button
Charts:
Learning activity over time (bar chart)
Courses completion status (pie chart)
/a/[tenantSlug]/learn/[courseSlug] - Course Player (First Lesson)
Redirects to first lesson: /a/[tenantSlug]/learn/[courseSlug]/[firstLessonId]
/a/[tenantSlug]/learn/[courseSlug]/[lessonId] - Lesson Player
Protected route (must be enrolled)
Layout: Two-column (sidebar + main content)
Sidebar (Right side in RTL):
Course title at top
Progress indicator: "X% مكتمل" (X% Complete)
Sections list (accordion):
Section title (collapsible)
Lessons list:
Lesson title
Type icon
Duration (for video)
Completion checkmark if completed
Active lesson highlighted
Click to navigate to lesson
"الخروج من الدورة" (Exit Course) button at bottom → my-courses
Main Content Area:
Breadcrumbs: Course > Section > Lesson
Lesson title
Lesson content based on type:
Video lesson:
Video player (HTML5 or custom player)
Controls: Play/pause, volume, playback speed, fullscreen
Progress tracking: Save playback position on pause/exit
Auto-mark as complete when video ends (optional)
PDF lesson:
Embedded PDF viewer (using browser's PDF viewer or library like PDF.js)
Download button
Text lesson:
Rich text content display
Proper Arabic typography
Images and formatting preserved
Lesson description (if any)
Resources section (if any):
List of downloadable resources
File name, size, download link
Mark as Complete button:
Large, prominent button
Changes to "مكتمل ✓" (Completed) when marked
Click to mark/unmark completion
Auto-advances to next lesson after marking (with option to stay)
Navigation buttons:
"الدرس السابق" (Previous Lesson) button (disabled if first)
"الدرس التالي" (Next Lesson) button (disabled if last)
Notes section (future):
Student can write notes
Timestamped for video lessons
On lesson completion:
Update progress in database
Update sidebar progress percentage
If last lesson: Show course completion modal
Congratulations message
"مبروك! لقد أكملت الدورة" (Congratulations! You've completed the course)
Certificate download button (future)
"عودة إلى دوراتي" button
/a/[tenantSlug]/subscription - Manage Subscription
Protected route (must be logged in)
If subscribed:
Subscription status card:
Plan name (monthly/annual)
Status badge (active/cancelled/expired)
Next billing date (if active)
Price per period
Payment method (last 4 digits)
Manage section:
If active:
"إلغاء الاشتراك" (Cancel Subscription) button
Warning: "سيستمر الوصول حتى نهاية الفترة الحالية"
Cancellation modal:
Confirmation message
Optional: Reason for cancellation (select)
Confirm cancel button
If cancelled but not expired:
"إعادة تفعيل الاشتراك" (Reactivate Subscription) button
If expired:
"اشترك مرة أخرى" (Subscribe Again) button → subscription checkout
Billing history:
Table of past payments:
Date, Amount, Status, Invoice
Download invoice button (PDF)
Benefits section:
What you get with subscription
Access to all X courses
If not subscribed:
Empty state:
"لست مشتركاً حالياً" (You're not currently subscribed)
Benefits list
Pricing cards (monthly/annual)
"اشترك الآن" buttons → subscription checkout
/a/[tenantSlug]/exams - Available Exams
Protected route
Filters:
Status: All, Available, Completed
Course (if exam linked to course)
Exams grid/list:
Exam card:
Title
Description snippet
Type badge (MCQ/Essay/Mixed)
Duration (if set)
Passing score
Your best score (if attempted)
Attempts: X of Y (if limited)
Status: Available, Completed, Passed, Failed
Actions:
"ابدأ الامتحان" (Start Exam) button if available
"إعادة المحاولة" (Retry) if attempts remaining
"عرض النتيجة" (View Result) if completed
Lock icon if not visible based on rules
Empty state if no exams:
"لا توجد امتحانات متاحة حالياً"
/a/[tenantSlug]/exams/[examId] - Take Exam
Protected route
Check if student can access (visibility rules, attempts)
Exam header:
Exam title
Instructions (expandable/collapsible)
Timer (if duration set):
Countdown display in corner
Warning when 5 minutes left (color change)
Alert when 1 minute left
Auto-submit when time expires
Question display:
Question palette (top or sidebar):
Grid of question numbers
Visual indicators:
Answered (filled circle)
Not answered (empty circle)
Current question (highlighted)
Marked for review (flag icon)
Click to jump to question
Current question:
Question number and total: "السؤال 5 من 20"
Question text (rich text, can include images)
Points: "X نقطة/نقاط"
Answer input based on type:
MCQ: Radio buttons with options
True/False: Two radio buttons (صح/خطأ)
Essay: Large textarea (with character count)
"وضع علامة للمراجعة" (Mark for Review) checkbox
Navigation:
"السابق" (Previous) button
"التالي" (Next) button
"إنهاء الامتحان" (Finish Exam) button:
Always visible (sticky bottom bar)
Shows warning if unanswered questions
Confirmation modal:
"هل أنت متأكد من إنهاء الامتحان؟"
Summary: Answered X of Y questions
List of unanswered questions
"العودة للامتحان" (Go Back) button
"تأكيد الإرسال" (Confirm Submit) button
On submit:
Save all answers to backend
Calculate score (auto-grade MCQ)
If show results immediately: redirect to result page
Else: Show success message and redirect to my-exams
/a/[tenantSlug]/exams/[examId]/result - Exam Result
Protected route
If not graded yet (essay questions):
"قيد التصحيح" (Being Graded) message
"سيتم إشعارك عند اكتمال التصحيح"
"العودة إلى الامتحانات" button
If graded:
Result header:
Score card (large):
"X من Y نقطة" (X out of Y points)
Percentage: "Z%"
Pass/Fail badge with appropriate color
Pass message: "مبروك! لقد نجحت" or Fail message: "للأسف، لم تنجح"
Attempt number: "المحاولة رقم X"
Date and time
Time spent: "X دقيقة"
Overall feedback (if provided by instructor):
Text display
Review answers section:
List all questions:
Question text
Your answer
Based on type:
MCQ:
Show your selected option
Show correct answer
Checkmark if correct, X if wrong
Show explanation (if provided)
Essay:
Show your answer
Points awarded
Instructor feedback (if provided)
Points earned: "X من Y نقطة"
Actions:
If attempts remaining:
"إعادة المحاولة" (Retry Exam) button
Shows remaining attempts
"العودة إلى الامتحانات" button
"طباعة النتيجة" (Print Result) button
/a/[tenantSlug]/my-exams - Exam History
Protected route
Table of all exam submissions:
Columns: Exam, Attempt, Score, Status, Date, Actions
Actions: View Result
Filter by status: All, Passed, Failed, Being Graded
Sort by date (newest first)
Empty state if no submissions
/a/[tenantSlug]/profile - Student Profile
Protected route
Tabs:
الملف الشخصي (Profile):
Profile picture upload
Name (editable)
Email (read-only or editable with verification)
Custom field values (display, some editable based on config)
Bio (textarea)
Save button
الأمان (Security):
Change password:
Current password
New password
Confirm new password
Change button
الإشعارات (Notifications) - future:
Email notification preferences
Toggles for different notification types
/a/[tenantSlug]/notifications - Notification Center
Protected route
List of notifications:
Notification card:
Icon (based on type)
Title
Message
Time (relative: "منذ ساعتين")
Unread indicator (blue dot)
Click to mark as read and go to related page
Filters: All, Unread
"وضع علامة كمقروء على الكل" (Mark All as Read) button
Empty state: "لا توجد إشعارات"
==================================================== 6. BACKEND MODULES – RESPONSIBILITIES
In the NestJS monolith (/backend):
6.1 AuthModule
Responsibilities:
User registration (instructor and student)
User authentication (login)
JWT token generation and validation
Email verification
Password reset flow
Refresh token mechanism
Endpoints:
Instructor Registration:
POST /auth/instructor/register
Body: { name, email, password, academyName, plan }
Creates User (role=instructor, emailVerified=false)
Creates Tenant (ownerUserId, name, slug auto-generated, plan)
Sends verification email
Returns: { message, userId, tenantId }
Student Registration:
POST /auth/student/register
Headers: X-Tenant-Id or extracted from subdomain/domain
Body: { name, email, password, customFields: {} }
Creates User (role=student, tenantId)
Creates StudentProfile with customFields
Sends verification email (if tenant requires)
Returns: { message, userId } or auto-login tokens
Login (All Roles):
POST /auth/login
Body: { email, password, tenantId? }
For students: tenantId required (from context)
Validates credentials
Generates access token (15 min) and refresh token (7 days)
Returns: { accessToken, refreshToken, user: { id, name, email, role, tenantId } }
Refresh Token:
POST /auth/refresh
Body: { refreshToken }
Validates refresh token
Generates new access token
Optionally rotates refresh token
Returns: { accessToken, refreshToken }
Email Verification:
POST /auth/verify-email
Body: { token }
Validates token
Sets emailVerified = true
Returns: { message }
Request Password Reset:
POST /auth/forgot-password
Body: { email, tenantId? }
Finds user
Generates reset token (expires in 1 hour)
Sends reset email
Returns: { message }
Reset Password:
POST /auth/reset-password
Body: { token, newPassword }
Validates token and expiry
Hashes and updates password
Clears reset token
Returns: { message }
Logout:
POST /auth/logout
Headers: Authorization: Bearer <token>
Optionally invalidate refresh token (if stored)
Returns: { message }
Guards & Strategies:
JwtAuthGuard: Validates access token
RolesGuard: Checks user role
TenantGuard: Validates tenantId ownership

6.2 TenantModule
Responsibilities:
Tenant CRUD operations
Tenant settings management
Branding/theme configuration
Subscription pricing settings
Domain/subdomain management
Endpoints:
Get Tenant by Slug:
GET /tenants/slug/:slug
Public endpoint
Returns: Tenant with branding, settings (for rendering academy site)
Get My Tenant (Instructor):
GET /tenants/me
Auth: Instructor
Returns: Tenant owned by logged-in instructor
Update Tenant Settings:
PATCH /tenants/:id
Auth: Instructor (owner)
Body: { name?, slug?, description?, branding?, settings?, subscriptionPricing? }
Validates slug uniqueness
Updates tenant
Returns: Updated tenant
Check Slug Availability:
GET /tenants/check-slug/:slug
Returns: { available: boolean }
Get Tenant Stats (Instructor):
GET /tenants/:id/stats
Auth: Instructor (owner)
Returns: { totalStudents, totalCourses, totalRevenue, subscribersCount }
Admin Endpoints:
List All Tenants:
GET /admin/tenants
Auth: Admin
Query: { status?, plan?, search?, page?, limit? }
Returns: Paginated list of tenants with owner info
Get Tenant Details:
GET /admin/tenants/:id
Auth: Admin
Returns: Detailed tenant info with stats
Suspend Tenant:
PATCH /admin/tenants/:id/suspend
Auth: Admin
Body: { reason }
Sets status = suspended
Sends notification to instructor
Returns: { message }
Activate Tenant:
PATCH /admin/tenants/:id/activate
Auth: Admin
Sets status = active
Returns: { message }

6.3 UserModule
Responsibilities:
User profile management
User retrieval
User search (for admin)
Endpoints:
Get My Profile:
GET /users/me
Auth: Any authenticated user
Returns: User profile (excludes passwordHash)
Update My Profile:
PATCH /users/me
Auth: Any authenticated user
Body: { name?, avatar? }
Updates user
Returns: Updated user
Change Password:
POST /users/me/change-password
Auth: Any authenticated user
Body: { currentPassword, newPassword }
Validates current password
Updates password
Returns: { message }
Admin Endpoints:
List Instructors:
GET /admin/users/instructors
Auth: Admin
Query: { search?, page?, limit? }
Returns: Paginated list of instructors
List Students by Tenant:
GET /admin/users/students
Auth: Admin
Query: { tenantId?, search?, page?, limit? }
Returns: Paginated list of students

6.4 CourseModule
Responsibilities:
Course CRUD (instructor)
Lesson CRUD (instructor)
Course publishing
Public course queries
Course analytics
Endpoints:
Instructor Endpoints:
Create Course:
POST /courses
Auth: Instructor
Body: { title, description, price, category, tags, level, thumbnail?, ... }
Auto-generates slug from title
Sets tenantId from user
Sets status = draft
Returns: Created course
Get My Courses:
GET /courses/me
Auth: Instructor
Query: { status?, search?, page?, limit? }
Returns: Instructor's courses (all statuses)
Get Course by ID:
GET /courses/:id
Auth: Instructor (owner) or Admin
Returns: Course with lessons
Update Course:
PATCH /courses/:id
Auth: Instructor (owner)
Body: Partial course data
Returns: Updated course
Publish Course:
PATCH /courses/:id/publish
Auth: Instructor (owner)
Validates course has lessons
Sets status = published, publishedAt = now
Returns: { message }
Unpublish Course:
PATCH /courses/:id/unpublish
Auth: Instructor (owner)
Sets status = draft
Returns: { message }
Delete Course:
DELETE /courses/:id
Auth: Instructor (owner)
Soft delete (deletedAt = now)
Or hard delete if no enrollments
Returns: { message }
Duplicate Course:
POST /courses/:id/duplicate
Auth: Instructor (owner)
Clones course and lessons
Sets status = draft
Returns: New course
Course Analytics:
GET /courses/:id/analytics
Auth: Instructor (owner)
Returns: { enrollments, completionRate, revenue, avgProgress }
Lesson Endpoints:
Create Lesson:
POST /courses/:courseId/lessons
Auth: Instructor (owner)
Body: { title, type, contentURL?, textContent?, duration?, order?, isFree? }
Returns: Created lesson
Get Lessons:
GET /courses/:courseId/lessons
Auth: Instructor (owner) or enrolled student
Returns: List of lessons (ordered)
Update Lesson:
PATCH /lessons/:id
Auth: Instructor (owner)
Body: Partial lesson data
Returns: Updated lesson
Delete Lesson:
DELETE /lessons/:id
Auth: Instructor (owner)
Deletes lesson
Returns: { message }
Reorder Lessons:
PATCH /courses/:courseId/lessons/reorder
Auth: Instructor (owner)
Body: { lessonIds: [id1, id2, id3, ...] } (in new order)
Updates order field for each lesson
Returns: { message }
Public Endpoints (Student):
Get Published Courses by Tenant:
GET /tenants/:tenantSlug/courses
Public (or auth: student)
Query: { category?, level?, search?, page?, limit? }
Returns: Published courses only
Get Course Details:
GET /tenants/:tenantSlug/courses/:courseSlug
Public (or auth: student)
Returns: Course details with curriculum (lessons metadata, not content)
Preview Free Lesson:
GET /lessons/:lessonId/preview
Public (if lesson.isFree)
Returns: Lesson content for preview
Admin Endpoints:
List All Courses:
GET /admin/courses
Auth: Admin
Query: { tenantId?, status?, search?, page?, limit? }
Returns: All courses across tenants
Block Course:
PATCH /admin/courses/:id/block
Auth: Admin
Body: { reason }
Sets status = blocked
Returns: { message }
Unblock Course:
PATCH /admin/courses/:id/unblock
Auth: Admin
Sets status = published (or draft, based on previous state)
Returns: { message }

6.5 EnrollmentModule
Responsibilities:
Create enrollments (after payment or subscription)
Get enrollments for student
Get enrollments for instructor
Check enrollment access
Track overall course progress
Endpoints:
Student Endpoints:
Get My Enrollments:
GET /enrollments/me
Auth: Student
Query: { status?, page?, limit? }
Returns: Student's enrollments with course info and progress
Get Enrollment Details:
GET /enrollments/:id
Auth: Student (owner)
Returns: Enrollment with detailed progress
Check Course Access:
GET /enrollments/access/:courseId
Auth: Student
Checks if student has access (via purchase or subscription)
Returns: { hasAccess: boolean, source: 'purchase' | 'subscription' }
Instructor Endpoints:
Get Enrollments for Course:
GET /courses/:courseId/enrollments
Auth: Instructor (owner)
Query: { status?, page?, limit? }
Returns: List of enrollments with student info
Get Student Progress in Course:
GET /enrollments/:enrollmentId/progress
Auth: Instructor (owner)
Returns: Detailed progress (completed lessons, time spent)
Internal Endpoints (called by other modules):
Create Enrollment:
POST /enrollments (internal)
Called by PaymentModule after successful course purchase
Or called by SubscriptionModule when subscription activated
Body: { studentUserId, courseId, tenantId, accessType, transactionId?, subscriptionId? }
Returns: Created enrollment

6.6 ProgressModule
Responsibilities:
Track lesson completion
Update course progress percentage
Get lesson progress
Track video playback position
Endpoints:
Mark Lesson as Complete:
POST /progress/lessons/:lessonId/complete
Auth: Student (enrolled in course)
Checks enrollment
Creates or updates Progress record (completed = true, completedAt = now)
Updates Enrollment progress (recalculate percentage)
Returns: { message, progress }
Mark Lesson as Incomplete:
POST /progress/lessons/:lessonId/incomplete
Auth: Student
Updates Progress (completed = false)
Updates Enrollment progress
Returns: { message, progress }
Save Video Progress:
POST /progress/lessons/:lessonId/video-progress
Auth: Student
Body: { lastPosition, watchTime }
Updates Progress record
Returns: { message }
Get Lesson Progress:
GET /progress/lessons/:lessonId
Auth: Student
Returns: Progress record (completed, lastPosition, watchTime)
Get Course Progress:
GET /progress/courses/:courseId
Auth: Student or Instructor (if viewing student progress)
Returns: All lesson progress for the course

6.7 PaymentModule
Responsibilities:
Paymob integration
Create payment transactions
Handle payment webhooks
Transaction management
Revenue calculations
Payout requests
Endpoints:
Student Endpoints:
Initiate Course Payment:
POST /payments/course/:courseId
Auth: Student
Body: { discountCode? }
Validates course and student
Validates discount code if provided
Calculates final amount after discount
Calculates commission based on instructor's tier
Creates Transaction (status = pending)
Integrates with Paymob: creates payment intent
Returns: { transactionId, paymentUrl } (redirect to Paymob)
Initiate Subscription Payment:
POST /payments/subscription
Auth: Student
Body: { plan: 'monthly' | 'annual', discountCode? }
Gets tenant's subscription pricing
Validates discount code
Calculates final amount
Creates Transaction (type = subscription, status = pending)
Creates Paymob payment intent
Returns: { transactionId, paymentUrl }
Payment Callback (Paymob):
POST /payments/callback
Public endpoint (called by Paymob)
Body: Paymob callback data (includes transaction reference)
Verifies signature
Finds Transaction by providerReferenceId
Updates Transaction status (success/failed)
If success:
If type = course: Create Enrollment
If type = subscription: Activate Subscription
Send confirmation email
Returns: { success: true }
Payment Webhook (Paymob):
POST /payments/webhook
Similar to callback but for async notifications
Handles payment status updates
Get Transaction Status:
GET /payments/transactions/:id
Auth: Student (owner) or Instructor (if in their tenant) or Admin
Returns: Transaction details
Instructor Endpoints:
Get My Transactions:
GET /payments/transactions/me
Auth: Instructor
Query: { type?, status?, dateFrom?, dateTo?, page?, limit? }
Returns: Transactions in instructor's tenant
Get Revenue Summary:
GET /payments/revenue/summary
Auth: Instructor
Returns: { totalRevenue, totalCommission, netEarnings, availableBalance, pendingPayouts }
Get Current Commission Tier:
GET /payments/commission-tier
Auth: Instructor
Calculates cumulative revenue
Returns: { currentTier, commissionPercentage, totalRevenue, nextTier?, revenueToNextTier? }
Request Payout:
POST /payments/payouts
Auth: Instructor
Body: { amount, paymentMethod, paymentDetails, notes? }
Validates amount <= available balance
Validates amount >= minimum threshold
Creates Payout (status = pending)
Captures current commission tier
Calculates breakdown
Sends notification to admin
Returns: Created payout
Get My Payouts:
GET /payments/payouts/me
Auth: Instructor
Query: { status?, page?, limit? }
Returns: Instructor's payout requests
Admin Endpoints:
Get All Transactions:
GET /admin/payments/transactions
Auth: Admin
Query: { tenantId?, type?, status?, dateFrom?, dateTo?, page?, limit? }
Returns: All transactions across platform
Get Payout Requests:
GET /admin/payments/payouts
Auth: Admin
Query: { status?, page?, limit? }
Returns: All payout requests
Get Payout Details:
GET /admin/payments/payouts/:id
Auth: Admin
Returns: Detailed payout with calculation breakdown
Approve Payout:
PATCH /admin/payments/payouts/:id/approve
Auth: Admin
Sets status = approved
Sends notification to instructor
Returns: { message }
Reject Payout:
PATCH /admin/payments/payouts/:id/reject
Auth: Admin
Body: { reason }
Sets status = rejected
Sends notification with reason
Returns: { message }
Mark Payout as Paid:
PATCH /admin/payments/payouts/:id/paid
Auth: Admin
Body: { paymentReference? }
Sets status = paid, paidAt = now
Deducts from instructor's available balance
Sends confirmation notification
Returns: { message }
Platform Revenue Stats:
GET /admin/payments/stats
Auth: Admin
Returns: { totalRevenue, totalCommission, totalPayouts, pendingPayouts }

6.8 SubscriptionModule
Responsibilities:
Subscription CRUD
Activate subscription after payment
Check subscription status
Cancel subscription
Handle subscription renewals
Grant course access to subscribers
Endpoints:
Student Endpoints:
Get My Subscription:
GET /subscriptions/me
Auth: Student
Query: { tenantId } (from context)
Returns: Active or most recent subscription
Cancel Subscription:
POST /subscriptions/:id/cancel
Auth: Student (owner)
Body: { reason? }
Sets autoRenew = false, status = cancelled, cancelledAt = now
Access continues until currentPeriodEnd
Returns: { message, subscription }
Reactivate Subscription:
POST /subscriptions/:id/reactivate
Auth: Student (owner)
Only if cancelled but not expired
Sets autoRenew = true, status = active, cancelledAt = null
Returns: { message, subscription }
Get Subscription Billing History:
GET /subscriptions/:id/billing-history
Auth: Student (owner)
Returns: List of transactions for this subscription
Instructor Endpoints:
Get Subscription Stats:
GET /subscriptions/stats
Auth: Instructor
Returns: { totalSubscribers, activeSubscribers, revenue, churnRate }
Get Subscribers List:
GET /subscriptions/subscribers
Auth: Instructor
Query: { status?, page?, limit? }
Returns: List of students with active subscriptions
Internal Endpoints:
Create/Activate Subscription:
POST /subscriptions (internal)
Called by PaymentModule after successful subscription payment
Body: { studentUserId, tenantId, plan, price, transactionId }
Creates Subscription (status = active)
Grants access to all published courses (creates enrollments)
Returns: Created subscription
Renew Subscription:
POST /subscriptions/:id/renew (internal/cron)
Called by recurring billing process
Attempts payment
If success: Extends currentPeriodEnd
If fail: Updates status to past_due, retries later
Returns: { success, message }
Expire Subscription:
POST /subscriptions/:id/expire (internal/cron)
Called when currentPeriodEnd passed and not renewed
Sets status = expired
Revokes access to subscription-based enrollments
Returns: { message }

6.9 DiscountModule
Responsibilities:
Discount code CRUD (instructor)
Validate discount codes
Track discount usage
Apply discounts to transactions
Endpoints:
Instructor Endpoints:
Create Discount:
POST /discounts
Auth: Instructor
Body: { code, name, description?, type, applicableTo?, discountType, value, maxUses?, validFrom?, validTo? }
Validates code uniqueness per tenant
Converts code to uppercase
Returns: Created discount
Get My Discounts:
GET /discounts/me
Auth: Instructor
Query: { status?, type?, page?, limit? }
Returns: Instructor's discount codes
Update Discount:
PATCH /discounts/:id
Auth: Instructor (owner)
Body: Partial discount data
Returns: Updated discount
Activate/Deactivate Discount:
PATCH /discounts/:id/status
Auth: Instructor (owner)
Body: { status: 'active' | 'inactive' }
Returns: { message }
Delete Discount:
DELETE /discounts/:id
Auth: Instructor (owner)
Only if usedCount = 0
Returns: { message }
Get Discount Usage:
GET /discounts/:id/usage
Auth: Instructor (owner)
Returns: Usage stats and list of students who used it
Public/Student Endpoints:
Validate Discount Code:
POST /discounts/validate
Auth: Student
Body: { code, tenantId, type: 'course' | 'subscription', courseId? }
Finds discount by code and tenantId
Validates:
Status is active
Type matches (or type = 'all')
If course-specific: courseId in applicableTo
Not expired (validFrom/validTo)
maxUses not exceeded
Returns: { valid: boolean, discount?, discountAmount?, message? }
Internal:
Apply Discount:
POST /discounts/:id/apply (internal)
Called by PaymentModule when creating transaction
Increments usedCount
Creates DiscountUsage record
Returns: { discountAmount }

6.10 ExamModule
Responsibilities:
Exam CRUD (instructor)
Question CRUD
Exam submission handling
Auto-grading MCQ
Manual grading essays
Visibility rules evaluation
Endpoints:
Instructor Endpoints:
Create Exam:
POST /exams
Auth: Instructor
Body: { title, description, instructions?, type, courseId?, passingScore, duration?, maxAttempts?, availableFrom?, availableTo?, showResultsImmediately?, shuffleQuestions? }
Returns: Created exam
Get My Exams:
GET /exams/me
Auth: Instructor
Query: { status?, courseId?, page?, limit? }
Returns: Instructor's exams
Update Exam:
PATCH /exams/:id
Auth: Instructor (owner)
Body: Partial exam data
Returns: Updated exam
Publish/Unpublish Exam:
PATCH /exams/:id/publish
PATCH /exams/:id/unpublish
Auth: Instructor (owner)
Updates status
Returns: { message }
Delete Exam:
DELETE /exams/:id
Auth: Instructor (owner)
Only if no submissions
Returns: { message }
Question Management:
Add Question:
POST /exams/:examId/questions
Auth: Instructor (owner)
Body: { type, questionText, explanation?, order?, points, options?, correctAnswer? }
Auto-increments totalPoints in exam
Returns: Created question
Get Questions:
GET /exams/:examId/questions
Auth: Instructor (owner) or Student (when taking exam)
Returns: List of questions (ordered)
Update Question:
PATCH /questions/:id
Auth: Instructor (owner)
Body: Partial question data
Returns: Updated question
Delete Question:
DELETE /questions/:id
Auth: Instructor (owner)
Decrements totalPoints in exam
Returns: { message }
Reorder Questions:
PATCH /exams/:examId/questions/reorder
Auth: Instructor (owner)
Body: { questionIds: [...] }
Returns: { message }
Visibility Rules:
Add Visibility Rule:
POST /exams/:examId/visibility-rules
Auth: Instructor (owner)
Body: { customField, operator, value }
Returns: { message }
Remove Visibility Rule:
DELETE /exams/:examId/visibility-rules/:ruleIndex
Auth: Instructor (owner)
Returns: { message }
Submissions & Grading:
Get Exam Submissions:
GET /exams/:examId/submissions
Auth: Instructor (owner)
Query: { status?, studentId?, page?, limit? }
Returns: List of submissions with student info
Get Submission Details:
GET /submissions/:id
Auth: Instructor (owner)
Returns: Submission with all answers
Grade Submission:
PATCH /submissions/:id/grade
Auth: Instructor (owner)
Body: { answers: [{ questionId, pointsEarned, feedback? }], overallFeedback? }
Calculates totalScore
Sets status = graded, gradedAt = now
Sends notification to student
Returns: { message, submission }
Exam Analytics:
GET /exams/:examId/analytics
Auth: Instructor (owner)
Returns: { totalSubmissions, avgScore, passRate, questionDifficulty: [...] }
Student Endpoints:
Get Available Exams:
GET /tenants/:tenantSlug/exams
Auth: Student
Evaluates visibility rules based on student's custom fields
Returns: List of exams student can access
Get Exam Details:
GET /exams/:examId
Auth: Student
Checks access (visibility rules, attempts remaining)
Returns: Exam details (without questions yet)
Start Exam:
POST /exams/:examId/start
Auth: Student
Validates student can take exam
Creates ExamSubmission (status = in_progress, startedAt = now)
Returns: { submissionId, questions } (shuffled if configured)
Save Exam Progress:
PATCH /submissions/:id/progress
Auth: Student (owner)
Body: { answers: [{ questionId, answer }] }
Updates submission answers
Returns: { message }
Submit Exam:
POST /submissions/:id/submit
Auth: Student (owner)
Body: { answers: [{ questionId, answer }] }
Sets status = submitted, submittedAt = now
Calculates timeSpent
Auto-grades MCQ questions:
Compares answer with correctAnswer
Sets isCorrect and pointsEarned
For essay questions: pointsEarned = null (pending grading)
If all MCQ: Sets totalScore and status = graded
If has essay: Keeps status = submitted (awaits grading)
If showResultsImmediately and graded: Returns result
Else: Returns { message }
Get My Exam Submissions:
GET /exams/submissions/me
Auth: Student
Query: { examId?, status?, page?, limit? }
Returns: Student's exam submissions
Get Submission Result:
GET /submissions/:id/result
Auth: Student (owner)
Only if status = graded
Returns: Submission with detailed results, correct answers, explanations, feedback

6.11 CustomFieldModule
Responsibilities:
Custom field CRUD (instructor)
Store student custom field values
Query/filter students by custom fields
Validate custom fields at student registration
Endpoints:
Instructor Endpoints:
Create Custom Field:
POST /custom-fields
Auth: Instructor
Body: { fieldName, label, fieldType, options?, required?, placeholder?, helpText?, validation? }
Auto-generates fieldName (snake_case) if not provided
Returns: Created custom field
Get My Custom Fields:
GET /custom-fields/me
Auth: Instructor
Returns: List of custom fields (ordered)
Update Custom Field:
PATCH /custom-fields/:id
Auth: Instructor (owner)
Body: Partial field data
Returns: Updated field
Reorder Custom Fields:
PATCH /custom-fields/reorder
Auth: Instructor
Body: { fieldIds: [...] }
Returns: { message }
Delete Custom Field:
DELETE /custom-fields/:id
Auth: Instructor (owner)
Warning if field has values in StudentProfiles
Returns: { message }
Public/Student Endpoints:
Get Custom Fields for Registration:
GET /tenants/:tenantSlug/custom-fields
Public
Returns: List of custom fields for signup form
Internal:
Validate Custom Fields:
POST /custom-fields/validate (internal)
Called by AuthModule during student registration
Body: { tenantId, customFields: {} }
Validates all required fields present
Validates field types and values
Returns: { valid: boolean, errors?: [] }
Create/Update Student Profile:
POST /student-profiles (internal)
PATCH /student-profiles/:userId (internal)
Stores custom field values
Returns: StudentProfile
Query Students by Custom Fields:
GET /students/filter
Auth: Instructor
Query: { customFields: { fieldName: value, ... }, page?, limit? }
Returns: Filtered list of students

6.12 CommissionModule
Responsibilities:
Commission tier CRUD (admin only)
Calculate commission for transactions
Track instructor revenue and tier progression
Provide commission breakdown
Endpoints:
Admin Endpoints:
Create Commission Tier:
POST /admin/commissions/tiers
Auth: Admin
Body: { name, minRevenue, maxRevenue?, commissionPercentage, description? }
Validates no overlapping ranges
Returns: Created tier
Get All Tiers:
GET /admin/commissions/tiers
Auth: Admin
Returns: List of tiers (ordered)
Update Tier:
PATCH /admin/commissions/tiers/:id
Auth: Admin
Body: Partial tier data
Returns: Updated tier
Reorder Tiers:
PATCH /admin/commissions/tiers/reorder
Auth: Admin
Body: { tierIds: [...] }
Returns: { message }
Delete Tier:
DELETE /admin/commissions/tiers/:id
Auth: Admin
Cannot delete if instructors are in this tier
Returns: { message }
Instructor Endpoints:
Get My Commission Info:
GET /commissions/me
Auth: Instructor
Calculates cumulative revenue
Determines current tier
Returns: { currentTier, commissionPercentage, totalRevenue, revenueInTier, nextTier?, revenueToNextTier? }
Internal:
Calculate Commission for Transaction:
POST /commissions/calculate (internal)
Called by PaymentModule before creating transaction
Body: { instructorId, amount }
Gets instructor's total revenue
Finds applicable tier
Calculates: commissionAmount = amount × (tier.commissionPercentage / 100)
Returns: { commissionPercentage, commissionAmount, instructorEarnings }

6.13 UiConfigModule (Server-Driven UI)
Responsibilities:
Page CRUD (instructor)
PageSection CRUD
Provide API to render academy pages
Template management
Endpoints:
Instructor Endpoints:
Create Page:
POST /pages
Auth: Instructor
Body: { name, path, template?, seo? }
Auto-generates slug from name
Returns: Created page
Get My Pages:
GET /pages/me
Auth: Instructor
Query: { status?, page?, limit? }
Returns: List of pages
Update Page:
PATCH /pages/:id
Auth: Instructor (owner)
Body: Partial page data
Returns: Updated page
Publish/Unpublish Page:
PATCH /pages/:id/publish
PATCH /pages/:id/unpublish
Auth: Instructor (owner)
Updates status
Returns: { message }
Delete Page:
DELETE /pages/:id
Auth: Instructor (owner)
Cannot delete home page
Returns: { message }
Set as Home Page:
PATCH /pages/:id/set-home
Auth: Instructor (owner)
Sets isHome = true
Unsets other pages' isHome
Returns: { message }
Section Management:
Add Section to Page:
POST /pages/:pageId/sections
Auth: Instructor (owner)
Body: { type, order?, props?, visible? }
Returns: Created section
Get Page Sections:
GET /pages/:pageId/sections
Auth: Instructor (owner) or Public (if page published)
Returns: List of sections (ordered, visible only if public)
Update Section:
PATCH /sections/:id
Auth: Instructor (owner)
Body: { order?, props?, visible? }
Returns: Updated section
Delete Section:
DELETE /sections/:id
Auth: Instructor (owner)
Returns: { message }
Reorder Sections:
PATCH /pages/:pageId/sections/reorder
Auth: Instructor (owner)
Body: { sectionIds: [...] }
Returns: { message }
Public Endpoints (for rendering academy):
Get Page by Path:
GET /tenants/:tenantSlug/pages
Query: { path } (e.g., path="/")
Returns: Page with sections (only published, visible sections)
Get Navigation Pages:
GET /tenants/:tenantSlug/pages/navigation
Returns: List of pages where showInNavbar = true (ordered by navOrder)

6.14 DomainModule (Phase 2)
Responsibilities:
Subdomain management
Custom domain management
DNS verification
Domain routing
Endpoints:
Instructor Endpoints:
Set Subdomain:
PATCH /domains/subdomain
Auth: Instructor
Body: { subdomain }
Validates subdomain availability and format
Updates tenant
Returns: { message, subdomain }
Add Custom Domain:
POST /domains/custom
Auth: Instructor
Body: { domain }
Generates verification token
Returns: { domain, verificationToken, dnsInstructions }
Verify Custom Domain:
POST /domains/custom/verify
Auth: Instructor
Checks DNS records for verification token
If verified: Sets status = verified, configures SSL
Else: Returns error
Returns: { verified: boolean, message }
Remove Custom Domain:
DELETE /domains/custom
Auth: Instructor
Removes custom domain config
Returns: { message }
Get Domain Status:
GET /domains/status
Auth: Instructor
Returns: { subdomain?, customDomain?, status, verificationToken? }
Public:
Resolve Tenant by Domain:
GET /domains/resolve
Query: { domain } or { subdomain }
Returns: { tenantId, tenantSlug }
Used by frontend to determine which tenant to load

6.15 EmailModule
Responsibilities:
Email sending abstraction
Template rendering (Arabic templates)
Queue management (future)
Email tracking (future)
Email Templates (all in Arabic):
Email Verification (email-verification.hbs):
Subject: "تفعيل حسابك"
Body: Greeting, verification link, CTA button, footer
Password Reset (password-reset.hbs):
Subject: "إعادة تعيين كلمة المرور"
Body: Reset link (expires in 1 hour), CTA button
Password Changed (password-changed.hbs):
Subject: "تم تغيير كلمة المرور"
Body: Confirmation message, security notice
Course Purchase Receipt (course-purchase-receipt.hbs):
Subject: "إيصال الشراء - [Course Title]"
Body: Course details, amount paid, access link, invoice
Subscription Confirmation (subscription-confirmation.hbs):
Subject: "تم تفعيل اشتراكك"
Body: Plan details, billing date, access to all courses
Subscription Renewal (subscription-renewal.hbs):
Subject: "تم تجديد اشتراكك"
Body: Renewal confirmation, next billing date
Subscription Cancelled (subscription-cancelled.hbs):
Subject: "تم إلغاء اشتراكك"
Body: Cancellation confirmation, access until period end
Subscription Expired (subscription-expired.hbs):
Subject: "انتهى اشتراكك"
Body: Expiration notice, resubscribe CTA
Payment Failure (payment-failure.hbs):
Subject: "فشلت عملية الدفع"
Body: Failure notice, retry instructions
Payout Request Received (payout-request-received.hbs):
Subject: "تم استلام طلب السحب"
Body: Amount, processing time, status tracking
Payout Approved (payout-approved.hbs):
Subject: "تمت الموافقة على طلب السحب"
Body: Amount, payment details, expected transfer date
Payout Rejected (payout-rejected.hbs):
Subject: "تم رفض طلب السحب"
Body: Rejection reason, next steps
Payout Completed (payout-completed.hbs):
Subject: "تم تحويل الأموال"
Body: Confirmation, payment reference, amount
New Student Enrolled (new-student-enrolled.hbs) - to Instructor:
Subject: "طالب جديد سجل في أكاديميتك"
Body: Student name, course name, date
Exam Submission Confirmation (exam-submission-confirmation.hbs):
Subject: "تم إرسال إجاباتك - [Exam Title]"
Body: Submission confirmation, grading status
Exam Graded (exam-graded.hbs):
Subject: "تم تصحيح امتحانك - [Exam Title]"
Body: Score, pass/fail status, view result link
Service Methods:
typescript
class EmailService {
  async sendVerificationEmail(user: User, verificationLink: string): Promise<void>
  async sendPasswordResetEmail(user: User, resetLink: string): Promise<void>
  async sendPasswordChangedEmail(user: User): Promise<void>
  async sendPurchaseReceipt(student: User, transaction: Transaction, course: Course): Promise<void>
  async sendSubscriptionConfirmation(student: User, subscription: Subscription): Promise<void>
  async sendSubscriptionRenewal(student: User, subscription: Subscription): Promise<void>
  async sendSubscriptionCancelled(student: User, subscription: Subscription): Promise<void>
  async sendSubscriptionExpired(student: User, subscription: Subscription): Promise<void>
  async sendPaymentFailure(student: User, transaction: Transaction): Promise<void>
  async sendPayoutRequestReceived(instructor: User, payout: Payout): Promise<void>
  async sendPayoutApproved(instructor: User, payout: Payout): Promise<void>
  async sendPayoutRejected(instructor: User, payout: Payout, reason: string): Promise<void>
  async sendPayoutCompleted(instructor: User, payout: Payout): Promise<void>
  async sendNewStudentEnrolled(instructor: User, student: User, course: Course): Promise<void>
  async sendExamSubmissionConfirmation(student: User, exam: Exam): Promise<void>
  async sendExamGraded(student: User, exam: Exam, submission: ExamSubmission): Promise<void>
}

6.16 AdminModule
Responsibilities:
Platform overview statistics
Admin-only operations
Cross-tenant queries
Platform configuration
Endpoints:
Platform Stats:
GET /admin/stats
Auth: Admin
Returns: { totalTenants, totalInstructors, totalStudents, totalRevenue, totalCommission, pendingPayouts, growth: {...} }
Platform Configuration:
GET /admin/config
PATCH /admin/config
Auth: Admin
Manage platform-wide settings
Returns: Config object
(Other admin endpoints are distributed across modules with /admin prefix)

==================================================== 7. IMPLEMENTATION STRATEGY (PHASES)
We will implement this platform in phases, using multiple prompts. You must always respect previous design and code.
PHASE 1 – Project Setup
Create monorepo structure:
/backend NestJS project
/frontend-platform Next.js project (App Router, Tailwind, RTL)
/frontend-academy Next.js project (App Router, Tailwind, RTL)
/shared TypeScript types + Arabic translations
Setup shared env and config files
Configure Arabic fonts (Cairo font family)
Setup RTL support in both frontends:
TailwindCSS configuration with RTL utilities
dir="rtl" in HTML
Setup i18n with Arabic as default language (next-intl or react-i18next)
Install all dependencies:
Backend: NestJS, Mongoose, JWT, bcrypt, class-validator, etc.
Frontends: Next.js, React Query, Zustand, React Hook Form, Zod, date-fns (Arabic locale)
Basic folder structure for all projects
README files with setup instructions
PHASE 1.5 – Marketing Website 9) Implement marketing pages in /frontend-platform:
Landing page (/) - hero, features, pricing preview, testimonials, CTA
Features page (/features) - detailed feature descriptions
Pricing page (/pricing) - 3 tiers with comparison, Arabic content
About page (/about) - mission, team
Contact page (/contact) - contact form, info
Terms page (/terms) - Arabic terms of service
Privacy page (/privacy) - Arabic privacy policy
All content in Arabic with proper RTL layout
Responsive design (mobile-first)
Tailwind styling with Arabic typography
Contact form connected to backend EmailModule (Phase 9)
PHASE 2 – Auth + Tenant + Basic Instructor Dashboard 14) Implement AuthModule in backend:
Instructor signup/login endpoints
JWT token generation and validation
Email verification flow
Password reset flow
Implement TenantModule:
Create tenant on instructor signup
Basic tenant settings endpoints
Implement UserModule (basic profile management)
Implement EmailModule skeleton (will be fleshed out in Phase 9)
Implement authentication pages in /frontend-platform:
Signup page (/signup) - Arabic form with plan selection
Login page (/login) - Arabic form
Email verification page
Forgot/reset password pages
Implement basic instructor dashboard in /frontend-platform:
Dashboard layout with RTL sidebar
Dashboard overview page (/dashboard) - placeholder with KPIs
Protected routes (JWT guard)
Academy settings page (/dashboard/academy) - basic profile, branding
Shared types in /shared/types for User, Tenant, Auth
PHASE 3 – Course Management 21) Implement CourseModule + Lesson entities in backend:
Course CRUD endpoints
Lesson CRUD endpoints
Publish/unpublish logic
Implement file upload handling (local storage for now)
Implement instructor course UI in /frontend-platform:
Courses list page (/dashboard/courses) - Arabic table
Create course page (/dashboard/courses/new) - Arabic form with RTL
Edit course page (/dashboard/courses/[courseId]) - tabs for info, content, analytics
Lesson management (add/edit/delete/reorder) - Arabic interface
Video/PDF/text lesson forms
Shared types for Course, Lesson
React Query hooks for course operations
PHASE 4 – Student Flow & Enrollment 26) Implement student auth endpoints in AuthModule 27) Implement public course query endpoints in CourseModule 28) Implement EnrollmentModule and ProgressModule in backend 29) Implement student pages in /frontend-academy:
Academy routing by tenantSlug (/a/[tenantSlug])
Student signup page (/a/[tenantSlug]/auth/signup) - Arabic form
Student login page (/a/[tenantSlug]/auth/login) - Arabic form
Course catalog page (/a/[tenantSlug]/courses) - grid with filters, RTL
Course details page (/a/[tenantSlug]/courses/[courseSlug]) - Arabic layout
Implement student learning pages:
My courses page (/a/[tenantSlug]/my-courses) - Arabic
Course player (/a/[tenantSlug]/learn/[courseSlug]/[lessonId]) - RTL sidebar, video player
Progress tracking (mark complete, save video position)
Apply tenant branding (colors, logo) to academy pages
Shared types for Enrollment, Progress
PHASE 5 – Payments (Basic) 33) Implement PaymentModule in backend:
Paymob integration (sandbox)
Create payment transaction endpoint
Handle webhooks/callbacks
Create enrollment after successful payment
Implement checkout page in /frontend-academy:
Course checkout (/a/[tenantSlug]/checkout/course/[courseSlug]) - Arabic
Payment summary with Arabic number formatting
Redirect to Paymob
Success/failed pages - Arabic messages
Test end-to-end payment flow
Shared types for Transaction
PHASE 6 – Server-Driven UI (Academy Website) 37) Implement UiConfigModule in backend:
Page and PageSection CRUD endpoints
Public API to fetch page by path with sections
Implement Page Builder in /frontend-platform:
Pages list (/dashboard/pages) - Arabic
Page builder interface (/dashboard/pages/[pageId]) - RTL
Section library (hero, features, courses, testimonials, FAQ, CTA, etc.)
Section properties forms (all in Arabic)
Drag-and-drop or up/down reordering
Publish/unpublish pages
Implement server-driven rendering in /frontend-academy:
Fetch page config from backend
Dynamically render sections based on type and props
Apply tenant branding
Academy home page (/a/[tenantSlug]) uses page builder config
Create reusable section components (Hero, Features, etc.) with Arabic support
PHASE 7 – Finance & Payouts (Basic) 41) Implement finance endpoints in PaymentModule:
Get transactions for instructor
Calculate revenue summary
Payout request endpoint
Implement instructor finance UI in /frontend-platform:
Finance overview (/dashboard/finance) - KPIs, charts, Arabic
Transactions list (/dashboard/finance/transactions) - Arabic table, filters
Payout management (/dashboard/finance/payouts) - Arabic
Request payout page - Arabic form
Implement admin payout management in PaymentModule
Shared types for Payout
PHASE 8 – Admin Panel 45) Implement AdminModule endpoints:
Platform stats
List tenants, instructors
Payout management endpoints
Implement admin UI in /frontend-platform:
Admin login page (/admin/login) - Arabic
Admin dashboard (/admin) - overview stats, Arabic
Tenants list (/admin/tenants) - Arabic table
Tenant details (/admin/tenants/[tenantId]) - Arabic
Payout requests (/admin/payouts) - Arabic table
Approve/reject payout actions
Admin role guards and routes
PHASE 9 – Email & Notifications 48) Complete EmailModule implementation:
Setup email provider (ZeptoMail or SMTP)
Create all Arabic HTML email templates (using Handlebars or similar)
Implement all email sending methods
Connect emails to all flows:
Auth: verification, password reset
Payments: purchase receipt, payment failure
Payouts: request received, approved, rejected, completed
Students: welcome, enrollment confirmation
Test all email flows in development
Arabic email content with RTL support in HTML
PHASE 10 – Hardening & Polish 52) Implement security middlewares:
Helmet for security headers
CORS configuration (whitelist frontends)
Rate limiting on auth endpoints
Input validation on all DTOs
Implement logging:
Winston or Pino setup
Request logging with correlation IDs
Error logging
Global exception filter in NestJS:
Consistent error responses in Arabic
Don't expose internal errors
Health check endpoints (/health, /health/db)
Add indexes to MongoDB collections
Basic performance testing
Documentation updates (README, API docs)
PHASE 11 – Subscriptions & Discount Codes 59) Implement SubscriptionModule in backend:
Subscription CRUD endpoints
Activate subscription after payment
Cancel/reactivate subscription
Check subscription status
Grant course access to subscribers
Implement DiscountModule in backend:
Discount CRUD endpoints
Validate discount code
Track usage
Update PaymentModule:
Subscription payment flow
Recurring billing logic (basic, can be cron job)
Implement instructor subscription UI in /frontend-platform:
Pricing settings (/dashboard/pricing) - Arabic
Enable subscription toggle
Set monthly/annual prices
Discount management (list, create, edit) - Arabic forms
Implement student subscription pages in /frontend-academy:
Pricing page (/a/[tenantSlug]/pricing) - Arabic pricing table
Subscription checkout (/a/[tenantSlug]/checkout/subscription) - Arabic
Manage subscription page (/a/[tenantSlug]/subscription) - Arabic
Update course access logic:
Check if student has purchase OR active subscription
Grant access accordingly
Discount code application at checkout (both course and subscription) - Arabic interface
Shared types for Subscription, Discount
PHASE 12 – Custom Fields & Student Segmentation 67) Implement CustomFieldModule in backend:
Custom field CRUD endpoints
Validate custom fields at signup
Store student profile with custom fields
Query students by custom field values
Implement instructor custom fields UI in /frontend-platform:
Custom fields configuration (/dashboard/students/fields) - Arabic
Create/edit field forms with Arabic labels
Field type selection (text, select, number, date, email, phone)
Reorder fields
Update student registration in /frontend-academy:
Fetch custom fields for tenant
Dynamically render custom fields in signup form - Arabic labels
Client-side validation
Implement student filtering in /frontend-platform:
Students list (/dashboard/students) with filters - Arabic
Filter by custom field values
Export to CSV
Shared types for CustomField, StudentProfile
PHASE 13 – Exams & Assessments 72) Implement ExamModule in backend:
Exam CRUD endpoints
Question CRUD endpoints
Exam submission endpoints
Auto-grading MCQ
Manual grading essays
Visibility rules engine
Implement instructor exam UI in /frontend-platform:
Exams list (/dashboard/exams) - Arabic
Create/edit exam pages - Arabic forms
Question management (add/edit/delete MCQ, essay) - Arabic
Visibility rules configuration - Arabic
Submissions list (/dashboard/exams/[examId]/submissions) - Arabic
Grading interface for essays - Arabic feedback
Implement student exam pages in /frontend-academy:
Available exams list (/a/[tenantSlug]/exams) - Arabic
Take exam page (/a/[tenantSlug]/exams/[examId]) - RTL question palette, Arabic
Timer display (if duration set)
Submit exam flow - Arabic confirmation
Exam result page (/a/[tenantSlug]/exams/[examId]/result) - Arabic
My exams history (/a/[tenantSlug]/my-exams) - Arabic table
Implement auto-grading logic
Implement visibility rules evaluation based on custom fields
Shared types for Exam, Question, ExamSubmission
PHASE 14 – Flexible Commissions 78) Implement CommissionModule in backend:
Commission tier CRUD endpoints (admin only)
Calculate commission per transaction
Track instructor revenue and tier
Provide commission breakdown
Update PaymentModule:
Call CommissionModule to calculate commission for each transaction
Store commission data in Transaction
Implement admin commission UI in /frontend-platform:
Commission tiers configuration (/admin/commissions) - Arabic
Create/edit tier forms - Arabic
Reorder tiers
Preview/calculator
Update instructor finance UI:
Display current commission tier - Arabic
Show progress to next tier
Revenue breakdown showing commission deducted
Update payout calculation:
Capture commission tier at payout request
Show detailed breakdown to instructor and admin - Arabic
Shared types for CommissionTier
PHASE 15 – Polish & Arabic UX 84) Review all Arabic translations:
Ensure consistency across platform
Check for grammatical errors
Use professional tone
Ensure consistent RTL behavior:
Test all pages in RTL
Check icon flipping (arrows, chevrons)
Verify form layouts
Test navigation menus
Verify date/number formatting:
Arabic numerals vs Western numerals (decide on standard)
Date formats (Arabic locale)
Currency formatting (EGP with Arabic)
Review email templates:
All emails in Arabic
RTL HTML layout
Proper Arabic typography
User testing with native Arabic speakers:
Gather feedback on language and UX
Make adjustments
Accessibility check:
Keyboard navigation
Screen reader compatibility (Arabic)
Color contrast
Performance optimization:
Image optimization
Code splitting
Lazy loading
Database query optimization
PHASE 16 – Domain & Subdomain (Optional) 91) Implement DomainModule in backend:
Subdomain management endpoints
Custom domain endpoints
DNS verification logic
Implement domain UI in /frontend-platform:
Domain settings page (/dashboard/domain) - Arabic
Subdomain configuration
Custom domain setup with DNS instructions - Arabic
Verification status
Implement domain resolution:
Frontend routing based on domain/subdomain
Backend middleware to identify tenant by domain
SSL certificate automation (using Let's Encrypt or similar)
PHASE 17 – Additional Features (Future) 95) Notifications system:
In-app notifications
Real-time with WebSockets (optional)
Notification center
Analytics & Reporting:
Instructor analytics dashboard
Student learning analytics
Revenue reports for admin
Reviews & Ratings:
Students can rate and review courses
Display ratings on course pages
Certificates:
Generate PDF certificates on course completion
Download certificates
Live sessions integration:
Zoom or Google Meet integration
Schedule live sessions
Mobile apps (React Native):
Student mobile app
Instructor mobile app
==================================================== 8. RTL/ARABIC IMPLEMENTATION CHECKLIST
For EVERY component and page you create, ensure:
HTML/JSX Level:
jsx
// ✅ ALWAYS set dir attribute
<html dir="rtl" lang="ar">

// ✅ For body/main sections
<body dir="rtl">
TailwindCSS:
jsx
// ❌ NEVER use these directional classes
className="ml-4 mr-2 text-left float-left"

// ✅ ALWAYS use these logical/directional equivalents
className="ms-4 me-2 text-start float-start"

// ✅ Use start/end instead of left/right
className="start-0 end-0 rounded-s rounded-e"

// ✅ Border radius
className="rounded-s-lg rounded-e-lg" // start and end

// ✅ Padding and margin
className="ps-4 pe-4 ms-2 me-2" // start and end
Text Content:
jsx
// ❌ NEVER hardcode English
<button>Submit</button>
<label>Email Address</label>

// ✅ ALWAYS use Arabic
<button>إرسال</button>
<label>البريد الإلكتروني</label>

// ✅ Or use translation system
<button>{t('common.submit')}</button>
<label>{t('auth.email')}</label>
Forms:
jsx
// ✅ Arabic labels and placeholders
<label htmlFor="email">البريد الإلكتروني</label>
<input 
  id="email"
  type="email" 
  placeholder="أدخل بريدك الإلكتروني"
  dir="rtl"
  className="text-start" // text aligns to start (right in RTL)
/>

// ✅ Error messages in Arabic
{errors.email && (
  <p className="text-red-500 text-sm mt-1">
    {errors.email.message} // "البريد الإلكتروني مطلوب"
  </p>
)}
Numbers & Dates:
jsx
// ✅ Format for Arabic locale
const price = new Intl.NumberFormat('ar-EG', {
  style: 'currency',
  currency: 'EGP'
}).format(100); // "١٠٠٫٠٠ ج.م" or "100.00 EGP"

const date = new Intl.DateTimeFormat('ar-EG', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}).format(new Date()); // "١٥ يناير ٢٠٢٤"

// ✅ Or use date-fns with Arabic locale
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const formatted = format(new Date(), 'PPP', { locale: ar });
Icons:
jsx
// ❌ Directional arrow without consideration
<ArrowRight /> // Points right in LTR, but still points right in RTL

// ✅ Use Lucide React icons which flip automatically
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// In RTL, these will automatically flip direction
<ArrowLeft /> // Points right in RTL
<ChevronRight /> // Points left in RTL

// ✅ Or use logical direction icons
<ArrowForward /> <ArrowBack /> // Conceptual, flip in RTL
Flexbox & Grid:
jsx
// ❌ Hardcoded left/right
<div className="flex justify-start items-start">

// ✅ Use logical properties (start/end adapt to direction)
<div className="flex justify-start items-start"> // This is actually correct!

// TailwindCSS's justify-start and items-start already adapt to RTL
Positioning:
jsx
// ❌ Absolute positioning with left/right
<div className="absolute left-4 top-4">

// ✅ Use start/end
<div className="absolute start-4 top-4">
Translation File Example:
typescript
// /shared/locales/ar/common.ts
export const common = {
  submit: 'إرسال',
  cancel: 'إلغاء',
  save: 'حفظ',
  delete: 'حذف',
  edit: 'تعديل',
  create: 'إنشاء',
  search: 'بحث',
  filter: 'تصفية',
  loading: 'جاري التحميل...',
  error: 'حدث خطأ',
  success: 'تمت العملية بنجاح',
  confirmation: 'تأكيد',
  areYouSure: 'هل أنت متأكد؟',
  yes: 'نعم',
  no: 'لا',
};

// /shared/locales/ar/auth.ts
export const auth = {
  login: 'تسجيل الدخول',
  signup: 'إنشاء حساب',
  logout: 'تسجيل الخروج',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  confirmPassword: 'تأكيد كلمة المرور',
  forgotPassword: 'نسيت كلمة المرور؟',
  rememberMe: 'تذكرني',
  emailPlaceholder: 'أدخل بريدك الإلكتروني',
  passwordPlaceholder: 'أدخل كلمة المرور',
  errors: {
    emailRequired: 'البريد الإلكتروني مطلوب',
    emailInvalid: 'البريد الإلكتروني غير صالح',
    passwordRequired: 'كلمة المرور مطلوبة',
    passwordMin: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    passwordMismatch: 'كلمات المرور غير متطابقة',
  },
};

// /shared/locales/ar/courses.ts
export const courses = {
  title: 'الدورات',
  myCourses: 'دوراتي',
  allCourses: 'جميع الدورات',
  published: 'منشورة',
  draft: 'مسودة',
  createCourse: 'إنشاء دورة جديدة',
  editCourse: 'تعديل الدورة',
  courseTitle: 'عنوان الدورة',
  description: 'الوصف',
  price: 'السعر',
  free: 'مجاناً',
  category: 'الفئة',
  level: 'المستوى',
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
  publish: 'نشر',
  unpublish: 'إلغاء النشر',
  lessons: 'الدروس',
  addLesson: 'إضافة درس',
  videoLesson: 'درس فيديو',
  pdfLesson: 'درس PDF',
  textLesson: 'درس نصي',
};

// ... and so on for all modules
Component Example with RTL:
tsx
// components/CourseCard.tsx
import Link from 'next/link';
import { BookOpen, Clock } from 'lucide-react';
import { useTranslation } from 'next-intl';

interface CourseCardProps {
  course: {
    slug: string;
    title: string;
    description: string;
    price: number;
    thumbnail?: string;
    level: string;
    duration?: number;
  };
  tenantSlug: string;
}

export function CourseCard({ course, tenantSlug }: CourseCardProps) {
  const t = useTranslation();
  
  return (
    <Link 
      href={`/a/${tenantSlug}/courses/${course.slug}`}
      className="block group"
    >
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Image */}
        {course.thumbnail && (
          <div className="aspect-video bg-gray-200 overflow-hidden">
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {course.description}
          </p>
          
          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <BookOpen size={16} />
              <span>{t(`courses.${course.level}`)}</span>
            </div>
            {course.duration && (
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{course.duration} {t('common.minutes')}</span>
              </div>
            )}
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              {course.price === 0 ? (
                t('courses.free')
              ) : (
                new Intl.NumberFormat('ar-EG', {
                  style: 'currency',
                  currency: 'EGP'
                }).format(course.price)
              )}
            </span>
            <span className="text-sm text-primary font-medium group-hover:underline">
              {t('courses.viewDetails')} ←
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
Testing RTL:
Open every page in the browser
Check that all text aligns correctly (right-aligned in Arabic)
Check that navigation flows right-to-left
Check that icons flip where appropriate (arrows, chevrons)
Check that forms are laid out correctly (labels on right)
Check that modals and dropdowns appear from correct side
Check that tooltips and popovers position correctly
Check that animations and transitions work smoothly
Test on mobile devices (RTL should work consistently)
==================================================== 9. CLAUDE CODE SPECIFIC INSTRUCTIONS
File Creation & Editing:
Always specify COMPLETE file paths from monorepo root
Examples:
/backend/src/modules/auth/auth.module.ts
/frontend-platform/src/app/dashboard/page.tsx
/frontend-academy/src/app/a/[tenantSlug]/courses/page.tsx
/shared/types/course.types.ts
/shared/locales/ar/common.ts
When creating files, provide FULL file content
When editing, use str_replace with clear before/after markers
Code Organization:
Create ONE feature at a time completely (backend + frontend)
For each module, always create in order:
Entity/Schema (backend) - with Arabic field descriptions in comments
DTO (backend) - with validation
Service (backend) - with business logic
Controller (backend) - with all endpoints
Module registration (backend) - import and configure
Shared types (/shared/types) - TypeScript interfaces
Translation files (/shared/locales/ar) - Arabic strings
API client/hooks (frontend) - React Query
UI components (frontend) - with RTL support
Pages (frontend) - with Arabic content
Testing as You Go:
After each feature, provide curl commands or test instructions
Mention how to verify the feature works
Provide example payloads for POST/PUT requests (in JSON with Arabic values)
Example:
bash
 # Test instructor signup
  curl -X POST http://localhost:3000/auth/instructor/register \
    -H "Content-Type: application/json" \
    -d '{
      "name": "محمد أحمد",
      "email": "mohamed@example.com",
      "password": "SecurePass123",
      "academyName": "أكاديمية محمد",
      "plan": "starter"
    }'
```

**Incremental Development:**
- Build features in small, testable increments
- Don't jump ahead to complex features without basics working
- Always ensure previous features still work
- Test integration between backend and both frontends

**Communication Style:**
- Start responses with: "I'll implement [FEATURE_NAME]"
- List files you'll create/modify
- Provide code for each file
- End with: "Next steps: [what to do next]"
- Be concise but complete
- When creating Arabic content, ensure proper RTL formatting

**Dependencies:**
- When adding new npm packages, explicitly state:
  - Package name and version
  - Which project (backend/frontend-platform/frontend-academy/shared)
  - Installation command
  - Example: `npm install @tanstack/react-query@^5.0.0` in `/frontend-platform`

**Environment Variables:**
- Track all required env vars in `.env.example` files
- Document what each var is for
- Update `.env.example` whenever adding new vars
- Example:
```
  # Backend .env.example
  DATABASE_URL=mongodb://localhost:27017/academy
  JWT_SECRET=your-secret-key
  JWT_EXPIRES_IN=15m
  REFRESH_TOKEN_EXPIRES_IN=7d
  PAYMOB_API_KEY=your-paymob-api-key
  PAYMOB_SANDBOX=true
  EMAIL_PROVIDER=smtp
  SMTP_HOST=smtp.example.com
  SMTP_PORT=587
  SMTP_USER=your-email@example.com
  SMTP_PASSWORD=your-password
  FRONTEND_PLATFORM_URL=http://localhost:3001
  FRONTEND_ACADEMY_URL=http://localhost:3002
```

**Git Workflow:**
- Suggest logical commit points after each feature
- Recommend branch naming convention
- Example: `feature/phase-3-course-management`
- Suggest commit messages in English (code comments can be English, but user-facing text must be Arabic)

**Shared Types:**
- Always create shared TypeScript types in `/shared/types`
- Import these types in backend and frontend
- Keeps API contracts in sync
- Example structure:
```
  /shared/types/
  ├── user.types.ts
  ├── tenant.types.ts
  ├── course.types.ts
  ├── enrollment.types.ts
  ├── transaction.types.ts
  ├── subscription.types.ts
  ├── discount.types.ts
  ├── exam.types.ts
  ├── custom-field.types.ts
  ├── commission.types.ts
  ├── page.types.ts
  ├── auth.types.ts
  └── index.ts // Re-export all types
Error Handling:
Always implement proper error handling
Use NestJS exception filters
Return consistent error responses (in Arabic for user-facing errors)
Handle errors gracefully in frontend with Arabic messages
Example error response:
json
 {
    "statusCode": 400,
    "message": "البريد الإلكتروني مستخدم بالفعل",
    "error": "Bad Request",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/auth/instructor/register"
  }
Code Quality:
Follow TypeScript best practices
Use proper typing (avoid any unless absolutely necessary)
Add comments for complex logic (in English)
Keep functions small and focused
Use meaningful variable names
Follow consistent naming conventions:
camelCase for variables and functions
PascalCase for classes and components
kebab-case for file names
UPPER_SNAKE_CASE for constants
Arabic Content in Code:
When creating seed data or examples, use Arabic names and content
When writing validation messages, use Arabic
When creating UI labels, use Arabic
Example:
typescript
 // Good
  const exampleCourse = {
    title: 'مقدمة في البرمجة',
    description: 'تعلم أساسيات البرمجة باللغة العربية',
    level: 'beginner',
  };

  // Bad
  const exampleCourse = {
    title: 'Introduction to Programming',
    description: 'Learn programming basics',
    level: 'beginner',
  };
RTL Reminders:
EVERY component you create must work in RTL
EVERY form must have Arabic labels
EVERY error message must be in Arabic
EVERY page must have dir="rtl"
Use Tailwind's directional utilities (ms-, me-, start-, end-)
Test mentally: "Does this make sense in RTL?"
==================================================== 10. FINAL CHECKLIST BEFORE IMPLEMENTATION
Before you start implementing, confirm:
✅ I understand this is a MONOLITH (one NestJS backend), NOT microservices ✅ I understand there are THREE separate frontends (platform, academy, and they're distinct) ✅ I understand ALL content must be in Arabic with RTL support ✅ I understand multi-tenancy is based on tenantId ✅ I understand the complete entity relationships ✅ I understand the phased implementation approach ✅ I will create complete file contents, not just outlines ✅ I will provide Arabic translations for all user-facing text ✅ I will use Tailwind RTL utilities correctly ✅ I will test each feature before moving to the next ✅ I will provide verification instructions after each implementation
==================================================== 11. READY TO START
Now, please confirm your understanding of:
The overall architecture (monolith with modules)
The three separate applications (backend, frontend-platform, frontend-academy)
The Arabic/RTL requirement
The phased implementation approach
Then, propose the concrete folder structure for:
/backend
/frontend-platform
/frontend-academy
/shared
After that, wait for my instruction on which phase to implement first.


