import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './ui/Spinner';

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/connexion" />;
    // Allow exact role match or superadmin override
    if (role && user.role !== role && user.role !== 'superadmin') return <Navigate to="/" />;
  return <Outlet />;
}