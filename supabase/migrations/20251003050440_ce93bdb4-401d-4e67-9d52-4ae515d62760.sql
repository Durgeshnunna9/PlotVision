-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'agent');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create helper function to get user's primary role (for display)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::TEXT
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'manager' THEN 2
      WHEN 'agent' THEN 3
    END
  LIMIT 1
$$;

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create manager_agents table for manager-agent assignments
CREATE TABLE public.manager_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manager_id UUID NOT NULL,
    agent_id UUID NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (manager_id, agent_id),
    FOREIGN KEY (manager_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on manager_agents
ALTER TABLE public.manager_agents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for manager_agents
CREATE POLICY "Admins can view all manager-agent assignments"
ON public.manager_agents
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view their assigned agents"
ON public.manager_agents
FOR SELECT
TO authenticated
USING (manager_id = auth.uid() AND public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can insert manager-agent assignments"
ON public.manager_agents
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete manager-agent assignments"
ON public.manager_agents
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update profiles RLS to use role checks
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins and managers can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view agent profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'manager') 
  AND EXISTS (
    SELECT 1 FROM public.manager_agents 
    WHERE manager_id = auth.uid() AND agent_id = profiles.id
  )
);

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role
FROM public.profiles
WHERE role IN ('admin', 'manager', 'agent')
ON CONFLICT (user_id, role) DO NOTHING;