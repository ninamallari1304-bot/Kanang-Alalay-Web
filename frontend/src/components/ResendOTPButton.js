import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaRedo } from 'react-icons/fa';

const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
        ? 'https://kanang-alalay-backend.onrender.com/api'
        : 'http://localhost:5000/api');

const COOLDOWN = 60;

/**
 * ResendOTPButton
 *
 * A self-contained, reusable resend button with built-in 60-second cooldown.
 *
 * Props:
 *   userId      {string}   — the user whose OTP should be resent
 *   onSuccess   {fn}       — called (message) when resend succeeds
 *   onError     {fn}       — called (message) when resend fails
 *   startActive {boolean}  — if false (default), starts in cooldown; if true starts ready
 *   style       {object}   — optional extra styles for the button wrapper
 */
const ResendOTPButton = ({
    userId,
    onSuccess,
    onError,
    startActive = false,
    style = {}
}) => {
    const [countdown, setCountdown] = useState(startActive ? 0 : COOLDOWN);
    const [loading,   setLoading]   = useState(false);
    const timerRef = useRef(null);

    const canResend = countdown === 0 && !loading;

    const startCooldown = useCallback(() => {
        clearInterval(timerRef.current);
        setCountdown(COOLDOWN);
        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(timerRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // Kick off initial countdown if not starting active
    useEffect(() => {
        if (!startActive) startCooldown();
        return () => clearInterval(timerRef.current);
    }, [startActive, startCooldown]);

    const handleClick = async () => {
        if (!canResend) return;
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to resend code.');
            }

            startCooldown();
            if (onSuccess) onSuccess(data.message || 'New code sent to your email.');
        } catch (err) {
            if (onError) onError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={!canResend}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                fontFamily: "'DM Sans',system-ui,sans-serif",
                fontWeight: 700,
                fontSize: '.82rem',
                color: canResend ? '#F96B38' : '#aaa',
                cursor: canResend ? 'pointer' : 'not-allowed',
                padding: '2px 6px',
                borderRadius: 6,
                transition: 'color .18s',
                ...style,
            }}
        >
            <FaRedo style={{ fontSize: '.75rem' }} />
            {loading
                ? 'Sending…'
                : canResend
                    ? 'Resend Code'
                    : `Resend in ${countdown}s`
            }
        </button>
    );
};

export default ResendOTPButton;