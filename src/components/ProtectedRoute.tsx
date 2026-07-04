import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'admin' | 'employee'>;
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login', { state: { from: location }, replace: true });
        return;
      }

      const { data: employee, error } = await supabase
        .from('employees')
        .select('role, must_change_password, status')
        .eq('id', session.user.id)
        .single();

      if (error || !employee) {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
        return;
      }

      if (employee.status === 'inactive') {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
        return;
      }

      if (employee.must_change_password && location.pathname !== '/set-password') {
        navigate('/set-password', { replace: true });
        return;
      }

      if (allowedRoles && !allowedRoles.includes(employee.role as 'admin' | 'employee')) {
        const fallback = employee.role === 'admin' ? '/admin' : '/employee';
        navigate(fallback, { replace: true });
        return;
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login', { replace: true });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location, allowedRoles]);

  if (loading) return <div>Loading...</div>;

  return <>{children}</>;
};

export default ProtectedRoute;