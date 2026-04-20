-- MavFix Campus Maintenance Request System Database Schema
-- This script creates all tables needed for the system

-- 1. Profiles table (extends auth.users with role information)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
  department TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buildings table
CREATE TABLE IF NOT EXISTS public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  default_priority TEXT NOT NULL DEFAULT 'medium' CHECK (default_priority IN ('low', 'medium', 'high', 'critical')),
  sla_hours INTEGER NOT NULL DEFAULT 48,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Requests (Work Orders) table
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id),
  specific_location TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Status Logs table (tracks all status changes)
CREATE TABLE IF NOT EXISTS public.status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for buildings (public read)
CREATE POLICY "Anyone can view buildings" ON public.buildings FOR SELECT USING (true);
CREATE POLICY "Only admins can manage buildings" ON public.buildings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Only admins can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for requests
CREATE POLICY "Users can view own requests" ON public.requests FOR SELECT USING (
  requester_id = auth.uid() OR 
  assigned_to = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);
CREATE POLICY "Users can create requests" ON public.requests FOR INSERT WITH CHECK (requester_id = auth.uid());
CREATE POLICY "Staff and admins can update requests" ON public.requests FOR UPDATE USING (
  requester_id = auth.uid() OR
  assigned_to = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for status_logs
CREATE POLICY "Users can view related status logs" ON public.status_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.requests r 
    WHERE r.id = request_id AND (
      r.requester_id = auth.uid() OR 
      r.assigned_to = auth.uid() OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);
CREATE POLICY "Staff and admins can insert status logs" ON public.status_logs FOR INSERT WITH CHECK (
  changed_by = auth.uid() AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
  OR
  changed_by = auth.uid() AND
  EXISTS (SELECT 1 FROM public.requests WHERE id = request_id AND requester_id = auth.uid())
);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.requests
  WHERE order_number LIKE 'WO-' || year_part || '-%';
  
  NEW.order_number := 'WO-' || year_part || '-' || LPAD(seq_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$;

-- Create trigger for auto-generating order number
DROP TRIGGER IF EXISTS generate_order_number_trigger ON public.requests;
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.requests
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION public.generate_order_number();

-- Create function to calculate due date based on SLA
CREATE OR REPLACE FUNCTION public.calculate_due_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  sla INTEGER;
BEGIN
  SELECT sla_hours INTO sla FROM public.categories WHERE id = NEW.category_id;
  
  -- Adjust SLA based on priority
  IF NEW.priority = 'critical' THEN
    sla := GREATEST(sla / 4, 4);
  ELSIF NEW.priority = 'high' THEN
    sla := sla / 2;
  ELSIF NEW.priority = 'low' THEN
    sla := sla * 2;
  END IF;
  
  NEW.due_date := NOW() + (sla || ' hours')::INTERVAL;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-calculating due date
DROP TRIGGER IF EXISTS calculate_due_date_trigger ON public.requests;
CREATE TRIGGER calculate_due_date_trigger
  BEFORE INSERT ON public.requests
  FOR EACH ROW
  WHEN (NEW.due_date IS NULL)
  EXECUTE FUNCTION public.calculate_due_date();
