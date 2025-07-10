# Secure Client Portal - Santu Saha Hero

A professional, secure client portal for financial document sharing built with Next.js 14, Supabase, and shadcn/ui.

## Features

### 🔐 Security First
- Bank-level encryption and security
- Row Level Security (RLS) with Supabase
- Secure authentication and authorization
- Activity logging and audit trails

### 👥 Dual Portal System
- **Admin Portal**: Complete management dashboard
- **Client Portal**: Secure document access

### 📄 Document Management
- Upload and organize financial documents
- Document categorization (Balance Sheets, Tax Returns, GST Returns, etc.)
- Secure sharing with expirable links
- Download tracking and analytics

### 🎯 Client Management
- Comprehensive client profiles
- Registration system with verification
- Activity tracking and notifications
- Bulk operations support

### 📊 Analytics & Reporting
- Dashboard with key metrics
- Document access analytics
- Client activity reports
- Visual charts and graphs

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **File Storage**: Supabase Storage
- **TypeScript**: Full type safety

## Quick Start

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd secure-client-portal
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup
Copy `.env.example` to `.env.local` and update with your Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://lkepqhkrwbhwzsokhtbm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### 4. Database Setup
Run the SQL scripts in the `scripts/` folder in your Supabase SQL editor:

1. `01-create-tables.sql` - Creates all necessary tables and RLS policies
2. `02-seed-data.sql` - Adds sample data for testing
3. `03-create-storage.sql` - Sets up file storage bucket and policies

### 5. Create Admin User
In Supabase Auth, create an admin user and add their UUID to the `admin_users` table:

\`\`\`sql
INSERT INTO admin_users (id, name, email, role) 
VALUES ('your-auth-user-uuid', 'Admin Name', 'admin@example.com', 'admin');
\`\`\`

### 6. Run the Application
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## Project Structure

\`\`\`
├── app/                    # Next.js App Router
│   ├── admin/             # Admin portal pages
│   ├── client/            # Client portal pages
│   ├── login/             # Authentication pages
│   └── register/          # Registration pages
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── charts/           # Chart components
├── lib/                  # Utility functions
│   ├── actions.ts        # Server actions
│   ├── supabase.ts       # Supabase client
│   └── types.ts          # TypeScript types
└── scripts/              # Database setup scripts
\`\`\`

## Key Features Explained

### Authentication System
- **Dual Login**: Separate portals for admins and clients
- **Flexible Client Login**: Clients can use either Client ID or username
- **Secure Registration**: Multi-step registration with email verification

### Document Management
- **Categorized Storage**: Documents organized by type and client
- **Secure Sharing**: Generate time-limited sharing links
- **Access Control**: Clients only see their own documents
- **Activity Tracking**: Monitor document views and downloads

### Admin Features
- **Client Management**: Create, update, and manage client accounts
- **Document Upload**: Bulk upload with automatic categorization
- **Analytics Dashboard**: Visual insights into portal usage
- **User Management**: Manage admin users with role-based access

### Client Features
- **Personal Dashboard**: Overview of documents and activity
- **Document Access**: Secure viewing and downloading
- **Notifications**: Real-time updates on new documents
- **Profile Management**: Update personal information

## Database Schema

### Core Tables
- `admin_users` - Admin user accounts and roles
- `clients` - Client information and status
- `documents` - Document metadata and access control
- `activities` - Audit log of all system activities
- `notifications` - User notifications and alerts

### Security
- Row Level Security (RLS) enabled on all tables
- Policies ensure users only access authorized data
- Audit trails for compliance and security monitoring

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | JWT signing secret | Optional |
| `NEXT_PUBLIC_APP_URL` | Application URL | Optional |

## Demo Credentials

### Admin Portal
- **
