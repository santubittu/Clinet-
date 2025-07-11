-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies for document uploads
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  );

-- Create storage policies for viewing documents
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  );

-- Create storage policies for updating documents
CREATE POLICY "Users can update own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  );

-- Create storage policies for deleting documents
CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  );

-- Admin policies for full access
CREATE POLICY "Admins can manage all documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documents' AND 
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create storage bucket policies
CREATE POLICY "Users can view documents bucket" ON storage.buckets
  FOR SELECT USING (id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage documents bucket" ON storage.buckets
  FOR ALL USING (id = 'documents' AND auth.jwt() ->> 'role' = 'admin');
