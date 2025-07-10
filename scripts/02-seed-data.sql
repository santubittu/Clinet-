-- Insert sample admin user (you'll need to create this user in Supabase Auth first)
-- Replace 'your-admin-user-id' with the actual UUID from Supabase Auth
INSERT INTO admin_users (id, name, email, role, created_at) VALUES
('00000000-0000-0000-0000-000000000000', 'Admin User', 'admin@santusahahero.com', 'admin', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (id, name, email, phone, address, contact_person, username, status, documents, created_at, is_registered) VALUES
('CLIENT001', 'Acme Corporation', 'contact@acme.com', '+1-555-0101', '123 Business St, City, State 12345', 'John Smith', 'acme_corp', 'active', 5, NOW() - INTERVAL '30 days', true),
('CLIENT002', 'Tech Solutions Ltd', 'info@techsolutions.com', '+1-555-0102', '456 Tech Ave, City, State 12345', 'Sarah Johnson', 'tech_solutions', 'active', 3, NOW() - INTERVAL '20 days', true),
('CLIENT003', 'Global Enterprises', 'admin@globalent.com', '+1-555-0103', '789 Enterprise Blvd, City, State 12345', 'Mike Wilson', 'global_ent', 'active', 7, NOW() - INTERVAL '15 days', true),
('CLIENT004', 'Startup Inc', 'hello@startup.com', '+1-555-0104', '321 Innovation Dr, City, State 12345', 'Lisa Chen', 'startup_inc', 'pending', 0, NOW() - INTERVAL '5 days', false),
('CLIENT005', 'Manufacturing Co', 'contact@manufacturing.com', '+1-555-0105', '654 Industrial Way, City, State 12345', 'Robert Brown', 'manufacturing_co', 'inactive', 2, NOW() - INTERVAL '45 days', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample documents
INSERT INTO documents (id, name, type, client_id, size, viewed, downloaded, description, created_at) VALUES
('DOC001', 'Q1 2024 Balance Sheet', 'Balance Sheet', 'CLIENT001', '2.3 MB', true, 3, 'First quarter balance sheet for 2024', NOW() - INTERVAL '10 days'),
('DOC002', '2023 Tax Return', 'Tax Return', 'CLIENT001', '1.8 MB', true, 2, 'Annual tax return for 2023', NOW() - INTERVAL '25 days'),
('DOC003', 'March 2024 GST Return', 'GST Return', 'CLIENT001', '0.9 MB', false, 0, 'GST return for March 2024', NOW() - INTERVAL '5 days'),
('DOC004', 'Q4 2023 P&L Statement', 'P&L Statement', 'CLIENT002', '1.5 MB', true, 1, 'Profit and loss statement for Q4 2023', NOW() - INTERVAL '15 days'),
('DOC005', 'Annual Financial Report 2023', 'Financial Report', 'CLIENT002', '4.2 MB', true, 4, 'Comprehensive financial report for 2023', NOW() - INTERVAL '20 days'),
('DOC006', 'Tax Planning Strategy', 'Tax Planning', 'CLIENT003', '1.2 MB', true, 2, 'Tax planning recommendations for 2024', NOW() - INTERVAL '8 days'),
('DOC007', 'Q1 2024 Financial Review', 'Financial Review', 'CLIENT003', '2.8 MB', false, 0, 'Quarterly financial review and analysis', NOW() - INTERVAL '3 days'),
('DOC008', 'Audit Report 2023', 'Other', 'CLIENT005', '3.1 MB', true, 1, 'Independent audit report for 2023', NOW() - INTERVAL '40 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample activities
INSERT INTO activities (id, action, details, "user", user_type, ip, created_at) VALUES
('ACT001', 'Client login', 'Client Acme Corporation (CLIENT001) logged in', 'John Smith', 'client', '192.168.1.100', NOW() - INTERVAL '2 hours'),
('ACT002', 'Document uploaded', 'Document "Q1 2024 Balance Sheet" uploaded for Acme Corporation (CLIENT001)', 'Admin User', 'admin', '192.168.1.50', NOW() - INTERVAL '10 days'),
('ACT003', 'Document downloaded', 'Document "2023 Tax Return" downloaded', 'John Smith', 'client', '192.168.1.100', NOW() - INTERVAL '1 day'),
('ACT004', 'Client created', 'New client account created: Startup Inc (CLIENT004)', 'Admin User', 'admin', '192.168.1.50', NOW() - INTERVAL '5 days'),
('ACT005', 'Admin login', 'Admin Admin User logged in', 'Admin User', 'admin', '192.168.1.50', NOW() - INTERVAL '30 minutes'),
('ACT006', 'Document viewed', 'Document "Annual Financial Report 2023" viewed', 'Sarah Johnson', 'client', '192.168.1.101', NOW() - INTERVAL '6 hours'),
('ACT007', 'Client updated', 'Client Tech Solutions Ltd (CLIENT002) updated', 'Admin User', 'admin', '192.168.1.50', NOW() - INTERVAL '3 days'),
('ACT008', 'Share link generated', 'Share link created for document "Tax Planning Strategy"', 'Admin User', 'admin', '192.168.1.50', NOW() - INTERVAL '8 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (id, title, message, type, read, recipient_id, recipient_type, created_at) VALUES
('NOT001', 'New Document Available', 'A new document "Q1 2024 Balance Sheet" has been uploaded to your account.', 'info', true, 'CLIENT001', 'client', NOW() - INTERVAL '10 days'),
('NOT002', 'Welcome to Santu Saha Hero', 'Your account has been created. You can now access your financial documents securely.', 'info', false, 'CLIENT004', 'client', NOW() - INTERVAL '5 days'),
('NOT003', 'Document Shared', 'A new document "Tax Planning Strategy" has been shared with you.', 'info', true, 'CLIENT003', 'client', NOW() - INTERVAL '8 days'),
('NOT004', 'System Maintenance', 'Scheduled maintenance will occur on Sunday from 2-4 AM EST.', 'warning', false, 'CLIENT001', 'client', NOW() - INTERVAL '2 days'),
('NOT005', 'Password Changed', 'Your password has been successfully updated.', 'success', true, 'CLIENT002', 'client', NOW() - INTERVAL '1 day'),
('NOT006', 'New Document Available', 'A new document "Q1 2024 Financial Review" has been uploaded to your account.', 'info', false, 'CLIENT003', 'client', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Update client document counts based on actual documents
UPDATE clients SET documents = (
    SELECT COUNT(*) FROM documents WHERE documents.client_id = clients.id
);
