-- Create storage policies for property and parking images
CREATE POLICY "Authenticated users can view property images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own property images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own property images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view parking images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'parking_images');

CREATE POLICY "Authenticated users can upload parking images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'parking_images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own parking images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'parking_images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own parking images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'parking_images' AND auth.uid() IS NOT NULL);