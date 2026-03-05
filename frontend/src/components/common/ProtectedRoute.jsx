import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useProfileContext } from '../../context/ProfileContext';

const ProtectedRoute = ({ children }) => {
    const { profileData, loading } = useProfileContext();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!profileData) {
        // Redirect to signin, but save the current location to redirect back after login
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
