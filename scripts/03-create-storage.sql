-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Admin users can upload documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' AND
        auth.uid() IN (SELECT id FROM admin_users)
    );

CREATE POLICY "Admin users can view all documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' AND
        auth.uid() IN (SELECT id FROM admin_users)
    );

CREATE POLICY "Clients can view their own documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' AND
        (storage.foldername(name))[1] IN (
            SELECT id FROM clients WHERE email IN (
                SELECT email FROM auth.users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Admin users can delete documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'documents' AND
        auth.uid() IN (SELECT id FROM admin_users)
    );
