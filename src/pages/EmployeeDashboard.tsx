import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Dashboard.css';

interface Attendance {
  id: string;
  employee_id: string;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
}

interface Employee {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  job_position: string;
  avatar: string | null;
}

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSelf();
  }, []);

  const loadSelf = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      // Get employee record
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (empError) {
        throw empError;
      }

      setEmployee(empData);

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: attData } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', empData.id)
        .eq('attendance_date', today)
        .maybeSingle();

      setTodayAttendance(attData);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendance = async (action: 'check_in' | 'check_out') => {
    try {
      if (!employee) {
        throw new Error('Employee not found');
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      if (action === 'check_in') {
        // Create new attendance record
        const { error } = await supabase.from('attendance').insert({
          employee_id: employee.id,
          attendance_date: today,
          check_in: now,
          check_out: null,
        });

        if (error) throw error;
      } else if (action === 'check_out') {
        // Update existing attendance record
        const { error } = await supabase
          .from('attendance')
          .update({ check_out: now })
          .eq('employee_id', employee.id)
          .eq('attendance_date', today);

        if (error) throw error;
      }

      // Reload attendance
      loadSelf();
    } catch (err: any) {
      setError(err.message || `Failed to ${action}`);
    }
  };

  const getStatusColor = () => {
    if (!todayAttendance) return 'yellow';
    if (todayAttendance.check_in && !todayAttendance.check_out) return 'green';
    if (todayAttendance.check_out) return 'red';
    return 'yellow';
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="topbar">
          <div className="topbar-brand">
            <span className="brand-badge">H</span>
            <span>HRMS</span>
          </div>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="topbar">
          <div className="topbar-brand">
            <span className="brand-badge">H</span>
            <span>HRMS</span>
          </div>
        </div>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="topbar">
        <div className="topbar-brand">
          <span className="brand-badge">H</span>
          <span>HRMS</span>
        </div>
        <div className="topbar-right">
          <button
            className="logout-button"
            onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <section className="employee-section">
          <div className="section-header">
            <h1>Welcome, {employee?.name}</h1>
          </div>

          <div className="employee-card">
            {employee?.avatar && <img src={employee.avatar} alt={employee.name} className="avatar" />}
            <div className="card-content">
              <h2>{employee?.name}</h2>
              <p className="job-position">{employee?.job_position}</p>
              <p className="contact">{employee?.email}</p>
              <p className="contact">{employee?.phone}</p>
            </div>
          </div>

          <div className="attendance-section">
            <h3>Today's Attendance</h3>
            <div className={`attendance-status status-${getStatusColor()}`}>
              <div className="status-indicator"></div>
              <div className="status-content">
                <p className="status-text">
                  {!todayAttendance
                    ? 'Not started'
                    : todayAttendance.check_in && !todayAttendance.check_out
                    ? `Checked in at ${formatTime(todayAttendance.check_in)}`
                    : `Checked out at ${formatTime(todayAttendance.check_out)}`}
                </p>
              </div>
            </div>

            {todayAttendance && (
              <div className="attendance-times">
                <div className="time-row">
                  <span>Check In:</span>
                  <span className="time">{formatTime(todayAttendance.check_in)}</span>
                </div>
                {todayAttendance.check_out && (
                  <div className="time-row">
                    <span>Check Out:</span>
                    <span className="time">{formatTime(todayAttendance.check_out)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="button-group">
              {!todayAttendance ? (
                <button
                  className="attendance-button check-in"
                  onClick={() => handleAttendance('check_in')}
                >
                  Check In →
                </button>
              ) : !todayAttendance.check_out ? (
                <button
                  className="attendance-button check-out"
                  onClick={() => handleAttendance('check_out')}
                >
                  Check Out →
                </button>
              ) : (
                <button className="attendance-button disabled" disabled>
                  Already checked out today
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
