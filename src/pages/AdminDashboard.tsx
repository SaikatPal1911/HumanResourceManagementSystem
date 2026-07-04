import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Employee } from '../types';
import './Dashboard.css';

type EmployeeForm = {
  fullName: string;
  email: string;
  phone: string;
  jobPosition: string;
  department: string;
  location: string;
};

type EmployeeWithStatus = Employee & {
  statusToday: 'green' | 'yellow' | 'airplane';
};

const initialForm: EmployeeForm = {
  fullName: '',
  email: '',
  phone: '',
  jobPosition: '',
  department: '',
  location: '',
};

const formatDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<EmployeeWithStatus[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employeeForm, setEmployeeForm] = useState(initialForm);
  const [creating, setCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ loginId: string; tempPassword: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;

        if (!userId) {
          throw new Error('No active session found.');
        }

        const employeeTable = supabase.from('employees') as any;
        const attendanceTable = supabase.from('attendance') as any;

        const { data: meData, error: meError } = await employeeTable
          .select('*')
          .eq('id', userId)
          .single();

        if (meError || !meData) {
          throw new Error('Could not load your profile.');
        }

        setMe(meData);

        const { data: employeeRows, error: employeeError } = await employeeTable
          .select('*')
          .eq('company_id', meData.company_id)
          .order('created_at', { ascending: false });

        if (employeeError || !employeeRows) {
          throw new Error('Could not load employees.');
        }

        const today = formatDateKey();
        const { data: attendanceRows } = await attendanceTable
          .select('employee_id, check_in, check_out, attendance_date')
          .eq('attendance_date', today);

        const attendanceByEmployee = new Map<string, { check_in: string | null; check_out: string | null }>();
        (attendanceRows ?? []).forEach((row: { employee_id: string; check_in: string | null; check_out: string | null }) => {
          attendanceByEmployee.set(row.employee_id, { check_in: row.check_in, check_out: row.check_out });
        });

        setEmployees(
          (employeeRows ?? []).map((employee: Employee) => {
            const todayAttendance = attendanceByEmployee.get(employee.id);
            const statusToday: EmployeeWithStatus['statusToday'] = todayAttendance
              ? todayAttendance.check_out
                ? 'yellow'
                : 'green'
              : 'yellow';

            return {
              ...employee,
              statusToday,
            };
          }),
        );
      } catch (loadError: any) {
        setError(loadError?.message ?? 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const filteredEmployees = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) {
      return employees;
    }

    return employees.filter((employee) => {
      const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
      return fullName.includes(needle) || employee.login_id.toLowerCase().includes(needle);
    });
  }, [employees, search]);

  const handleCreateEmployee = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('create-employee', {
        body: employeeForm,
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      setCreatedCredentials({ loginId: data.loginId, tempPassword: data.tempPassword });
      setEmployeeForm(initialForm);
      setShowAddEmployee(false);

      const { data: employeeRows } = await (supabase.from('employees') as any)
        .select('*')
        .eq('company_id', me?.company_id ?? '')
        .order('created_at', { ascending: false });

      if (employeeRows) {
        setEmployees((employeeRows as Employee[]).map((employee) => ({ ...employee, statusToday: 'yellow' })));
      }
    } catch (createError: any) {
      setError(createError?.message ?? 'Could not create employee.');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return <div className="dashboard-page dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-topbar">
          <Link to="/" className="dashboard-brand">
            <span className="brand-mark">H</span>
            <span>HRMS</span>
          </Link>

          <nav className="dashboard-tabs" aria-label="Main dashboard tabs">
            <button className="dashboard-tab active" type="button">Employees</button>
            <button className="dashboard-tab" type="button" disabled>Attendance</button>
            <button className="dashboard-tab" type="button" disabled>Time Off</button>
          </nav>

          <div className="dashboard-avatar-area">
            <button className="avatar-button" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Open profile menu">
              <span className="avatar-dot green" aria-hidden="true" />
              <span className="avatar-initial">{me?.first_name?.slice(0, 1) ?? 'A'}</span>
            </button>

            {menuOpen && (
              <div className="avatar-menu">
                <button type="button" onClick={() => navigate(`/profile/${me?.id ?? ''}`, { state: { isViewOnly: true } })}>My Profile</button>
                <button type="button" onClick={handleLogout}>Log Out</button>
              </div>
            )}
          </div>
        </header>

        <main className="dashboard-main">
          <section className="dashboard-hero card-surface">
            <div>
              <div className="eyebrow">Employees</div>
              <h1>Admin control for onboarding, status, and workforce visibility</h1>
              <p>
                Register employees from here. HR creates the account, gives the generated Login ID and temporary password,
                and the employee can sign in immediately.
              </p>
            </div>

            <div className="toolbar-row">
              <label className="search-wrap">
                <span>Search</span>
                <input
                  type="search"
                  placeholder="Search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <button className="new-button" type="button" onClick={() => setShowAddEmployee(true)}>
                NEW
              </button>
            </div>
          </section>

          {error && <p className="dashboard-message error">{error}</p>}
          {createdCredentials && (
            <div className="dashboard-message success">
              <strong>Employee created.</strong> Share Login ID {createdCredentials.loginId} and temporary password {createdCredentials.tempPassword}.
            </div>
          )}

          <section className="employee-grid">
            {filteredEmployees.map((employee) => (
              <button
                key={employee.id}
                type="button"
                className="employee-card card-surface"
                onClick={() => navigate(`/profile/${employee.id}`, { state: { isViewOnly: true } })}
              >
                <span className={`status-chip ${employee.statusToday}`} aria-label={`Employee status ${employee.statusToday}`}>
                  {employee.statusToday === 'airplane' ? '✈' : '•'}
                </span>
                <div className="employee-avatar">
                  {employee.profile_picture_url ? (
                    <img src={employee.profile_picture_url} alt={employee.first_name} />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                <div className="employee-name">{employee.first_name} {employee.last_name}</div>
                <div className="employee-meta">{employee.job_position ?? employee.department ?? employee.login_id}</div>
              </button>
            ))}
          </section>
        </main>
      </div>

      {showAddEmployee && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <form className="modal card-surface" onSubmit={handleCreateEmployee}>
            <div className="modal-head">
              <div>
                <div className="eyebrow">Add Employee</div>
                <h2>Create login credentials</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowAddEmployee(false)}>✕</button>
            </div>

            <div className="form-grid">
              <input placeholder="Full name" value={employeeForm.fullName} onChange={(event) => setEmployeeForm((current) => ({ ...current, fullName: event.target.value }))} required />
              <input placeholder="Work email" type="email" value={employeeForm.email} onChange={(event) => setEmployeeForm((current) => ({ ...current, email: event.target.value }))} required />
              <input placeholder="Phone" value={employeeForm.phone} onChange={(event) => setEmployeeForm((current) => ({ ...current, phone: event.target.value }))} />
              <input placeholder="Job position" value={employeeForm.jobPosition} onChange={(event) => setEmployeeForm((current) => ({ ...current, jobPosition: event.target.value }))} />
              <input placeholder="Department" value={employeeForm.department} onChange={(event) => setEmployeeForm((current) => ({ ...current, department: event.target.value }))} />
              <input placeholder="Location" value={employeeForm.location} onChange={(event) => setEmployeeForm((current) => ({ ...current, location: event.target.value }))} />
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowAddEmployee(false)}>Cancel</button>
              <button type="submit" className="primary-button" disabled={creating}>{creating ? 'Creating...' : 'Create Employee'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}