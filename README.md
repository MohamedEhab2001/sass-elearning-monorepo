# 🎓 Multi-Tenant Online Academy SaaS Platform

A comprehensive, production-ready, Arabic-first SaaS platform for instructors to create and manage their own online academies with full multi-tenancy support, enterprise-grade security, and performance optimization.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Security Features](#security-features)
- [API Documentation](#api-documentation)
- [Health & Monitoring](#health--monitoring)
- [Performance Optimization](#performance-optimization)
- [Deployment](#deployment)
- [Phases Completed](#phases-completed)

## 📋 Overview

This platform enables Arabic-speaking instructors to launch their own branded online academies with courses, payments, and complete student management - all with enterprise-grade security, comprehensive logging, and production-ready infrastructure.

### 🎯 Key Features

#### Core Platform
- ✅ **Multi-tenant Architecture** - Complete data isolation per academy
- ✅ **Arabic-First** - Full RTL support with Cairo font
- ✅ **Course Management** - Videos, text, and interactive lessons
- ✅ **Student Enrollment** - Free and paid course enrollments
- ✅ **Progress Tracking** - Detailed student progress analytics
- ✅ **Payment Integration** - Paymob gateway with webhooks
- ✅ **Payout System** - Instructor payout requests & admin approval
- ✅ **Page Builder** - Server-driven UI with customizable sections
- ✅ **Email Notifications** - 10+ Arabic HTML email templates

#### Enterprise Features (Phase 10)
- 🔒 **Security Headers** - Helmet.js protection
- 🚦 **Rate Limiting** - Global & endpoint-specific throttling
- 🔐 **Input Validation** - Class-validator with Arabic errors
- 📊 **Logging** - Winston with correlation IDs
- 🏥 **Health Checks** - MongoDB, memory, disk monitoring
- ⚡ **Database Indexes** - Optimized queries for all collections
- 🌐 **CORS Protection** - Strict origin whitelisting
- 📧 **Email System** - Complete transactional email suite

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 10.x
- **Runtime**: Node.js 20.x
- **Database**: MongoDB 8.x with Mongoose
- **Authentication**: JWT with Passport.js
- **Validation**: Class-validator & Class-transformer
- **Security**: Helmet, Throttler, CORS
- **Email**: Nodemailer with Handlebars templates
- **Logging**: Winston with correlation IDs
- **File Storage**: AWS S3
- **Payment**: Paymob Gateway
- **Health Checks**: @nestjs/terminus

### Frontend (Platform)
- **Framework**: Next.js 14.x (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (RTL configured)
- **State**: Zustand
- **UI**: Lucide React icons
- **Font**: Cairo (Arabic)

### Frontend (Academy)
- **Framework**: Next.js 14.x (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (RTL configured)
- **State**: Zustand
- **UI**: Lucide React icons
- **Font**: Cairo (Arabic)

## 🏗️ Architecture

### Monorepo Structure

```
sass-elearning-monorepo/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── common/            # Shared utilities
│   │   │   ├── decorators/    # Custom decorators
│   │   │   ├── filters/       # Exception filters (Arabic errors)
│   │   │   ├── guards/        # Auth & role guards
│   │   │   └── interceptors/  # Logging interceptor
│   │   ├── modules/
│   │   │   ├── admin/         # Admin panel & analytics
│   │   │   ├── auth/          # Authentication (rate-limited)
│   │   │   ├── courses/       # Course management
│   │   │   ├── emails/        # Email service + 10 templates
│   │   │   ├── enrollments/   # Student enrollments
│   │   │   ├── health/        # Health check endpoints
│   │   │   ├── lessons/       # Lesson management
│   │   │   ├── payments/      # Payments & payouts
│   │   │   ├── progress/      # Progress tracking
│   │   │   ├── tenants/       # Multi-tenancy
│   │   │   ├── ui-config/     # Server-driven UI
│   │   │   ├── uploads/       # File uploads (S3)
│   │   │   └── users/         # User management
│   │   ├── app.module.ts      # Root module (with throttling)
│   │   └── main.ts            # Bootstrap (Winston, Helmet, CORS)
│   └── logs/                  # Winston logs (error.log, combined.log)
├── frontend-platform/         # Admin/Instructor Dashboard
├── frontend-academy/          # Student-facing Academy
└── shared/                    # Shared TypeScript types
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- MongoDB 8.x or higher
- npm or yarn
- AWS S3 account (for file uploads)
- Paymob account (for payments)
- SMTP server (for emails)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd sass-elearning-monorepo
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend Platform
cd ../frontend-platform
npm install

# Frontend Academy
cd ../frontend-academy
npm install
```

3. **Configure environment variables**
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your configuration (see below)
```

4. **Start development servers**
```bash
# Terminal 1: Backend (port 3000)
cd backend
npm run start:dev

# Terminal 2: Frontend Platform (port 3001)
cd frontend-platform
npm run dev

# Terminal 3: Frontend Academy (port 3002)
cd frontend-academy
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)

```env
# Application
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/academy-platform

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URLs (for CORS whitelist)
FRONTEND_PLATFORM_URL=http://localhost:3001
FRONTEND_ACADEMY_URL=http://localhost:3002

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@academy.com

# File Upload (AWS S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=academy-uploads

# Payment Gateway (Paymob)
PAYMOB_API_KEY=your-paymob-api-key
PAYMOB_IFRAME_ID=your-paymob-iframe-id
PAYMOB_INTEGRATION_ID=your-paymob-integration-id
PAYMOB_HMAC_SECRET=your-paymob-hmac-secret

# App URLs
BACKEND_URL=http://localhost:3000
PLATFORM_BASE_URL=http://localhost:3001
ACADEMY_BASE_URL=http://localhost:3002
```

## 🔒 Security Features

### 1. Helmet Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- X-DNS-Prefetch-Control

### 2. Rate Limiting

**Global Rate Limits:**
- 100 requests / 15 minutes per IP

**Auth Endpoint Limits:**
- Signup: 5 requests / hour
- Login: 10 requests / 15 minutes
- Forgot Password: 3 requests / hour
- Password Reset: 5 requests / hour
- Email Verification: 5 requests / hour

### 3. Input Validation
- All DTOs validated with class-validator
- Arabic error messages for user-friendly responses
- Whitelist mode (strips unknown properties)
- Transform enabled for type coercion

### 4. CORS Protection
- Strict origin whitelist from environment variables
- Credentials allowed only for whitelisted origins
- Custom headers: Authorization, X-Correlation-ID
- Pre-flight requests handled properly

### 5. Global Exception Filter
- Catches all exceptions
- Returns consistent Arabic error responses
- Hides internal errors in production
- Logs with correlation IDs
- Never exposes stack traces to clients

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

#### POST /api/auth/signup
Register new instructor and create academy.

**Rate Limit:** 5 requests / hour

**Request:**
```json
{
  "email": "instructor@example.com",
  "password": "SecurePass123",
  "firstName": "أحمد",
  "lastName": "محمد",
  "academyName": "أكاديمية البرمجة",
  "academySlug": "programming-academy"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "instructor@example.com",
    "role": "instructor"
  },
  "tenant": {
    "id": "...",
    "name": "أكاديمية البرمجة",
    "slug": "programming-academy"
  }
}
```

### Health Checks

#### GET /health
Comprehensive health check.

**Response:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" },
    "disk": { "status": "up" }
  }
}
```

#### GET /health/db
Database connectivity check only.

#### GET /health/memory
Memory usage check only.

## 🏥 Health & Monitoring

### Winston Logging

**Log Files:**
- `logs/error.log` - Error-level logs only
- `logs/combined.log` - All logs in JSON format

**Log Format:**
```
2024-11-22 21:00:00 [abc-123] info [HTTP] GET /api/courses 200 - 45ms
```

**Correlation IDs:**
- Every request gets a unique UUID
- Tracked across all logs for request tracing
- Included in response headers: `X-Correlation-ID`

### Health Check Endpoints

Monitor application health:
- **Database**: MongoDB connection status
- **Memory**: Heap and RSS usage
- **Disk**: Storage usage threshold

Set up monitoring alerts based on these endpoints.

## ⚡ Performance Optimization

### MongoDB Indexes

All collections have optimized indexes:

**Users:**
- `email` (unique)
- `tenantId`
- `role`

**Courses:**
- `tenantId + status`
- `slug + tenantId` (unique)
- `instructorId`

**Enrollments:**
- `tenantId + studentId`
- `studentId + courseId` (unique)
- `status`

**Transactions:**
- `tenantId + userId`
- `transactionId` (unique)
- `status`

**Payouts:**
- `tenantId + instructorId`
- `status + createdAt`

### Best Practices
1. Connection pooling with MongoDB
2. Validation pipe transforms efficiently
3. Static assets served from S3/CDN
4. Rate limiting prevents abuse
5. Indexes on all frequently queried fields

## 🚢 Deployment

### Production Checklist

**Backend:**
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET` (32+ characters)
3. Configure production MongoDB URI (MongoDB Atlas recommended)
4. Set up production SMTP server
5. Configure AWS S3 bucket
6. Add production URLs to CORS whitelist
7. Enable MongoDB authentication
8. Set up SSL/TLS certificates

**Frontend:**
1. Build for production: `npm run build`
2. Configure environment variables
3. Set up CDN for static assets
4. Enable gzip compression
5. Configure reverse proxy (nginx)

### Docker Deployment

Docker support can be added with the following Dockerfile:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Environment Variables for Production

**Critical:**
- Strong `JWT_SECRET`
- Production MongoDB URI with auth
- Production email credentials
- AWS S3 credentials
- Paymob production keys
- HTTPS URLs for frontends

### Monitoring Recommendations

1. **APM**: New Relic, DataDog, or Application Insights
2. **Logging**: ELK Stack or CloudWatch
3. **Error Tracking**: Sentry
4. **Uptime**: Pingdom or UptimeRobot
5. **Health Checks**: Monitor `/health` endpoint

## ✅ Phases Completed

### Phase 1-3: Foundation
- ✅ Multi-tenancy architecture
- ✅ Authentication & authorization
- ✅ User roles (Admin, Instructor, Student)

### Phase 4: Student Flow
- ✅ Course browsing & enrollment
- ✅ Progress tracking
- ✅ Lesson completion

### Phase 5: Payment System
- ✅ Paymob integration
- ✅ Webhook handling
- ✅ Transaction management

### Phase 6: Server-Driven UI
- ✅ Dynamic page builder
- ✅ Customizable sections
- ✅ Academy branding

### Phase 7: Finance & Payouts
- ✅ Instructor revenue tracking
- ✅ Payout requests
- ✅ Admin approval workflow
- ✅ Commission calculation (15%)

### Phase 8: Admin Panel
- ✅ Platform-wide analytics
- ✅ Tenant management
- ✅ Payout management
- ✅ Instructor oversight

### Phase 9: Email & Notifications
- ✅ Nodemailer + Handlebars
- ✅ 10 Arabic HTML templates
- ✅ Auth, payment, payout, student emails
- ✅ RTL email design

### Phase 10: Hardening & Polish ⭐ NEW
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Rate limiting (global + auth)
- ✅ Input validation (Arabic errors)
- ✅ Winston logging with correlation IDs
- ✅ Global exception filter
- ✅ Health check endpoints
- ✅ MongoDB indexes
- ✅ Production documentation

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For questions or support, please contact the development team.

---

**Built with ❤️ using NestJS, Next.js, and MongoDB**

*Production-ready • Enterprise-grade • Arabic-first*
