-- Insert sample admin users (you'll need to replace these UUIDs with actual auth user IDs)
INSERT INTO admin_users (id, name, email, role, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@santusahahero.com', 'admin', NOW()),
('00000000-0000-0000-0000-000000000002', 'Manager User', 'manager@santusahahero.com', 'manager', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (id, name, email, phone, address, contact_person, username, status, documents, created_at, is_registered) VALUES
('CLIENT123', 'ABC Corporation', 'contact@abccorp.com', '+1 (555) 123-4567', '123 Business Ave, Suite 100, New York, NY 10001', 'John Smith', 'abccorp2', 'active', 2, NOW() - INTERVAL '3 months', true),
('CLIENT456', 'XYZ Enterprises', 'info@xyzent.com', '+1 (555) 987-6543', '456 Commerce St, Los Angeles, CA 90210', 'Jane Doe', 'xyzent', 'active', 1, NOW() - INTERVAL '2 months', true),
('CLIENT789', 'LMN Limited', 'hello@lmnltd.com', '+1 (555) 555-0123', '789 Trade Blvd, Chicago, IL 60601', 'Bob Johnson', NULL, 'inactive', 3, NOW() - INTERVAL '6 months', false),
('CLIENT321', 'PQR Inc', 'support@pqrinc.com', '+1 (555) 444-0987', '321 Industry Way, Houston, TX 77001', 'Alice Brown', NULL, 'active', 1, NOW() - INTERVAL '1 month', false),
('CLIENT654', 'EFG Solutions', 'info@efgsolutions.com', '+1 (555) 333-0456', '654 Tech Park, Austin, TX 78701', 'Charlie Wilson', NULL, 'pending', 2, NOW() - INTERVAL '2 weeks', false)
ON CONFLICT (id) DO NOTHING;

-- Insert demo clients
INSERT INTO clients (id, name, email, phone, address, contact_person, username, status, documents, created_at, is_registered) VALUES
('ACME_CORP', 'ACME Corporation', 'client@acmecorp.com', '+1 (555) 123-4567', '123 Business St, City, State 12345', 'John Smith', 'abccorp', 'active', 2, NOW(), TRUE),
('TECH_SOLUTIONS', 'Tech Solutions Inc', 'contact@techsolutions.com', '+1 (555) 987-6543', '456 Tech Ave, Innovation City, State 67890', 'Sarah Johnson', 'techsol', 'active', 1, NOW(), TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert sample documents
INSERT INTO documents (id, name, type, client_id, size, viewed, downloaded, description, created_at) VALUES
('DOC001', 'Balance Sheet Q1 2024.pdf', 'Balance Sheet', 'CLIENT123', '1.2 MB', true, 2, 'Q1 2024 financial statements', NOW() - INTERVAL '1 week'),
('DOC002', 'Tax Return 2023.pdf', 'Tax Return', 'CLIENT456', '3.5 MB', true, 1, 'Annual tax return filing', NOW() - INTERVAL '2 weeks'),
('DOC003', 'GST Return Q4 2023.pdf', 'GST Return', 'CLIENT789', '0.8 MB', false, 0, 'Quarterly GST filing', NOW() - INTERVAL '3 weeks'),
('DOC004', 'Profit & Loss Statement Q1 2024.pdf', 'P&L Statement', 'CLIENT123', '1.5 MB', true, 3, 'Q1 2024 P&L analysis', NOW() - INTERVAL '1 week'),
('DOC005', 'Invoice #INV-2024-001.pdf', 'Invoice', 'CLIENT321', '0.5 MB', false, 0, 'Service invoice for March 2024', NOW() - INTERVAL '3 days'),
('DOC006', 'Receipt #REC-2024-015.pdf', 'Receipt', 'CLIENT654', '0.3 MB', true, 1, 'Payment receipt', NOW() - INTERVAL '5 days'),
('DOC007', 'Annual Report 2023.pdf', 'Other', 'CLIENT654', '2.1 MB', false, 0, 'Comprehensive annual report', NOW() - INTERVAL '1 month')
ON CONFLICT (id) DO NOTHING;

-- Insert demo documents
INSERT INTO documents (id, name, type, client_id, size, viewed, downloaded, description, created_at) VALUES
('DOC001', 'Financial Report Q1 2024', 'PDF', 'ACME_CORP', '2.5 MB', TRUE, 3, 'Quarterly financial report for Q1 2024', NOW()),
('DOC002', 'Tax Documents 2023', 'PDF', 'ACME_CORP', '1.8 MB', FALSE, 0, 'Annual tax documents for 2023', NOW()),
('DOC003', 'Investment Portfolio', 'Excel', 'TECH_SOLUTIONS', '3.2 MB', TRUE, 1, 'Current investment portfolio overview', NOW()),
('DOC004', 'Balance Sheet Q1 2024.pdf', 'Balance Sheet', 'CLIENT123', '1.2 MB', true, 2, 'Q1 2024 financial statements', NOW() - INTERVAL '1 week'),
('DOC005', 'Tax Return 2023.pdf', 'Tax Return', 'CLIENT456', '3.5 MB', true, 1, 'Annual tax return filing', NOW() - INTERVAL '2 weeks')
ON CONFLICT (id) DO NOTHING;

-- Insert sample activities
INSERT INTO activities (id, action, details, user_name, user_type, ip, created_at) VALUES
('ACT001', 'Document uploaded', 'Balance Sheet Q1 2024 for ABC Corporation', 'Admin User', 'admin', '192.168.1.1', NOW() - INTERVAL '1 week'),
('ACT002', 'Client added', 'New client XYZ Enterprises registered', 'Manager User', 'admin', '192.168.1.2', NOW() - INTERVAL '2 months'),
('ACT003', 'Document viewed', 'Balance Sheet Q1 2024.pdf', 'ABC Corporation', 'client', '192.168.1.3', NOW() - INTERVAL '3 days'),
('ACT004', 'Client login', 'Client ABC Corporation logged in', 'ABC Corporation', 'client', '192.168.1.4', NOW() - INTERVAL '2 hours'),
('ACT005', 'Document downloaded', 'Tax Return 2023.pdf', 'XYZ Enterprises', 'client', '192.168.1.5', NOW() - INTERVAL '1 day'),
('ACT006', 'Admin login', 'Admin User logged in', 'Admin User', 'admin', '192.168.1.1', NOW() - INTERVAL '30 minutes'),
('ACT007', 'Document shared', 'Invoice shared with PQR Inc', 'Admin User', 'admin', '192.168.1.1', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Insert demo activities
INSERT INTO activities (id, action, details, user_name, user_type, ip, created_at) VALUES
('ACT001', 'Client login', 'Client ACME Corporation logged in', 'abccorp', 'client', '192.168.1.100', NOW()),
('ACT002', 'Document uploaded', 'Financial Report Q1 2024 uploaded for ACME Corporation', 'Admin User', 'admin', '192.168.1.50', NOW() - INTERVAL '1 hour'),
('ACT003', 'Document downloaded', 'Tax Documents 2023 downloaded by ACME Corporation', 'abccorp', 'client', '192.168.1.100', NOW() - INTERVAL '2 hours'),
('ACT004', 'Document viewed', 'Balance Sheet Q1 2024.pdf', 'ABC Corporation', 'client', '192.168.1.3', NOW() - INTERVAL '3 days'),
('ACT005', 'Admin login', 'Admin User logged in', 'Admin User', 'admin', '192.168.1.1', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (id, title, message, type, recipient_id, recipient_type, read, created_at) VALUES
('NOT001', 'New document available', 'Your Q1 2024 financial statements have been uploaded', 'info', 'CLIENT123', 'client', false, NOW() - INTERVAL '1 week'),
('NOT002', 'GST Return reminder', 'Your Q1 2024 GST Return is due in 7 days', 'warning', 'CLIENT456', 'client', false, NOW() - INTERVAL '3 days'),
('NOT003', 'Welcome to Santu Saha Hero', 'Your account has been created successfully', 'success', 'CLIENT321', 'client', true, NOW() - INTERVAL '1 month'),
('NOT004', 'Document viewed', 'Your Balance Sheet Q1 2024 has been viewed', 'info', 'CLIENT123', 'client', true, NOW() - INTERVAL '3 days'),
('NOT005', 'Password reset', 'Your password has been reset successfully', 'warning', 'CLIENT654', 'client', false, NOW() - INTERVAL '2 days'),
('NOT006', 'New client registered', 'EFG Solutions has completed registration', 'info', '00000000-0000-0000-0000-000000000001', 'admin', false, NOW() - INTERVAL '2 weeks')
ON CONFLICT (id) DO NOTHING;

-- Insert demo notifications
INSERT INTO notifications (id, title, message, type, read, recipient_id, recipient_type, created_at) VALUES
('NOT001', 'New Document Available', 'A new financial report has been uploaded to your account.', 'info', FALSE, 'ACME_CORP', 'client', NOW()),
('NOT002', 'Account Update', 'Your account information has been successfully updated.', 'success', TRUE, 'ACME_CORP', 'client', NOW() - INTERVAL '1 day'),
('NOT003', 'Welcome to Santu Saha Hero', 'Your account has been created successfully', 'success', 'CLIENT123', 'client', true, NOW() - INTERVAL '1 month'),
('NOT004', 'GST Return reminder', 'Your Q1 2024 GST Return is due in 7 days', 'warning', 'CLIENT456', 'client', false, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;
