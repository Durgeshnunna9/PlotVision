-- Enable RLS on properties table (critical security fix)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for properties table
CREATE POLICY "Users can view their own properties" 
ON public.properties 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties" 
ON public.properties 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties" 
ON public.properties 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin access policies using security definer function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE POLICY "Admins can view all properties" 
ON public.properties 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update all properties" 
ON public.properties 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin');