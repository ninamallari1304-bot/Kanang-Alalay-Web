import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaTimes, FaShieldAlt, FaEnvelope, FaRedo, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
        ? 'https://kanang-alalay-backend.onrender.com/api'
        : 'http://localhost:5000/api');

const RESEND_COOLDOWN = 60; // seconds

/**
 * OTPVerificationModal
 *
 * Props:
 *   isOpen    {boolean}  — controls visibility
 *   userId    {string}   — MongoDB _id of the user being verified
 *   onClose   {fn}       — called when user dismisses (without verifying)
 *   onVerified {fn}      — called with the server response on success
 *                          { token, needsProfileUpdate, user }
 */
const OTPVerificationModal = ({ isOpen, userId, onClose, onVerified }) => {
    const [otp, setOtp]         = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef([]);
    const timerRef  = useRef(null);

    // ── Start countdown on mount / each time modal opens ────────────────────
    const startCountdown = useCallback(() => {
        clearInterval(timerRef.current);
        setCountdown(RESEND_COOLDOWN);
        setCanResend(false);

        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setOtp(['', '', '', '', '', '']);
            setError('');
            setSuccess('');
            startCountdown();
            // Auto-focus first input after render
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
        return () => clearInterval(timerRef.current);
    }, [isOpen, startCountdown]);

    if (!isOpen) return null;

    // ── OTP input helpers ────────────────────────────────────────────────────
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;             // digits only
        const next = [...otp];
        next[index] = value.slice(-1);                // max 1 char per cell
        setOtp(next);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'Enter') handleVerify();
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const next = [...otp];
        pasted.split('').forEach((ch, i) => { next[i] = ch; });
        setOtp(next);
        // Focus the cell after the last pasted digit
        const focusIdx = Math.min(pasted.length, 5);
        inputRefs.current[focusIdx]?.focus();
    };

    // ── Verify ───────────────────────────────────────────────────────────────
    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter all 6 digits.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${API_BASE_URL}/auth/verify-first-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, otp: code }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Verification failed.');
            }

            setSuccess('Verified! Setting up your account…');
            setTimeout(() => {
                if (onVerified) onVerified(data);
            }, 800);
        } catch (err) {
            setError(err.message);
            // Clear the OTP cells on wrong code
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } finally {
            setLoading(false);
        }
    };

    // ── Resend ───────────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (!canResend || resending) return;

        setResending(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to resend OTP.');
            }

            setSuccess('A new code has been sent to your email.');
            setOtp(['', '', '', '', '', '']);
            startCountdown();
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } catch (err) {
            setError(err.message);
        } finally {
            setResending(false);
        }
    };

    // ── Styles (inline — no external CSS dependency) ─────────────────────────
    const S = {
        overlay: {
            position: 'fixed', inset: 0,
            background: 'rgba(26,10,0,.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100,
            backdropFilter: 'blur(6px)',
            animation: 'fadeIn .25s ease',
        },
        modal: {
            background: '#fff',
            borderRadius: 20,
            width: '92%',
            maxWidth: 440,
            boxShadow: '0 24px 60px rgba(0,0,0,.25)',
            overflow: 'hidden',
            animation: 'slideUp .3s ease',
        },
        header: {
            background: 'linear-gradient(135deg,#b85c2d,#7d3a06)',
            padding: '22px 26px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        },
        headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
        iconBox: {
            width: 42, height: 42, borderRadius: 10,
            background: 'rgba(255,255,255,.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1.1rem',
        },
        title: { margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 700, fontFamily: "'Playfair Display',Georgia,serif" },
        subtitle: { margin: '3px 0 0', color: 'rgba(255,255,255,.8)', fontSize: '.78rem' },
        closeBtn: {
            background: 'rgba(255,255,255,.18)', border: '2px solid rgba(255,255,255,.25)',
            color: '#fff', width: 34, height: 34, borderRadius: '50%',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.85rem', transition: 'all .2s', flexShrink: 0,
        },
        body: { padding: '28px 26px' },
        instruction: {
            display: 'flex', alignItems: 'flex-start', gap: 12,
            background: '#FFF8F3', border: '1.5px solid #FDDECA',
            borderRadius: 10, padding: '12px 14px', marginBottom: 24,
            fontSize: '.83rem', color: '#7A5C4E', lineHeight: 1.5,
        },
        otpRow: {
            display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20,
        },
        otpCell: (filled, errored) => ({
            width: 48, height: 58,
            border: `2.5px solid ${errored ? '#dc3545' : filled ? '#F96B38' : '#E8D6CC'}`,
            borderRadius: 12,
            textAlign: 'center', fontSize: '1.6rem', fontWeight: 700,
            fontFamily: 'monospace',
            color: '#1A0A00',
            background: filled ? '#FFF8F3' : '#fff',
            outline: 'none',
            transition: 'border-color .18s, box-shadow .18s',
            boxShadow: filled ? '0 0 0 3px rgba(249,107,56,.12)' : 'none',
        }),
        errorBanner: {
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#FDE8E8', borderLeft: '4px solid #dc3545',
            borderRadius: 8, padding: '10px 14px',
            color: '#c0392b', fontSize: '.83rem', marginBottom: 16,
            animation: 'shake .3s ease',
        },
        successBanner: {
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#E8F5E9', borderLeft: '4px solid #28a745',
            borderRadius: 8, padding: '10px 14px',
            color: '#1e7d56', fontSize: '.83rem', marginBottom: 16,
        },
        verifyBtn: (disabled) => ({
            width: '100%', padding: '13px', border: 'none',
            borderRadius: 10, fontWeight: 700, fontSize: '.95rem',
            background: disabled ? '#ccc' : 'linear-gradient(135deg,#F96B38,#D94E1B)',
            color: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: disabled ? 'none' : '0 4px 14px rgba(249,107,56,.32)',
            transition: 'all .2s', marginBottom: 16,
            fontFamily: "'DM Sans',system-ui,sans-serif",
        }),
        resendRow: {
            textAlign: 'center', fontSize: '.82rem', color: '#7A5C4E',
        },
        resendBtn: (enabled) => ({
            background: 'none', border: 'none',
            color: enabled ? '#F96B38' : '#ccc',
            fontWeight: 700, cursor: enabled ? 'pointer' : 'not-allowed',
            fontSize: '.82rem', padding: '2px 6px', borderRadius: 6,
            fontFamily: "'DM Sans',system-ui,sans-serif",
            display: 'inline-flex', alignItems: 'center', gap: 5,
        }),
    };

    const hasError  = Boolean(error);
    const otpFilled = otp.every(d => d !== '');

    return (
        <>
            <style>{`
                @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
                @keyframes slideUp { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
                @keyframes shake   { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
                .otp-cell:focus { border-color:#F96B38 !important; box-shadow:0 0 0 3px rgba(249,107,56,.18) !important; }
            `}</style>

            <div style={S.overlay}>
                <div style={S.modal}>

                    {/* ── Header ── */}
                    <div style={S.header}>
                        <div style={S.headerLeft}>
                            <div style={S.iconBox}><FaShieldAlt /></div>
                            <div>
                                <h3 style={S.title}>Verify Your Identity</h3>
                                <p style={S.subtitle}>First-time login verification</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={S.closeBtn}
                            disabled={loading}
                            title="Close"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* ── Body ── */}
                    <div style={S.body}>

                        {/* Instruction banner */}
                        <div style={S.instruction}>
                            <FaEnvelope style={{ color: '#F96B38', flexShrink: 0, marginTop: 2 }} />
                            <span>
                                A 6-digit verification code has been sent to your registered email address.
                                Enter it below to complete your first login.
                            </span>
                        </div>

                        {/* OTP input cells */}
                        <div style={S.otpRow} onPaste={handleOtpPaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    className="otp-cell"
                                    ref={el => inputRefs.current[i] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                    style={S.otpCell(Boolean(digit), hasError)}
                                    disabled={loading}
                                    autoComplete="one-time-code"
                                />
                            ))}
                        </div>

                        {/* Error / success messages */}
                        {error && (
                            <div style={S.errorBanner}>
                                <FaExclamationCircle style={{ flexShrink: 0 }} />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div style={S.successBanner}>
                                <FaCheckCircle style={{ flexShrink: 0 }} />
                                {success}
                            </div>
                        )}

                        {/* Verify button */}
                        <button
                            onClick={handleVerify}
                            disabled={loading || !otpFilled}
                            style={S.verifyBtn(loading || !otpFilled)}
                        >
                            {loading
                                ? '⏳ Verifying…'
                                : success
                                    ? '✓ Verified!'
                                    : 'Verify Code'
                            }
                        </button>

                        {/* Resend row */}
                        <div style={S.resendRow}>
                            Didn't receive it?{' '}
                            <button
                                onClick={handleResend}
                                disabled={!canResend || resending}
                                style={S.resendBtn(canResend && !resending)}
                            >
                                <FaRedo style={{ fontSize: '.75rem' }} />
                                {resending
                                    ? 'Sending…'
                                    : canResend
                                        ? 'Resend Code'
                                        : `Resend in ${countdown}s`
                                }
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default OTPVerificationModal;