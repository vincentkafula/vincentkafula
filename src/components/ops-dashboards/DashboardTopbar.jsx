import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, clearAuth } from '../../api/authApi';

const DashboardTopbar = () => {
    const navigate = useNavigate();
    const auth = getAuth();

    const logout = () => {
        clearAuth();
        navigate('/login');
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 15px',
            background: '#f7f7f7',
            borderBottom: '1px solid #eee',
            fontSize: '14px',
        }}>
            <span style={{ color: '#555' }}>
                Signed in as <strong>{auth?.display_name}</strong>
            </span>
            <button
                onClick={logout}
                style={{
                    background: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '6px 14px',
                    cursor: 'pointer',
                    fontSize: '13px',
                }}
            >
                Log out
            </button>
        </div>
    );
};

export default DashboardTopbar;
