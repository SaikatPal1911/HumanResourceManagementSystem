import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Auth.css';

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        // Check if user has an employee record
        const { data: employee } = await supabase
          .from('employees')
          .select('role, must_change_password')
          .eq('user_id', data.user.id)
          .single();

        if (employee?.must_change_password) {
          navigate('/set-password');
        } else if (employee?.role === 'admin') {
          navigate('/admin');
        } else if (employee?.role === 'employee') {
          navigate('/employee');
        } else {
          // First time admin setup
          navigate('/admin');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-intro">
          <Link className="brand auth-brand" to="/">
            <span className="brand-badge">H</span>
            <span>HRMS</span>
          </Link>
          <h1>Welcome back to your <span>team's hub</span></h1>
          <p>Sign in with your email and password to access your dashboard.</p>
        </section>

        <section className="auth-panel">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="auth-links">
              <Link to="/forgot-password" className="link">Forgot password?</Link>
              <span>Don't have an account? <Link to="/registration" className="link">Register here</Link></span>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default SignIn;
