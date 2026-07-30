import { Navigate } from 'react-router-dom';
import useAuth from '../context/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
      const { user, loading } = useAuth();

      if (loading) {
            return (
            <div className="flex items-center justify-center h-screen">
                  <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#005bbf] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[#414754]">Loading...</p>
                  </div>
            </div>
            );
      }

      if (!user) {
            return <Navigate to="/login" />;
      }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;