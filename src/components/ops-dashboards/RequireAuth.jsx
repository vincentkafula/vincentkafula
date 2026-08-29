import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth } from '../../api/authApi';

// Any logged-in user, regardless of role. Use for pages like account settings
// that every dashboard role should be able to reach.
const RequireAuth = ({ children }) => {
    const auth = getAuth();
    if (!auth || !auth.token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default RequireAuth;
