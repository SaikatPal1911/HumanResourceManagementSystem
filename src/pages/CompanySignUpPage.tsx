import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { companySignUpSchema, type CompanySignUpData } from '../lib/authSchema';
import './Auth.css';

const CompanySignUpPage = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanySignUpData>({
    resolver: zodResolver(companySignUpSchema),
  });

  const onSubmit = async (data: CompanySignUpData) => {
    setFormError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            company_name: data.companyName,
            phone: data.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      setFormError(
        errorMessage.includes('already registered')
          ? 'A user with this email is already registered.'
          : `Sign up failed: ${errorMessage}`,
      );
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-page">
        <div className="auth-shell">
          <section className="auth-intro">
            <Link className="brand auth-brand" to="/">
              <span className="brand-badge">H</span>
              <span>HRMS</span>
            </Link>
            <div className="auth-kicker">One more step</div>
            <h1>Check your email to <span>verify your account</span></h1>
            <p>
              We've sent a verification link to your email address. Please click the link to activate your account and finalize your company setup.
            </p>
            <ul className="auth-points">
              <li>Verify your email before signing in.</li>
              <li>Complete the first admin account setup.</li>
              <li>Then create employee accounts inside HRMS.</li>
            </ul>
          </section>
          <section className="auth-panel">
            <div className="auth-card">
              <div className="success-message">
                <h1>Verification Sent!</h1>
                <p>Please check your inbox and follow the instructions to complete your registration.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-intro">
          <Link className="brand auth-brand" to="/">
            <span className="brand-badge">H</span>
            <span>HRMS</span>
          </Link>
          <div className="auth-kicker">Admin Account Setup</div>
          <h1>Create your <span>company's first account</span></h1>
          <p>
            This is a one-time setup for the primary HR administrator. After verifying your email, you can log in and start adding employees.
          </p>
          <ul className="auth-points">
            <li>This account will have full admin privileges.</li>
            <li>Employees cannot register themselves.</li>
            <li>You will create employee accounts from your dashboard.</li>
          </ul>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
            <h1>Create Company Account</h1>
            <p className="subtitle">This is the first step to streamlining your HR operations.</p>

            <div className="auth-note">
              <strong>Important:</strong> this creates the first admin account for the company. Employees are added later by HR from inside the app.
            </div>

            <div className="upload-row" style={{ marginBottom: '14px' }}>
              <div className="auth-heading" style={{ margin: 0, textAlign: 'left' }}>COMPANY LOGO</div>
              <div className="upload-control">
                <label className="upload-label" htmlFor="companyLogo">↑ Upload Logo</label>
                <input
                  id="companyLogo"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setSelectedLogo(event.target.files?.[0]?.name ?? '')}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {formError && <p className="error-message form-error-message">{formError}</p>}

              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input id="companyName" type="text" placeholder="Your Company LLC" {...register('companyName')} className={`form-input ${errors.companyName ? 'error' : ''}`} />
                {errors.companyName && <p className="error-message">{errors.companyName.message}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Your Full Name</label>
                <input id="fullName" type="text" placeholder="e.g., Jane Doe" {...register('fullName')} className={`form-input ${errors.fullName ? 'error' : ''}`} />
                {errors.fullName && <p className="error-message">{errors.fullName.message}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Your Work Email</label>
                <input id="email" type="email" placeholder="you@company.com" {...register('email')} className={`form-input ${errors.email ? 'error' : ''}`} />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input id="phone" type="tel" {...register('phone')} className={`form-input ${errors.phone ? 'error' : ''}`} />
                {errors.phone && <p className="error-message">{errors.phone.message}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-row">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a secure password"
                    {...register('password')}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    className="eye-button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label="Toggle password visibility"
                  >
                    👁
                  </button>
                </div>
                {errors.password && <p className="error-message">{errors.password.message}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-row">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat the password"
                    {...register('confirmPassword')}
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    className="eye-button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label="Toggle confirm password visibility"
                  >
                    👁
                  </button>
                </div>
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
              </div>

              {selectedLogo && <p className="helper-text">Selected logo: {selectedLogo}</p>}

              <button type="submit" className="btn-main auth-button" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account? <Link to="/login">Sign In</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CompanySignUpPage;
