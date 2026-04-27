import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const WEB_ALLOWED_ROLES = ['admin', 'head_caregiver'];

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'DM Sans, system-ui, sans-serif',
                color: '#7A5C4E',
                gap: 12,
            }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p style={{ margin: 0, fontSize: '.9rem' }}>Verifying access…</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!WEB_ALLOWED_ROLES.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        const fallback = user.role === 'admin' ? '/admin' : '/head-caregiver';
        return <Navigate to={fallback} replace />;
    }

    return children;
};

export default ProtectedRoute;