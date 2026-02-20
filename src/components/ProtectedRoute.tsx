import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * Checks for access_token and doctor_id in localStorage.
 * If either is missing, redirects to /login.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const location = useLocation();
    const accessToken = localStorage.getItem('access_token');
    const doctorId = localStorage.getItem('doctor_id');

    if (!accessToken || !doctorId) {
        // Clear any partial auth data
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('doctor_id');
        localStorage.removeItem('mobile_number');
        localStorage.removeItem('is_new_user');
        localStorage.removeItem('role');
        localStorage.removeItem('doctor_profile');
        localStorage.removeItem('caepy_current_user_id');

        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
