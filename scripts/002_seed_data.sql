-- MavFix Seed Data
-- This script populates initial buildings and categories

-- Insert Buildings (UT Arlington campus buildings)
INSERT INTO public.buildings (code, name) VALUES
  ('CL', 'Central Library'),
  ('ERB', 'Engineering Research Building'),
  ('NH', 'Nedderman Hall'),
  ('PKH', 'Pickard Hall'),
  ('UC', 'University Center'),
  ('MAC', 'Maverick Activities Center'),
  ('SH', 'Science Hall'),
  ('FA', 'Fine Arts Building'),
  ('COBA', 'College of Business Administration'),
  ('SWSH', 'Southwest Hall'),
  ('KC', 'Kalpana Chawla Hall'),
  ('AENH', 'Engineering North Hall'),
  ('SEIR', 'SEIR Building'),
  ('TC', 'Trimble Hall'),
  ('AH', 'Architecture Hall')
ON CONFLICT (code) DO NOTHING;

-- Insert Categories with default priorities and SLA hours
INSERT INTO public.categories (name, description, default_priority, sla_hours) VALUES
  ('HVAC/Temperature', 'Heating, ventilation, air conditioning issues', 'medium', 24),
  ('Electrical/Lighting', 'Electrical problems, lighting issues, power outages', 'high', 12),
  ('Plumbing', 'Water leaks, clogged drains, restroom issues', 'high', 8),
  ('IT/Network', 'Internet connectivity, computer issues, AV equipment', 'medium', 24),
  ('Furniture/Equipment', 'Broken furniture, damaged equipment', 'low', 72),
  ('Cleaning/Janitorial', 'Cleaning requests, spills, trash removal', 'low', 48),
  ('Security/Access', 'Door locks, key card issues, security concerns', 'high', 4),
  ('Pest Control', 'Insect or rodent issues', 'medium', 48),
  ('Grounds/Exterior', 'Landscaping, parking lot, exterior maintenance', 'low', 96),
  ('Fire Safety', 'Fire extinguisher, smoke detector, emergency equipment', 'critical', 2),
  ('Elevator', 'Elevator malfunctions or entrapment', 'critical', 1),
  ('Other', 'General maintenance requests', 'medium', 48)
ON CONFLICT (name) DO NOTHING;
