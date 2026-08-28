import React from 'react';

const STATUS_META = {
    submitted: { label: 'Pending OM Review', color: '#b26a00', bg: '#fff3e0' },
    om_approved: { label: 'Pending Office Approval', color: '#0277bd', bg: '#e1f5fe' },
    om_rejected: { label: 'Rejected (Operation Management)', color: '#c62828', bg: '#ffebee' },
    office_approved: { label: 'Pending Manager Approval', color: '#6a1b9a', bg: '#f3e5f5' },
    office_rejected: { label: 'Rejected (Operation Office)', color: '#c62828', bg: '#ffebee' },
    manager_approved: { label: 'Approved', color: '#2e7d32', bg: '#e8f5e9' },
    manager_rejected: { label: 'Rejected (Manager)', color: '#c62828', bg: '#ffebee' },
};

const StatusBadge = ({ status }) => {
    const meta = STATUS_META[status] || { label: status, color: '#555', bg: '#eee' };
    return (
        <span
            style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                color: meta.color,
                background: meta.bg,
                whiteSpace: 'nowrap',
            }}
        >
            {meta.label}
        </span>
    );
};

export default StatusBadge;
