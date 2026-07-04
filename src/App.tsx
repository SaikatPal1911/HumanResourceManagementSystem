import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CompanySignUpPage from './pages/CompanySignUpPage';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import SetPassword from './pages/SetPassword';
import AuthCallback from './pages/AuthCallback';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ContactPage from './pages/ContactPage';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/registration',
    element: <CompanySignUpPage />,
  },
  {
    path: '/login',
    element: <SignIn />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/set-password',
    element: <ProtectedRoute><SetPassword /></ProtectedRoute>,
  },
  {
    path: '/admin',
    element: <ProtectedRoute><AdminDashboard /></ProtectedRoute>,
  },
  {
    path: '/employee',
    element: <ProtectedRoute><EmployeeDashboard /></ProtectedRoute>,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}