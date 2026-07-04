import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Auth.css';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Supabase automatically parses the hash and exchanges it for a session
        // We need to wait a bit for it to be set
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Try to get the session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // Session not yet set, try using the hash manually
          const hash = window.location.hash.substring(1);
          if (!hash) {
            setError('Invalid verification link. Please check your email again.');
            return;
          }

          // Parse the hash to get the access token
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (!accessToken || !refreshToken) {
            setError('Invalid verification link. Please check your email again.');
            return;
          }

          // Set the session manually
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            throw setSessionError;
          }
        }

        // Now get the authenticated user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Check if this is a company admin or employee
          const { data: employee } = await supabase
            .from('employees')
            .select('id, role, must_change_password')
            .eq('id', user.id)
            .maybeSingle();

          if (employee) {
            // Employee record exists
            if (employee.must_change_password) {
              setMessage('Email verified! Redirecting to set password...');
              setTimeout(() => {
                navigate('/set-password');
              }, 1000);
            } else if (employee.role === 'admin') {
              setMessage('Email verified! Redirecting to admin dashboard...');
              setTimeout(() => {
                navigate('/admin');
              }, 1000);
            } else {
              setMessage('Email verified! Redirecting to your dashboard...');
              setTimeout(() => {
                navigate('/employee');
              }, 1000);
            }
          } else {
            // First-time company admin signup - create employee record
            const fullName = user.user_metadata?.full_name || 'Admin User';
            const [firstName, ...lastNameParts] = fullName.split(' ');
            const lastName = lastNameParts.join(' ') || firstName;

            // Try to create a default company record first if none exists
            let companyId: string | null = null;
            const companyName = user.user_metadata?.company_name || 'Default Company';
            
            // Check if company exists
            const { data: existingCompany } = await supabase
              .from('companies')
              .select('id')
              .eq('company_name', companyName)
              .maybeSingle();

            if (existingCompany) {
              companyId = existingCompany.id;
            } else {
              // Create new company
              const { data: newCompany, error: companyError } = await supabase
                .from('companies')
                .insert({
                  company_name: companyName,
                  company_code: companyName.toUpperCase().substring(0, 3),
                  admin_id: user.id,
                })
                .select('id')
                .single();

              if (!companyError && newCompany) {
                companyId = newCompany.id;
              }
            }

            // Create employee record for the admin
            if (companyId) {
              const { error: createEmpError } = await supabase
                .from('employees')
                .insert({
                  id: user.id,
                  company_id: companyId,
                  first_name: firstName,
                  last_name: lastName,
                  email: user.email,
                  phone: user.user_metadata?.phone || '',
                  role: 'admin',
                  status: 'active',
                  date_of_joining: new Date().toISOString().split('T')[0],
                });

              if (!createEmpError) {
                setMessage('Email verified! Redirecting to admin dashboard...');
                setTimeout(() => {
                  navigate('/admin');
                }, 1000);
              } else {
                throw createEmpError;
              }
            } else {
              setError('Could not create employee record. Please try signing in.');
            }
          }
        } else {
          setError('Could not find user. Please try signing in.');
        }
      } catch (err: any) {
        console.error('Email confirmation error:', err);
        setError(err.message || 'An error occurred during email verification.');
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-intro">
          <h1>Email Verification</h1>
          {error ? (
            <div className="error-message">
              <p>{error}</p>
              <button
                className="auth-button"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <p>{message}</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default AuthCallback;
