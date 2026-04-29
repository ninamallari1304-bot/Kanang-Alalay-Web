import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const WEB_ALLOWED_ROLES = ['admin', 'head_caregiver'];

const getApiBaseUrl = () => {
    const fallback = process.env.NODE_ENV === 'production'
        ? 'https://kanang-alalay-backend.onrender.com/api'
        : 'http://localhost:5000/api';
    const raw = process.env.REACT_APP_API_URL || fallback;
    const trimmed = raw.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_BASE_URL = getApiBaseUrl();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Only restore session if we're NOT on the login page
    const restoreSession = async (skipValidation = false) => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            setLoading(false);
            return false;
        }

        // Skip validation when coming from login page (optional parameter)
        if (skipValidation) {
            setLoading(false);
            return false;
        }

        let parsed;
        try {
            parsed = JSON.parse(storedUser);
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setLoading(false);
            return false;
        }

        if (!WEB_ALLOWED_ROLES.includes(parsed.role)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setLoading(false);
            return false;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/validate-token`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setLoading(false);
                return false;
            }

            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            setIsAuthenticated(true);
            setLoading(false);
            return true;
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setLoading(false);
            return false;
        }
    };

    useEffect(() => {
        // Only auto-restore if we're not explicitly told to skip
        restoreSession(false);
    }, []);

    const login = useCallback(async (username, password) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
            return {
                success: false,
                message: data.message || 'Login failed.',
                userId: data.userId || null,
                needsOtp: data.needsOtp || false,
                accountStatus: data.accountStatus || null,
                reason: data.reason || '',
            };
        }

        if (!WEB_ALLOWED_ROLES.includes(data.user?.role)) {
            return {
                success: false,
                message: 'Access restricted. This account is for mobile app use only.',
            };
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const clearSession = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const getHomeRoute = useCallback((role) => {
        switch ((role || '').toLowerCase()) {
            case 'admin':
                return '/admin';
            case 'head_caregiver':
                return '/head-caregiver';
            default:
                return '/login';
        }
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            isAuthenticated,
            login, 
            logout, 
            clearSession,
            getHomeRoute 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};