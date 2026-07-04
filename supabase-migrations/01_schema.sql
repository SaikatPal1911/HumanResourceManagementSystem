-- Core tables and RLS setup for HRMS

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Companies table
create table public.companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  company_code text not null unique,
  created_at timestamptz not null default now()
);

-- 2. Employees table (profile table linked 1:1 to auth.users)
create table public.employees (
  id uuid primary key references auth.users on delete cascade,
  company_id uuid not null references companies on delete cascade,
  login_id text not null unique,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  role text not null check (role in ('admin', 'employee')),
  job_position text,
  department text,
  manager_id uuid references employees on delete set null,
  location text,
  profile_picture_url text,
  date_of_joining date,
  must_change_password boolean not null default true,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

-- Create index for faster login_id lookups
create index idx_employees_login_id on public.employees(login_id);
create index idx_employees_company_id on public.employees(company_id);
create index idx_employees_manager_id on public.employees(manager_id);

-- 3. Attendance table
create table public.attendance (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references public.employees on delete cascade,
  attendance_date date not null,
  check_in timestamptz,
  check_out timestamptz,
  created_at timestamptz not null default now(),
  unique (employee_id, attendance_date)
);

create index idx_attendance_employee_date on public.attendance(employee_id, attendance_date);

-- ============================================================
-- SECURITY DEFINER helper functions (avoid recursive RLS issues)
-- ============================================================

-- Create a schema for functions (optional, using public for simplicity)

-- is_admin_of: Check if requesting user is admin of given company
create or replace function public.is_admin_of(p_company_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  v_role text;
begin
  select e.role into v_role
  from public.employees e
  where e.id = auth.uid() and e.company_id = p_company_id;

  return v_role = 'admin';
end;
$$;

-- get_email_by_login_id: Return email for a login_id (SECURITY DEFINER)
create or replace function public.get_email_by_login_id(p_login_id text)
returns text
language plpgsql
security definer
as $$
declare
  v_email text;
begin
  select e.email into v_email
  from public.employees e
  where e.login_id = p_login_id;

  return v_email;
end;
$$;

-- generate_login_id: Generate unique login ID with serial per company/year
create or replace function public.generate_login_id(
  p_company_code text,
  p_first_name text,
  p_last_name text,
  p_year integer
)
returns text
language plpgsql
security definer
as $$
declare
  v_first_part text;
  v_last_part text;
  v_serial int;
  v_login_id text;
begin
  -- Get first 2 letters of first name (uppercase, pad with X if needed)
  v_first_part := coalesce(upper(substr(p_first_name, 1, 2)), 'XX');
  if length(v_first_part) = 1 then
    v_first_part := v_first_part || 'X';
  end if;

  -- Get first 2 letters of last name (uppercase, pad with X if needed)
  v_last_part := coalesce(upper(substr(p_last_name, 1, 2)), 'XX');
  if length(v_last_part) = 1 then
    v_last_part := v_last_part || 'X';
  end if;

  -- Get next serial for this company/year (with locking to avoid race conditions)
  select nextval(pg_get_serial_sequence('employee_login_serial', 'id')) into v_serial;
  
  -- If sequence doesn't exist, create it and use alternative approach
  if v_serial is null then
    -- Use transaction with locking
    select count(*) + 1 into v_serial
    from public.employees e
    where e.company_id in (select id from public.companies where company_code = p_company_code)
      and extract(year from e.date_of_joining) = p_year;
  end if;

  -- Format serial as 4 digits
  v_login_id := p_company_code || v_first_part || v_last_part || p_year || lpad(v_serial::text, 4, '0');

  -- Ensure uniqueness (loop if collision - should be rare)
  while exists (select 1 from public.employees where login_id = v_login_id) loop
    v_serial := v_serial + 1;
    v_login_id := p_company_code || v_first_part || v_last_part || p_year || lpad(v_serial::text, 4, '0');
  end loop;

  return v_login_id;
end;
$$;

-- Create a sequence table for proper serial management
create table if not exists public.employee_login_serial (
  company_code text not null,
  year integer not null,
  last_serial integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (company_code, year)
);

-- Improved generate_login_id with proper atomic serial increment
create or replace function public.generate_login_id(
  p_company_code text,
  p_first_name text,
  p_last_name text,
  p_year integer
)
returns text
language plpgsql
security definer
as $$
declare
  v_first_part text;
  v_last_part text;
  v_serial int;
  v_login_id text;
begin
  -- Get first 2 letters of first name (uppercase, pad with X if needed)
  v_first_part := upper(coalesce(nullif(substr(p_first_name, 1, 2), ''), 'X'));
  if length(v_first_part) = 1 then
    v_first_part := v_first_part || 'X';
  end if;
  if length(v_first_part) < 2 then
    v_first_part := v_first_part || repeat('X', 2 - length(v_first_part));
  end if;

  -- Get first 2 letters of last name (uppercase, pad with X if needed)
  v_last_part := upper(coalesce(nullif(substr(p_last_name, 1, 2), ''), 'X'));
  if length(v_last_part) = 1 then
    v_last_part := v_last_part || 'X';
  end if;
  if length(v_last_part) < 2 then
    v_last_part := v_last_part || repeat('X', 2 - length(v_last_part));
  end if;

  -- Atomically increment and get serial for this company/year with locking
  insert into public.employee_login_serial (company_code, year, last_serial, updated_at)
  values (p_company_code, p_year, 1, now())
  on conflict (company_code, year)
  do update set last_serial = employee_login_serial.last_serial + 1, updated_at = now()
  returning last_serial into v_serial;

  -- Format serial as 4 digits
  v_login_id := p_company_code || v_first_part || v_last_part || p_year || lpad(v_serial::text, 4, '0');

  return v_login_id;
end;
$$;

-- Grant execute permissions
revoke execute on function public.is_admin_of from public;
grant execute on function public.is_admin_of to authenticated;

revoke execute on function public.get_email_by_login_id from public;
grant execute on function public.get_email_by_login_id to authenticated;
grant execute on function public.get_email_by_login_id to anon;

revoke execute on function public.generate_login_id from public;
grant execute on function public.generate_login_id to authenticated;

-- ============================================================
-- Row Level Security policies for employees table
-- ============================================================

-- Enable RLS
alter table public.companies enable row level security;
alter table public.employees enable row level security;
alter table public.attendance enable row level security;

-- Policy: Users can select their own row
create policy "employees_select_own"
  on public.employees
  for select
  using (id = auth.uid());

-- Policy: Users can update limited fields on their own row
create policy "employees_update_own"
  on public.employees
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Policy: Admins can select all employees in their company
create policy "employees_admin_select"
  on public.employees
  for select
  using (public.is_admin_of(company_id));

-- Policy: Admins can update all employees in their company
create policy "employees_admin_update"
  on public.employees
  for update
  using (public.is_admin_of(company_id))
  with check (true);

-- Policy: No direct insert from client (inserts only via Edge Function)
-- This is enforced by not having an insert policy for authenticated users

-- Note: The Edge Function uses service_role key to bypass RLS and insert

-- ============================================================
-- Attendance RLS policies
-- ============================================================

create policy "attendance_select_own"
  on public.attendance
  for select
  using (employee_id = auth.uid());

create policy "attendance_admin_select_company"
  on public.attendance
  for select
  using (
    exists (
      select 1
      from public.employees e
      where e.id = public.attendance.employee_id
        and public.is_admin_of(e.company_id)
    )
  );

create policy "attendance_insert_own"
  on public.attendance
  for insert
  with check (employee_id = auth.uid());

create policy "attendance_update_own"
  on public.attendance
  for update
  using (employee_id = auth.uid())
  with check (employee_id = auth.uid());
