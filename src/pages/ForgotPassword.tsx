import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import './Auth.css';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/set-password`,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('If the email exists, a reset link has been sent.');
  };

  return (
    <div className="auth-page">
      <div className="auth-shell frame">
        <section className="auth-intro">
          <Link className="brand auth-brand" to="/">
            <span className="brand-badge">H</span>
            <span>HRMS</span>
          </Link>
          <div className="auth-kicker">Recovery</div>
          <h1>Reset access without breaking the <span>HR flow</span></h1>
          <p>
            Use this page when a user forgets a password. The reset link returns them to the secure password setup screen.
          </p>
          <ul className="auth-points">
            <li>Only asks for email.</li>
            <li>Sends a secure reset link.</li>
            <li>Returns users to password setup.
            </li>
          </ul>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
            <h1>Forgot Password</h1>
            <p className="subtitle">Enter your email to receive a reset link.</p>

            <div className="auth-note">
              <strong>Tip:</strong> if this is a company account, use the same email or Login ID that HR used during onboarding.
            </div>

            <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {message && <p className="success-message">{message}</p>}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="name@company.com" {...register('email')} className={`form-input ${errors.email ? 'error' : ''}`} />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
              </div>

              <button type="submit" className="btn-main auth-button" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="auth-footer">
              Remembered it? <Link to="/login">Back to Sign In</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
