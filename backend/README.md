# Backend - Online Academy SaaS Platform

Backend API for multi-tenant online academy platform built with NestJS, MongoDB, and TypeScript.

## 🚀 Features

- **NestJS Framework** - Modular, scalable backend architecture
- **MongoDB + Mongoose** - NoSQL database with ODM
- **JWT Authentication** - Secure token-based auth
- **Multi-tenancy** - Complete data isolation per academy
- **Role-based Access** - Admin, Instructor, Student roles
- **Payment Integration** - Paymob payment gateway
- **File Uploads** - AWS S3 integration
- **Email Service** - Nodemailer with Arabic templates

## 📋 Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

## ⚙️ Configuration

Edit `.env` file with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/academy-platform

# JWT
JWT_SECRET=your-secret-key

# Email (optional for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-password

# AWS S3 (optional for development)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket

# Paymob (for payment integration)
PAYMOB_API_KEY=your-api-key
```

## 🏃 Running the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at: `http://localhost:3000/api`

## 📁 Project Structure

```
src/
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   ├── guards/          # Auth & tenant guards
│   ├── interceptors/    # Request/response interceptors
│   ├── pipes/           # Validation pipes
│   ├── filters/         # Exception filters
│   └── middleware/      # Custom middleware
├── config/              # Configuration files
├── modules/             # Feature modules
│   ├── auth/            # Authentication
│   ├── users/           # User management
│   ├── tenants/         # Tenant (Academy) management
│   ├── courses/         # Course management
│   ├── lessons/         # Lesson content
│   ├── enrollments/     # Student enrollments
│   ├── payments/        # Payment processing
│   ├── subscriptions/   # Subscription management
│   ├── exams/           # Exam system
│   └── ...              # Other modules
└── database/            # Database schemas
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔧 Development

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 📚 API Documentation

Once running, visit:
- Swagger API Docs: `http://localhost:3000/api/docs` (if configured)
- Health Check: `http://localhost:3000/api/health`

## 🗂️ Database

### MongoDB Setup

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:6

# Or install MongoDB locally
# See: https://www.mongodb.com/docs/manual/installation/
```

### Indexes

Indexes are automatically created on startup for:
- `tenantId` (multi-tenant queries)
- `email` (user lookups)
- `slug` (tenant lookups)
- Compound indexes for performance

## 🔐 Environment Variables

See `.env.example` for all required and optional environment variables.

**Required:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing

**Optional:**
- `PORT` - Server port (default: 3000)
- `EMAIL_*` - Email service credentials
- `AWS_*` - S3 upload credentials
- `PAYMOB_*` - Payment gateway credentials

## 📝 License

Private - All Rights Reserved
