import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return isAuthenticated ? children : <Navigate to="/auth/login" replace />;
};

export default PrivateRoute;