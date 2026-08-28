import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getAuth } from '../../api/authApi';

const RequireDashboardAuth = ({ children }) => {
    const { role } = useParams();
    const auth = getAuth();

    if (!auth || !auth.token) {
        return <Navigate to="/login" replace />;
    }
    if (auth.role !== role) {
        // Logged in, but as a different role than this dashboard's URL — send them to their own.
        return <Navigate to={`/dashboard/${auth.role}`} replace />;
    }
    return children;
};

export default RequireDashboardAuth;
