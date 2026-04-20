import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const VALID_ROLES = ['admin', 'nurse', 'caregiver'];

const getApiBaseUrl = () => {
    const fallback = process.env.NODE_ENV === 'production'
        ? 'https://kanang-alalay-backend.onrender.com/api'
        : 'http://localhost:5000/api';
    const raw     = process.env.REACT_APP_API_URL || fallback;
    const trimmed = raw.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_BASE_URL = getApiBaseUrl();

export const AuthProvider = ({ children }) => {
    const [user,    setUser]    = useState(null);
    const [loading, setLoading] = useState(true);

    // ── On mount: restore session AND validate token with backend ─────────────
    useEffect(() => {
        const restore = async () => {
            const token      = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (!token || !storedUser) {
                setLoading(false);
                return;
            }

            let parsed;
            try {
                parsed = JSON.parse(storedUser);
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setLoading(false);
                return;
            }

            // Reject stale/removed roles immediately
            if (!VALID_ROLES.includes(parsed.role)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setLoading(false);
                return;
            }

            // Validate token with backend
            try {
                const res  = await fetch(`${API_BASE_URL}/auth/validate-token`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                if (!res.ok || !data.success) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setLoading(false);
                    return;
                }

                // Refresh stored user with latest data from backend
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
            } catch {
                // Network error — fall back to stored user so app still works offline
                setUser(parsed);
            }

            setLoading(false);
        };

        restore();
    }, []);

    // ── Login ──────────────────────────────────────────────────────────────────
    const login = useCallback(async (username, password) => {
        const res  = await fetch(`${API_BASE_URL}/auth/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
            return {
                success: false,
                message: data.message || 'Login failed.',
                userId:  data.userId
            };
        }

        if (!VALID_ROLES.includes(data.user?.role)) {
            return {
                success: false,
                message: 'Your account role is no longer supported. Please contact the administrator.',
            };
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user',  JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
    }, []);

    // ── Logout ─────────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    // ── Role → home route ──────────────────────────────────────────────────────
    const getHomeRoute = useCallback((role) => {
        switch ((role || '').toLowerCase()) {
            case 'admin':     return '/admin';
            case 'nurse':     return '/nurse';
            case 'caregiver': return '/nurse';
            default:          return '/login';
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, getHomeRoute }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};