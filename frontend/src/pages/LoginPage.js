import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner, FaEnvelope, FaKey, FaCheckCircle, FaTimes, FaArrowLeft, FaExclamationTriangle, FaBan, FaClock, FaTimesCircle } from 'react-icons/fa';
import '../styles/LoginPage.css';

const getApiBaseUrl = () => {
    const fallback = process.env.NODE_ENV === 'production'
        ? 'https://kanang-alalay-backend.onrender.com/api'
        : 'http://localhost:5000/api';
    const raw = process.env.REACT_APP_API_URL || fallback;
    const trimmed = raw.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// ── Blocked Account Panel config ──────────────────────────────────────────────
// Each accountStatus that blocks login gets its own icon, color, and contact hint.
const BLOCKED_STATUS_CONFIG = {
    restricted: {
        icon: <FaBan size={36} />,
        color: '#E65100',
        bgColor: '#FFF3E0',
        borderColor: '#FFCC80',
        title: 'Access Restricted',
        contactHint: 'Contact your administrator to resolve this restriction.',
    },
    suspended: {
        icon: <FaExclamationTriangle size={36} />,
        color: '#856404',
        bgColor: '#FFF8E1',
        borderColor: '#FFE082',
        title: 'Account Suspended',
        contactHint: 'Please contact your supervisor or HR department.',
    },
    on_leave: {
        icon: <FaClock size={36} />,
        color: '#1565C0',
        bgColor: '#E3F2FD',
        borderColor: '#90CAF9',
        title: 'On Leave of Absence',
        contactHint: 'Your access will be restored when your leave period ends.',
    },
    terminated: {
        icon: <FaTimesCircle size={36} />,
        color: '#C0392B',
        bgColor: '#FEEBEE',
        borderColor: '#EF9A9A',
        title: 'Employment Terminated',
        contactHint: 'If you believe this is an error, contact the HR department.',
    },
    deactivated: {
        icon: <FaTimesCircle size={36} />,
        color: '#4A4A4A',
        bgColor: '#F5F5F5',
        borderColor: '#BDBDBD',
        title: 'Account Deactivated',
        contactHint: 'Contact the administrator if you believe this is an error.',
    },
};

// ── Forgot Password Modal ─────────────────────────────────────────────────────
const ForgotPasswordModal = ({ onClose }) => {
    const [step, setStep]               = useState('email');
    const [email, setEmail]             = useState('');
    const [otp, setOtp]                 = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showNew, setShowNew]         = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [msg, setMsg]                 = useState({ text: '', type: '' });
    const [loading, setLoading]         = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const t = setInterval(() => setResendTimer(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [resendTimer]);

    const setInfo  = (text) => setMsg({ text, type: 'info' });
    const setError = (text) => setMsg({ text, type: 'error' });
    const setOk    = (text) => setMsg({ text, type: 'success' });

    // Step 1 – request OTP
    const handleRequestOtp = async () => {
        if (!email.trim()) { setError('Please enter your email address.'); return; }
        setLoading(true);
        setMsg({ text: '', type: '' });
        try {
            const res  = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email: email.trim() })
            });
            const data = await res.json();
            if (data.success) {
                setOk('OTP sent! Check your email inbox.');
                setStep('otp');
                setResendTimer(60);
            } else {
                setError(data.message || 'Failed to send OTP.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2 – verify OTP
    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) { setError('Enter the full 6-digit OTP.'); return; }
        setLoading(true);
        setMsg({ text: '', type: '' });
        try {
            const res  = await fetch(`${API_BASE_URL}/auth/verify-reset-otp`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email: email.trim(), otp })
            });
            const data = await res.json();
            if (data.success) {
                setOk('OTP verified! Set your new password.');
                setStep('newpass');
            } else {
                setError(data.message || 'Invalid or expired OTP.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2 – resend OTP
    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setInfo('Sending new OTP…');
        try {
            const res  = await fetch(`${API_BASE_URL}/auth/resend-reset-otp`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email: email.trim() })
            });
            const data = await res.json();
            if (data.success) { setOk('New OTP sent!'); setResendTimer(60); }
            else setError(data.message || 'Failed to resend OTP.');
        } catch {
            setError('Network error.');
        }
    };

    // Step 3 – reset password
    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (newPassword !== confirmPass) { setError('Passwords do not match.'); return; }
        setLoading(true);
        setMsg({ text: '', type: '' });
        try {
            const res  = await fetch(`${API_BASE_URL}/auth/reset-password-with-otp`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email: email.trim(), otp, password: newPassword })
            });
            const data = await res.json();
            if (data.success) { setStep('done'); }
            else { setError(data.message || 'Failed to reset password.'); }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fp-overlay">
            <div className="fp-modal">
                <div className="fp-header">
                    <h3 className="fp-title">
                        {step === 'email' ? 'Forgot Password'
                            : step === 'otp' ? 'Enter OTP'
                            : step === 'newpass' ? 'New Password'
                            : 'Password Reset'}
                    </h3>
                    <button className="fp-close" onClick={onClose}><FaTimes /></button>
                </div>

                {step === 'email' && (
                    <div className="fp-body">
                        <p className="fp-desc">Enter your registered email address and we'll send you an OTP.</p>
                        <div className="fp-field">
                            <label>Email Address</label>
                            <div className="fp-input-wrap">
                                <FaEnvelope className="fp-icon" />
                                <input
                                    type="email"
                                    className="fp-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleRequestOtp()}
                                />
                            </div>
                        </div>
                        {msg.text && <p className={`fp-msg ${msg.type}`}>{msg.text}</p>}
                        <button className="fp-btn" onClick={handleRequestOtp} disabled={loading}>
                            {loading ? <FaSpinner className="spin" /> : 'Send OTP'}
                        </button>
                    </div>
                )}

                {step === 'otp' && (
                    <div className="fp-body">
                        <p className="fp-desc">We sent a 6-digit OTP to <strong>{email}</strong>. It expires in 15 minutes.</p>
                        <div className="fp-field">
                            <label>OTP Code</label>
                            <div className="fp-input-wrap">
                                <FaKey className="fp-icon" />
                                <input
                                    type="text"
                                    className="fp-input"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                                />
                            </div>
                        </div>
                        {msg.text && <p className={`fp-msg ${msg.type}`}>{msg.text}</p>}
                        <button className="fp-btn" onClick={handleVerifyOtp} disabled={loading}>
                            {loading ? <FaSpinner className="spin" /> : 'Verify OTP'}
                        </button>
                        <button
                            className="fp-resend"
                            onClick={handleResendOtp}
                            disabled={resendTimer > 0}
                        >
                            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                        </button>
                    </div>
                )}

                {step === 'newpass' && (
                    <div className="fp-body">
                        <p className="fp-desc">Choose a strong password for your account.</p>
                        <div className="fp-field">
                            <label>New Password</label>
                            <div className="fp-input-wrap">
                                <FaLock className="fp-icon" />
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    className="fp-input"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                                />
                                <button type="button" className="fp-eye" onClick={() => setShowNew(p => !p)}>
                                    {showNew ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                        <div className="fp-field">
                            <label>Confirm Password</label>
                            <div className="fp-input-wrap">
                                <FaLock className="fp-icon" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    className="fp-input"
                                    placeholder="Repeat your new password"
                                    value={confirmPass}
                                    onChange={e => setConfirmPass(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                                />
                                <button type="button" className="fp-eye" onClick={() => setShowConfirm(p => !p)}>
                                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {newPassword && (
                            <div className="fp-strength-wrap">
                                <div className="fp-strength-bar">
                                    <div className={`fp-strength-fill s${Math.min(Math.floor(newPassword.length / 3), 4)}`} />
                                </div>
                                <span className="fp-strength-label">
                                    {newPassword.length < 3 ? 'Too short' : newPassword.length < 6 ? 'Weak' : newPassword.length < 9 ? 'Fair' : newPassword.length < 12 ? 'Good' : 'Strong'}
                                </span>
                            </div>
                        )}

                        {msg.text && <p className={`fp-msg ${msg.type}`}>{msg.text}</p>}
                        <button className="fp-btn" onClick={handleResetPassword} disabled={loading}>
                            {loading ? <FaSpinner className="spin" /> : 'Reset Password'}
                        </button>
                    </div>
                )}

                {step === 'done' && (
                    <div className="fp-body fp-done">
                        <div className="fp-success-icon">
                            <FaCheckCircle />
                        </div>
                        <p className="fp-done-text">You can now sign in with your new password.</p>
                        <button className="fp-btn" onClick={onClose}>
                            Back to Sign In
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Main Login Page ────────────────────────────────────────────────────────────
const LoginPage = () => {
    const { login, user, getHomeRoute } = useAuth();
    const navigate = useNavigate();

    const [form, setForm]             = useState({ username: '', password: '' });
    const [showPass, setShowPass]     = useState(false);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState('');
    const [showForgot, setShowForgot] = useState(false);

    // OTP activation state (pending accounts)
    const [needsOtp, setNeedsOtp]           = useState(false);
    const [pendingUserId, setPendingUserId] = useState(null);
    const [otpCode, setOtpCode]             = useState('');
    const [otpMsg, setOtpMsg]               = useState('');
    const [otpLoading, setOtpLoading]       = useState(false);
    const [resendTimer, setResendTimer]     = useState(0);

    // Blocked account state (restricted / suspended / on_leave / terminated / deactivated)
    const [blockedStatus, setBlockedStatus] = useState(null);   // accountStatus string
    const [blockedMessage, setBlockedMessage] = useState('');   // server message

    useEffect(() => {
        if (user) navigate(getHomeRoute(user.role), { replace: true });
    }, [user, navigate, getHomeRoute]);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const t = setInterval(() => setResendTimer(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [resendTimer]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username.trim() || !form.password.trim()) {
            setError('Please enter your username/email and password.');
            return;
        }
        setLoading(true);
        setError('');
        const result = await login(form.username.trim(), form.password);
        setLoading(false);

        if (result.success) {
            navigate(getHomeRoute(result.user.role), { replace: true });
            return;
        }

        // Pending account → OTP activation panel (existing behaviour)
        if (result.userId && result.accountStatus === 'pending') {
            setPendingUserId(result.userId);
            setNeedsOtp(true);
            setOtpMsg('Your account needs to be activated. Enter the OTP sent to your email, or request a new one.');
            setResendTimer(30);
            return;
        }

        // Blocked account statuses → dedicated blocked panel
        const blockedStatuses = ['restricted', 'suspended', 'on_leave', 'terminated', 'deactivated'];
        if (result.accountStatus && blockedStatuses.includes(result.accountStatus)) {
            setBlockedStatus(result.accountStatus);
            setBlockedMessage(result.message || 'Your account is not accessible.');
            return;
        }

        // Generic error (wrong credentials, role mismatch, etc.)
        setError(result.message || 'Invalid credentials.');
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length < 6) { setOtpMsg('Please enter the full 6-digit OTP.'); return; }
        setOtpLoading(true);
        try {
            const res  = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ userId: pendingUserId, otp: otpCode })
            });
            const data = await res.json();
            if (data.success) {
                setOtpMsg('Account activated! Logging you in…');
                setTimeout(async () => {
                    const result = await login(form.username.trim(), form.password);
                    if (result.success) navigate(getHomeRoute(result.user.role), { replace: true });
                }, 1200);
            } else {
                setOtpMsg(data.message || 'Invalid or expired OTP.');
            }
        } catch {
            setOtpMsg('Network error. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setOtpMsg('Sending new OTP…');
        try {
            const res  = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ userId: pendingUserId })
            });
            const data = await res.json();
            setOtpMsg(data.message || 'OTP resent.');
            setResendTimer(30);
        } catch {
            setOtpMsg('Failed to resend OTP.');
        }
    };

    // ── Blocked Account Panel ─────────────────────────────────────────────────
    if (blockedStatus && BLOCKED_STATUS_CONFIG[blockedStatus]) {
        const cfg = BLOCKED_STATUS_CONFIG[blockedStatus];
        return (
            <div className="login-page">
                <button className="back-to-home" onClick={() => navigate('/')}>
                    <FaArrowLeft /> Back to Home
                </button>
                <div className="login-card">
                    <div className="login-logo"><div className="logo-mark"></div></div>

                    {/* Status icon */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: 16,
                    }}>
                        <div style={{
                            width: 72,
                            height: 72,
                            borderRadius: '50%',
                            background: cfg.bgColor,
                            border: `2px solid ${cfg.borderColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: cfg.color,
                        }}>
                            {cfg.icon}
                        </div>
                    </div>

                    <h2 className="login-title" style={{ color: cfg.color }}>{cfg.title}</h2>

                    {/* Server message */}
                    <div style={{
                        background: cfg.bgColor,
                        border: `1.5px solid ${cfg.borderColor}`,
                        borderRadius: 10,
                        padding: '14px 16px',
                        marginBottom: 16,
                        textAlign: 'center',
                    }}>
                        <p style={{ margin: 0, color: cfg.color, fontSize: '.92rem', fontWeight: 600 }}>
                            {blockedMessage}
                        </p>
                    </div>

                    {/* Contact hint */}
                    <p className="login-sub" style={{ fontSize: '.85rem', marginBottom: 24 }}>
                        {cfg.contactHint}
                    </p>

                    <button
                        className="login-btn"
                        style={{ background: cfg.color }}
                        onClick={() => { setBlockedStatus(null); setBlockedMessage(''); setError(''); }}
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // ── OTP Activation panel ──────────────────────────────────────────────────
    if (needsOtp) {
        return (
            <div className="login-page">
                <button className="back-to-home" onClick={() => navigate('/')}>
                    <FaArrowLeft /> Back to Home
                </button>
                <div className="login-card">
                    <div className="login-logo"><div className="logo-mark"></div></div>
                    <h2 className="login-title">Activate Your Account</h2>
                    <p className="login-sub">Enter the 6-digit OTP sent to your email to activate your account.</p>
                    <div className="otp-input-row">
                        <input
                            type="text"
                            className="login-input otp-big-input"
                            placeholder="Enter 6-digit OTP"
                            value={otpCode}
                            onChange={e => setOtpCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                            maxLength={6}
                        />
                    </div>
                    {otpMsg && (
                        <p className={`otp-feedback ${otpMsg.startsWith('✅') ? 'success' : 'info'}`}>{otpMsg}</p>
                    )}
                    <button className="login-btn" onClick={handleVerifyOtp} disabled={otpLoading}>
                        {otpLoading ? <FaSpinner className="spin" /> : 'Activate Account'}
                    </button>
                    <div className="otp-resend-row">
                        <button className="resend-link" onClick={handleResendOtp} disabled={resendTimer > 0}>
                            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                        </button>
                        <button className="back-link" onClick={() => setNeedsOtp(false)}>← Back to Login</button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main Login Form ───────────────────────────────────────────────────────
    return (
        <>
            <div className="login-page">
                <button className="back-to-home" onClick={() => navigate('/')}>
                    <FaArrowLeft /> Back to Home
                </button>
                <div className="login-card">
                    <div className="login-logo"><div className="logo-mark"></div></div>
                    <h2 className="login-title">Kanang-Alalay</h2>
                    <p className="login-sub">Sign in to your account</p>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="login-field">
                            <label htmlFor="username">Username or Email</label>
                            <div className="login-input-wrap">
                                <FaUser className="login-icon" />
                                <input
                                    id="username" name="username" type="text"
                                    className="login-input"
                                    placeholder="Enter username or email"
                                    value={form.username}
                                    onChange={handleChange}
                                    autoComplete="username"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="login-field">
                            <label htmlFor="password">Password</label>
                            <div className="login-input-wrap">
                                <FaLock className="login-icon" />
                                <input
                                    id="password" name="password"
                                    type={showPass ? 'text' : 'password'}
                                    className="login-input"
                                    placeholder="Enter password"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                />
                                <button type="button" className="pass-toggle" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                                    {showPass ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {error && <div className="login-error">{error}</div>}

                        <div className="forgot-row">
                            <button
                                type="button"
                                className="forgot-link"
                                onClick={() => setShowForgot(true)}
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? <><FaSpinner className="spin" /> Signing in…</> : 'Sign In'}
                        </button>
                    </form>

                    <p className="login-footer-note">
                        Need access? Contact your administrator to receive a registration code.
                    </p>
                </div>
            </div>

            {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
        </>
    );
};

export default LoginPage;