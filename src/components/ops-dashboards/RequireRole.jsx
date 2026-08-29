import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth } from '../../api/authApi';

// Restricts a page to a specific set of roles (e.g. only head-office can manage accounts).
const RequireRole = ({ roles, children }) => {
    const auth = getAuth();
    if (!auth || !auth.token) {
        return <Navigate to="/login" replace />;
    }
    if (!roles.includes(auth.role)) {
        return <Navigate to={`/dashboard/${auth.role}`} replace />;
    }
    return children;
};

export default RequireRole;
