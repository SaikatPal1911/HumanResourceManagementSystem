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
    setIsLoading(true);

    try {
      // Step 1: Create auth user (without email verification)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            company_name: data.companyName,
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

      const userId = signUpData.user.id;

      // Step 2: Create company record
      const companyCode = data.companyName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 5);

      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          company_name: data.companyName,
          company_code: companyCode,
        })
        .select('id')
        .single();

      if (companyError) {
        throw companyError;
      }

      const companyId = companyData.id;

      // Step 3: Create employee record for admin
      const [firstName, ...lastNameParts] = data.fullName.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      const { error: employeeError } = await supabase.from('employees').insert({
        id: userId,
        company_id: companyId,
        first_name: firstName,
        last_name: lastName,
        email: data.email,
        phone: data.phone || '',
        role: 'admin',
        status: 'active',
        date_of_joining: new Date().toISOString().split('T')[0],
      });

      if (employeeError) {
        throw employeeError;
      }

      // Step 4: Sign in user automatically
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        throw signInError;
      }

      // Step 5: Redirect to admin dashboard
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
          <h1>Create your <span>company's first account</span></h1>
          <p>
            This is a one-time setup for the primary HR administrator. You'll be logged in immediately and can start adding employees.
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
                <input id="companyName" type="text" placeholder="Your Company LLC" {...register('companyName')} className={`form-input ${errors.companyName ? 'error' : ''}`} disabled={isLoading} />
                {errors.companyName && <p className="error-message">{errors.companyName.message}</p>}
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

              {selectedLogo && <p className="helper-text">Selected logo: {selectedLogo}</p>}

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
