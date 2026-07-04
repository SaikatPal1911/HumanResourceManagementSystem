import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login', { state: { from: location }, replace: true });
        return;
      }

      const { data: employee, error } = await supabase
        .from('employees')
        .select('must_change_password')
        .eq('id', session.user.id)
        .single();

      if (error || !employee) {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
        return;
      }

      if (employee.must_change_password && location.pathname !== '/set-password') {
        navigate('/set-password', { replace: true });
      } else {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  if (loading) return <div>Loading...</div>; // Or a spinner component

  return <>{children}</>;
};

export default ProtectedRoute;