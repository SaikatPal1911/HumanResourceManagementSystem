export interface Employee {
  id: string;
  company_id: string;
  login_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  role: 'admin' | 'employee';
  job_position?: string | null;
  department?: string | null;
  profile_picture_url?: string | null;
  date_of_joining: string;
  status: 'active' | 'inactive';
  created_at: string;
}