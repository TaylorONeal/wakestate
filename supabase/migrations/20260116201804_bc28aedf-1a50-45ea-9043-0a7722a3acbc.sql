-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;

-- Create a restrictive policy that blocks direct client inserts
-- The edge function uses service role key which bypasses RLS anyway
CREATE POLICY "Block direct anonymous inserts"
ON public.feedback
FOR INSERT
TO authenticated
WITH CHECK (false);