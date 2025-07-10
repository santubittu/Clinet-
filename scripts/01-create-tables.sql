-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'uploader')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    contact_person TEXT,
    username TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    documents INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_registered BOOLEAN DEFAULT FALSE
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    viewed BOOLEAN DEFAULT FALSE,
    downloaded INTEGER DEFAULT 0,
    description TEXT,
    share_link TEXT,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    "user" TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'client')),
    ip TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
    read BOOLEAN DEFAULT FALSE,
    recipient_id TEXT NOT NULL,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('admin', 'client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users
CREATE POLICY "Admin users can view all admin users" ON admin_users
    FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin users can insert admin users" ON admin_users
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM admin_users WHERE role = 'admin'));

CREATE POLICY "Admin users can update admin users" ON admin_users
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM admin_users WHERE role = 'admin'));

CREATE POLICY "Admin users can delete admin users" ON admin_users
    FOR DELETE USING (auth.uid() IN (SELECT id FROM admin_users WHERE role = 'admin'));

-- Create policies for clients
CREATE POLICY "Admin users can view all clients" ON clients
    FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Clients can view their own data" ON clients
    FOR SELECT USING (auth.uid()::text IN (SELECT auth.uid()::text FROM auth.users WHERE email = clients.email));

CREATE POLICY "Admin users can insert clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin users can update clients" ON clients
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin users can delete clients" ON clients
    FOR DELETE USING (auth.uid() IN (SELECT id FROM admin_users));

-- Create policies for documents
CREATE POLICY "Admin users can view all documents" ON documents
    FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Clients can view their own documents" ON documents
    FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE email IN (SELECT email FROM auth.users WHERE id = auth.uid())));

CREATE POLICY "Admin users can insert documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin users can update documents" ON documents
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin users can delete documents" ON documents
    FOR DELETE USING (auth.uid() IN (SELECT id FROM admin_users));

-- Create policies for activities
CREATE POLICY "Admin users can view all activities" ON activities
    FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Anyone can insert activities" ON activities
    FOR INSERT WITH CHECK (true);

-- Create policies for notifications
CREATE POLICY "Admin users can view all notifications" ON notifications
    FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Clients can view their own notifications" ON notifications
    FOR SELECT USING (
        recipient_type = 'client' AND 
        recipient_id IN (SELECT id FROM clients WHERE email IN (SELECT email FROM auth.users WHERE id = auth.uid()))
    );

CREATE POLICY "Anyone can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (
        (recipient_type = 'admin' AND auth.uid() IN (SELECT id FROM admin_users)) OR
        (recipient_type = 'client' AND recipient_id IN (SELECT id FROM clients WHERE email IN (SELECT email FROM auth.users WHERE id = auth.uid())))
    );

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (
        (recipient_type = 'admin' AND auth.uid() IN (SELECT id FROM admin_users)) OR
        (recipient_type = 'client' AND recipient_id IN (SELECT id FROM clients WHERE email IN (SELECT email FROM auth.users WHERE id = auth.uid())))
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_username ON clients(username);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
