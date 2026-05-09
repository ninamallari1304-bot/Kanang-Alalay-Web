import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaShieldAlt } from 'react-icons/fa';

const getApiBaseUrl = () => {
    const fallback = process.env.NODE_ENV === 'production'
        ? 'https://kanang-alalay-backend.onrender.com/api'
        : 'http://localhost:5000/api';
    const raw = process.env.REACT_APP_API_URL || fallback;
    const trimmed = raw.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};
const API_BASE_URL = getApiBaseUrl();

const OTPVerificationModal = ({ isOpen, userId, onClose, onVerified }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMsg, setResendMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            setOtp('');
            setError('');
            setResendTimer(60);
            setResendMsg('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || resendTimer <= 0) return;
        const t = setInterval(() => setResendTimer(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [isOpen, resendTimer]);

    if (!isOpen) return null;

    const handleVerify = async () => {
        if (otp.length < 6) {
            setError('Please enter the full 6-digit OTP.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/auth/verify-first-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, otp }),
            });
            const data = await res.json();
            if (data.success) {
                onVerified(data);
            } else {
                setError(data.message || 'Invalid or expired OTP.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0 || resendLoading) return;
        setResendLoading(true);
        setResendMsg('');
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (data.success) {
                setResendMsg('New OTP sent to your email.');
                setResendTimer(60);
            } else {
                setResendMsg(data.message || 'Failed to resend. Try again.');
            }
        } catch {
            setResendMsg('Network error. Failed to resend.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleVerify();
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 9000 }}>
            <div className="registration-modal" style={{ maxWidth: 420 }}>
                <div className="modal-header">
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FaShieldAlt /> Verify Your Identity
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'rgba(255,255,255,.18)',
                            border: '2px solid rgba(255,255,255,.28)',
                            color: '#fff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '.95rem',
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div style={{ padding: '28px 32px', textAlign: 'center' }}>
                    <p style={{ color: '#7A5C4E', marginBottom: 24, fontSize: '.9rem', lineHeight: 1.6 }}>
                        A 6-digit verification code has been sent to your email.<br />
                        Enter it below to complete your first login.
                    </p>

                    <input
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={e => {
                            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                            setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder=""
                        maxLength={6}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '14px',
                            textAlign: 'center',
                            fontSize: '1.8rem',
                            fontFamily: 'monospace',
                            letterSpacing: '0.5em',
                            border: `2px solid ${error ? '#dc3545' : '#E8D6CC'}`,
                            borderRadius: 12,
                            background: error ? '#fff8f8' : '#FFF8F3',
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'border-color .2s',
                        }}
                    />

                    {error && (
                        <p style={{ color: '#dc3545', fontSize: '.84rem', marginTop: 10, marginBottom: 0 }}>
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleVerify}
                        disabled={loading || otp.length < 6}
                        style={{
                            width: '100%',
                            marginTop: 20,
                            padding: '13px',
                            border: 'none',
                            borderRadius: 10,
                            background: loading || otp.length < 6
                                ? '#ccc'
                                : 'linear-gradient(135deg,#F96B38,#D94E1B)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '1rem',
                            fontFamily: "'DM Sans', sans-serif",
                            cursor: loading || otp.length < 6 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            transition: 'all .2s',
                        }}
                    >
                        {loading
                            ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
                            : 'Verify & Continue'}
                    </button>

                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E8D6CC' }}>
                        <button
                            onClick={handleResend}
                            disabled={resendTimer > 0 || resendLoading}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: resendTimer > 0 || resendLoading ? '#aaa' : '#b85c2d',
                                cursor: resendTimer > 0 || resendLoading ? 'default' : 'pointer',
                                fontWeight: 600,
                                fontSize: '.86rem',
                                fontFamily: "'DM Sans', sans-serif",
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                margin: '0 auto',
                            }}
                        >
                            {resendLoading
                                ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
                                : resendTimer > 0
                                    ? `Resend OTP in ${resendTimer}s`
                                    : 'Resend OTP'}
                        </button>

                        {resendMsg && (
                            <p style={{
                                fontSize: '.78rem',
                                color: resendMsg.includes('sent') ? '#1E7D56' : '#dc3545',
                                marginTop: 8,
                                marginBottom: 0,
                            }}>
                                {resendMsg}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPVerificationModal;