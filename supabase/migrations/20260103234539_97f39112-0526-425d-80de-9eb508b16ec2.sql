-- Policy: Only admins can update feedback
CREATE POLICY "Only admins can update feedback"
ON public.feedback
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy: Only admins can delete feedback
CREATE POLICY "Only admins can delete feedback"
ON public.feedback
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));