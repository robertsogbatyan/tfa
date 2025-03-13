import { Navigate, Outlet } from 'react-router-dom';
import PageLoader from '../components/PageLoader';
import AuthState from '../data-structures/enum/AuthState';
import useAuth from '../hooks/useAuth';

interface IProtectedRouteProps {
  requiredAuthState: AuthState;
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({
  requiredAuthState,
}) => {
  const { isAuthenticated, isInitiated } = useAuth();

  if (!isInitiated) return <PageLoader />;

  switch (requiredAuthState) {
    case AuthState.SIGNED_IN:
      return isAuthenticated ? <Outlet /> : <Navigate to='/login' />;

    case AuthState.NOT_SIGNED_IN:
      return !isAuthenticated ? <Outlet /> : <Navigate to='/' />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
