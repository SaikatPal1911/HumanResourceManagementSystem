import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { companySignUpSchema, type CompanySignUpData } from '../lib/authSchema';
import './Auth.css';

const CompanySignUpPage = () => {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanySignUpData>({
    resolver: zodResolver(companySignUpSchema),
  });

  const onSubmit = async (data: CompanySignUpData) => {
    setFormError(null);
    setIsLoading(true);

    try {
      // Step 1: Create auth user (without email verification)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            company_code: data.companyCode,
            phone: data.phone,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error('User creation failed');
      }

      // Step 2: Attach this user as admin to an EXISTING, pre-registered
      // company (matched by companyCode). No new company can be created
      // from this page, and the client never chooses its own role.
      const session = signUpData.session;
      if (!session) {
        throw new Error('Could not establish a session after sign up. Please try logging in.');
      }

      const { data: setupResult, error: setupError } = await supabase.functions.invoke(
        'create-company-admin',
        {
          body: {
            companyCode: data.companyCode,
            fullName: data.fullName,
            phone: data.phone,
          },
        },
      );

      if (setupError) {
        throw setupError;
      }
      if (setupResult?.error) {
        throw new Error(setupResult.error);
      }

      // Step 3: Sign in user automatically
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        throw signInError;
      }

      // Step 4: Redirect to admin dashboard
      navigate('/admin');
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      setFormError(
        errorMessage.includes('already registered')
          ? 'A user with this email is already registered.'
          : `Sign up failed: ${errorMessage}`,
      );
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
          <div className="auth-kicker">Admin Account Setup</div>
          <h1>Claim your <span>company's admin account</span></h1>
          <p>
            This only works if your company has already been registered by us. Enter the company code you were given to set up the one admin account for it.
          </p>
          <ul className="auth-points">
            <li>Your company must already exist in our system.</li>
            <li>Only the first person to sign up for a company code becomes its admin.</li>
            <li>Employees cannot register themselves; the admin adds them from the dashboard.</li>
          </ul>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
            <h1>Claim Admin Account</h1>
            <p className="subtitle">Enter your company code to set up the admin account.</p>

            <div className="auth-note">
              <strong>Important:</strong> this only works for companies already registered in our system. If you don't have a company code, contact us first.
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {formError && <p className="error-message form-error-message">{formError}</p>}

              <div className="form-group">
                <label htmlFor="companyCode">Company Code</label>
                <input id="companyCode" type="text" placeholder="e.g., ACME (given by your organization)" {...register('companyCode')} className={`form-input ${errors.companyCode ? 'error' : ''}`} disabled={isLoading} />
                {errors.companyCode && <p className="error-message">{errors.companyCode.message}</p>}
                <p className="helper-text">Your company must already be registered. Ask your organization for this code.</p>
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Your Full Name</label>
                <input id="fullName" type="text" placeholder="e.g., Jane Doe" {...register('fullName')} className={`form-input ${errors.fullName ? 'error' : ''}`} disabled={isLoading} />
                {errors.fullName && <p className="error-message">{errors.fullName.message}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Your Work Email</label>
                <input id="email" type="email" placeholder="you@company.com" {...register('email')} className={`form-input ${errors.email ? 'error' : ''}`} disabled={isLoading} />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input id="phone" type="tel" {...register('phone')} className={`form-input ${errors.phone ? 'error' : ''}`} disabled={isLoading} />
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
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="eye-button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label="Toggle password visibility"
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="eye-button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label="Toggle confirm password visibility"
                    disabled={isLoading}
                  >
                    👁
                  </button>
                </div>
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" className="btn-main auth-button" disabled={isLoading || isSubmitting}>
                {isLoading ? 'Setting up your account...' : 'Create Account'}
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