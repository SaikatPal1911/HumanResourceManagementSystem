export type EmployeeRole = 'admin' | 'employee';

export interface Employee {
  id: string;
  company_id: string;
  login_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: EmployeeRole;
  job_position: string | null;
  department: string | null;
  manager_id: string | null;
  location: string | null;
  profile_picture_url: string | null;
  date_of_joining: string | null;
  must_change_password: boolean;
  status: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  company_code: string;
  created_at: string;
}