import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Employee } from '../types';
import './Dashboard.css';

export default function ProfilePage() {
  const { employeeId } = useParams();
  const location = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.from('employees').select('*').eq('id', employeeId ?? '').single();
      setEmployee(data ?? null);
    };

    void loadProfile();
  }, [employeeId]);

  const isViewOnly = Boolean((location.state as { isViewOnly?: boolean } | null)?.isViewOnly);

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-topbar">
          <Link to="/" className="dashboard-brand">
            <span className="brand-mark">H</span>
            <span>HRMS</span>
          </Link>
          <div className="dashboard-tabs">
            <span className="dashboard-tab">Profile</span>
          </div>
        </header>

        <main className="dashboard-main">
          <section className="dashboard-panel">
            <h1 className="dashboard-title">My Profile</h1>
            <p className="dashboard-subtitle">{isViewOnly ? 'View-only mode opened by admin.' : 'Profile shell for the signed-in user.'}</p>
            <div className="profile-shell">
              <div className="profile-avatar large">{employee?.first_name?.slice(0, 1) ?? 'H'}</div>
              <div>
                <h2>{employee ? `${employee.first_name} ${employee.last_name}` : 'Employee'}</h2>
                <p>{employee?.job_position ?? 'Job Position pending'}</p>
                <p>{employee?.email ?? 'Email not loaded'}</p>
                <p>{employee?.phone ?? 'Mobile not loaded'}</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}