/*
  # Configure Storage RLS Policies for Image Uploads

  1. Storage Policies
    - Enable RLS on storage.objects table
    - Add policy for authenticated users to insert images
    - Add policy for public read access to images
    - Add policy for users to update their own uploaded images
    - Add policy for users to delete their own uploaded images

  2. Security
    - Restrict uploads to images bucket only
    - Allow only authenticated users to upload
    - Allow public read access for displaying images
    - Users can only modify their own uploads
*/

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND
    auth.role() = 'authenticated'
  );

-- Policy to allow public read access to images
CREATE POLICY "Public can view images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'images');

-- Policy to allow users to update their own uploaded images
CREATE POLICY "Users can update own images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    auth.uid()::text = owner
  )
  WITH CHECK (
    bucket_id = 'images' AND
    auth.uid()::text = owner
  );

-- Policy to allow users to delete their own uploaded images
CREATE POLICY "Users can delete own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    auth.uid()::text = owner
  );