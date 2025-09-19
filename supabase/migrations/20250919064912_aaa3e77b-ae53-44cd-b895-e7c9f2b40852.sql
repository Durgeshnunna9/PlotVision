-- Add missing RLS policies for admins and managers to view profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "Managers can view all profiles" ON public.profiles  
FOR SELECT USING (get_current_user_role() = 'manager');

-- Enable real-time for properties table
ALTER TABLE public.properties REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;

-- Enable real-time for profiles table  
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;