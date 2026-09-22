-- property-images & site-assets: readable (needed to mint signed URLs publicly)
CREATE POLICY "public read property images" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('property-images','site-assets'));
CREATE POLICY "admins upload property images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('property-images','site-assets') AND public.is_admin(auth.uid()));
CREATE POLICY "admins update property images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('property-images','site-assets') AND public.is_admin(auth.uid()));
CREATE POLICY "admins delete property images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('property-images','site-assets') AND public.is_admin(auth.uid()));

-- acquisition-photos: private; only staff can read, writes happen server-side
CREATE POLICY "staff read acquisition photos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'acquisition-photos' AND public.is_staff(auth.uid()));
CREATE POLICY "admins delete acquisition photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'acquisition-photos' AND public.is_admin(auth.uid()));