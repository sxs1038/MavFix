// Database types for MavFix

export type UserRole = 'student' | 'staff' | 'admin'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export type RequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  department: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Building {
  id: string
  code: string
  name: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  default_priority: Priority
  sla_hours: number
  created_at: string
}

export interface Request {
  id: string
  order_number: string
  requester_id: string
  building_id: string
  specific_location: string
  category_id: string
  priority: Priority
  status: RequestStatus
  title: string
  description: string
  assigned_to: string | null
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface RequestWithRelations extends Request {
  building: Building
  category: Category
  requester: Profile
  assignee: Profile | null
}

export interface StatusLog {
  id: string
  request_id: string
  previous_status: RequestStatus | null
  new_status: RequestStatus
  changed_by: string
  notes: string | null
  created_at: string
}

export interface StatusLogWithProfile extends StatusLog {
  profile: Profile
}

// Form types
export interface SubmitRequestForm {
  building_id: string
  specific_location: string
  category_id: string
  priority: Priority
  title: string
  description: string
}

// Analytics types
export interface DashboardStats {
  total: number
  pending: number
  in_progress: number
  completed: number
}
