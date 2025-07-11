# Secure Client Portal - Santu Saha Hero

A professional client portal for secure document management and client communication.

## 🚀 Quick Start for Beginners

### Step 1: Setup Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon public key
   - Service role key (keep this secret!)

### Step 2: Setup Database (2 minutes)

1. In your Supabase project, go to **SQL Editor**
2. Copy and paste the content from `scripts/01-create-tables.sql` and click **RUN**
3. Copy and paste the content from `scripts/02-seed-data.sql` and click **RUN**
4. Copy and paste the content from `scripts/03-create-storage.sql` and click **RUN**

### Step 3: Create Demo Users (3 minutes)

1. In Supabase, go to **Authentication** → **Users**
2. Click **Add user** and create:
   - **Admin User**: admin@santusahahero.com / admin123
   - **Client User**: client@acmecorp.com / password123

### Step 4: Deploy on v0.dev (1 minute)

1. Copy all the code from this project
2. In v0.dev, create a new project and paste the code
3. Add environment variables in v0.dev settings:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_from_step_1
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_step_1
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_step_1
   \`\`\`

### Step 5: Test Login

**Demo Credentials:**
- **Client Login**: abccorp / password123
- **Admin Login**: admin@santusahahero.com / admin123

## ✅ What You Get

- ✅ **Secure Authentication** - Separate client and admin portals
- ✅ **Document Management** - Upload, view, download documents
- ✅ **Client Management** - Full CRUD operations for clients
- ✅ **Activity Tracking** - Complete audit trail
- ✅ **Notifications** - Real-time user alerts
- ✅ **Professional UI** - Modern, responsive design
- ✅ **Demo Data** - Ready to test immediately

## 🔧 Features

### For Clients:
- Secure document access
- Download financial reports
- View notifications
- Profile management

### For Admins:
- Client management
- Document upload and sharing
- Activity monitoring
- User administration

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Supabase (Database + Auth + Storage)
- **UI**: Tailwind CSS, shadcn/ui
- **Deployment**: Vercel (via v0.dev)

## 📞 Support

If you need help:
1. Check the demo credentials above
2. Make sure all SQL scripts ran successfully
3. Verify environment variables are set correctly
4. Test with the demo login credentials first

## 🔒 Security Features

- Row Level Security (RLS) policies
- Secure file storage with access controls
- Activity logging and audit trails
- Role-based access control
- Encrypted authentication

---

**Ready to use!** Just follow the 5 steps above and you'll have a fully functional secure client portal.
