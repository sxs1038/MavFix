# MavFix

MavFix is a campus maintenance request system designed for UT Arlington. It allows students and staff to submit maintenance work orders, track request progress, and helps admins manage campus issues from one dashboard.

# Features

- Secure user authentication using Supabase
- Student, staff, and admin role management
- Submit campus maintenance work orders
- Real-time request tracking
- Priority-based maintenance requests
- Building and category selection for issues
- Admin dashboard with analytics and request management
- Status tracking for pending, in-progress, completed, and cancelled requests
- Responsive and modern UI design
- Email verification during account registration

# Tech Stack

## Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- Lucide React Icons
- Recharts

## Backend & Database
- Supabase
- Supabase Authentication
- PostgreSQL (via Supabase)

## State & Forms
- React Hook Form
- Zod Validation

# Main Pages

- `/` - Home page
- `/auth/login` - User login
- `/auth/sign-up` - User registration
- `/submit` - Submit maintenance request
- `/orders` - View submitted work orders
- `/admin` - Admin dashboard

# Getting Started

1. Clone the Repository

```bash
git clone https://github.com/sxs1038/MavFix.git
cd MavFix
```

2. Install Dependencies

```bash
npm install
```

3. Configure Environment Variables

Create a `.env.local` file in the root directory and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

4. Run the Development Server

```bash
npm run dev
```

Open in browser:

```bash
http://localhost:3000
```
# Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

# Database

The application uses Supabase as the backend database and authentication provider.

## Main Tables

### profiles
Stores user account information and roles.

### requests
Stores maintenance work orders submitted by users.

### buildings
Stores campus building information.

### categories
Stores maintenance issue categories and SLA details.

### status_logs
Tracks request status history and updates.


# User Roles

## Student
- Submit maintenance requests
- Track request status

## Staff
- View assigned requests
- Update maintenance progress

## Admin
- Access dashboard analytics
- Manage all maintenance requests
- Assign staff and monitor campus issues

# Request Status Types

- Pending
- In Progress
- Completed
- Cancelled

# Priority Levels

- Low
- Medium
- High
- Critical

# Development Tooling

- npm
- ESLint
- TypeScript
- PostCSS
- Tailwind CSS
- Supabase SSR
- Vercel Analytics

# Project Structure

```plaintext
MavFix/
│
├── app/                     # Next.js app router pages
│   ├── admin/
│   ├── auth/
│   ├── orders/
│   ├── submit/
│   └── page.tsx
│
├── components/              # Reusable UI and feature components
│   ├── admin/
│   ├── ui/
│   └── submit-work-order-form.tsx
│
├── lib/                     # Utility functions and shared logic
│   ├── supabase/
│   └── types.ts
│
├── public/                  # Static assets
│
├── package.json
├── tsconfig.json
└── README.md
```


# Business Logic Highlights

- Only authenticated users can submit maintenance requests
- Role-based authorization controls admin dashboard access
- Categories automatically assign default priority levels
- SLA deadlines are dynamically generated based on category settings
- Users can track their own submitted requests
- Admins and staff can monitor and manage all maintenance requests
- Dashboard analytics visualize maintenance trends and request distribution
- Requests are linked with buildings, categories, requesters, and assigned staff

# Project Purpose

MavFix was created to simplify campus maintenance management by providing a centralized platform for reporting, tracking, and managing maintenance issues across campus buildings.

The system improves communication between students, staff, and administrators while helping maintenance teams respond to issues more efficiently.

# Further Reading

Official Documentation

- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs

Related Concepts

- Role-Based Access Control (RBAC)
- Server-Side Rendering (SSR)
- RESTful Application Design
- Database Normalization
- Campus Maintenance Management Systems
