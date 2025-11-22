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
