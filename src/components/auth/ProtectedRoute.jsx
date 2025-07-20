import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they login.
        return <Navigate to="/login" replace />;
    }

    // If allowedRoles is provided, check if the user's role is in the list
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to a generic page (like home) if role doesn't match
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
