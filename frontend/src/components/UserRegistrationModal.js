import React, { useState, useEffect } from 'react';
import { FaTimes, FaUserPlus, FaUserMd, FaUserTag, FaCheckCircle, FaEnvelope } from 'react-icons/fa';

const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
        ? 'https://kanang-alalay-backend.onrender.com/api'
        : 'http://localhost:5000/api');

const ROLES = [
    { value: 'admin',          label: 'Admin',         icon: <FaUserTag />,  color: '#dc3545', desc: 'Full system access — Web Dashboard' },
    { value: 'head_caregiver', label: 'Head Caregiver', icon: <FaUserMd />,   color: '#b85c2d', desc: 'Supervisor access — Web Dashboard' },
    { value: 'caregiver',      label: 'Caregiver',     icon: <FaUserPlus />, color: '#28a745', desc: 'Mobile app access only' },
];

const SHIFTS = [
    { value: 'morning',   label: 'Morning (6:00 AM – 2:00 PM)' },
    { value: 'afternoon', label: 'Afternoon (2:00 PM – 10:00 PM)' },
    { value: 'night',     label: 'Night (10:00 PM – 6:00 AM)' },
    { value: 'flexible',  label: 'Flexible Schedule' },
    { value: 'rotating',  label: 'Rotating Shift' },
];

const STEP_ROLE = 1;
const STEP_INFO = 2;
const STEP_DONE = 3;

const UserRegistrationModal = ({ isOpen, onClose, onRegister }) => {
    const [step, setStep]       = useState(STEP_ROLE);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [createdId, setCreatedId] = useState('');
    const [form, setForm] = useState({ role: 'caregiver', firstName: '', middleName: '', lastName: '', email: '', phone: '', shift: 'morning' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setStep(STEP_ROLE);
            setForm({ role: 'caregiver', firstName: '', middleName: '', lastName: '', email: '', phone: '', shift: 'morning' });
            setErrors({});
            setApiError('');
            setCreatedId('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); setApiError(''); };
    const roleObj = ROLES.find(r => r.value === form.role) || ROLES[0];

    const validate = () => {
        const e = {};
        if (!form.firstName.trim()) e.firstName = 'Required';
        if (!form.lastName.trim())  e.lastName  = 'Required';
        if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        setApiError('');
        if (!validate()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/admin/create-user-enhanced`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
                body: JSON.stringify({
                    firstName:  form.firstName.trim(),
                    middleName: form.middleName.trim(),
                    lastName:   form.lastName.trim(),
                    email:      form.email.trim().toLowerCase(),
                    phone:      form.phone.trim(),
                    role:       form.role,
                    shift:      form.shift,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Registration failed');
            setCreatedId(data.staffId || '');
            setStep(STEP_DONE);
            if (onRegister) onRegister(data);
        } catch (err) {
            setApiError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Shared styles
    const inp = (hasErr) => ({
        width: '100%', padding: '10px 14px',
        border: `1.5px solid ${hasErr ? '#dc3545' : '#E8D6CC'}`,
        borderRadius: 10, fontSize: '.9rem',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: hasErr ? '#fff8f8' : '#FFF8F3',
        color: '#1A0A00', outline: 'none', boxSizing: 'border-box',
        transition: 'border-color .2s',
    });
    const lbl = { display: 'block', marginBottom: 5, fontWeight: 600, color: '#2c3e50', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.05em' };
    const errTxt = { color: '#dc3545', fontSize: '.75rem', marginTop: 3, display: 'block' };
    const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 };
    const btnBase = { fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 600, cursor: 'pointer', borderRadius: 10, padding: '10px 20px', fontSize: '.9rem', border: '1.5px solid #E8D6CC', background: 'transparent', color: '#7A5C4E' };

    // ── Step 1: Role selection ────────────────────────────────────────────────
    const renderStepRole = () => (
        <div style={{ padding: '24px 28px' }}>
            <p style={{ color: '#7A5C4E', fontSize: '.88rem', marginBottom: 20 }}>
                Select the role for the new account. This determines what the user can access.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 22 }}>
                {ROLES.map(r => {
                    const sel = form.role === r.value;
                    return (
                        <button
                            key={r.value}
                            onClick={() => { setForm(p => ({ ...p, role: r.value })); setApiError(''); }}
                            style={{
                                padding: '18px 12px', borderRadius: 14, cursor: 'pointer', transition: 'all .2s',
                                border: `2px solid ${sel ? r.color : '#E8D6CC'}`,
                                background: sel ? `${r.color}12` : '#FFF8F3',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                boxShadow: sel ? `0 4px 14px ${r.color}30` : 'none',
                            }}
                        >
                            <span style={{ fontSize: '1.4rem', color: sel ? r.color : '#7A5C4E' }}>{r.icon}</span>
                            <strong style={{ fontSize: '.85rem', color: sel ? r.color : '#2c3e50' }}>{r.label}</strong>
                            <span style={{ fontSize: '.7rem', color: '#7A5C4E', textAlign: 'center', lineHeight: 1.4 }}>{r.desc}</span>
                            {sel && <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: r.color }} />}
                        </button>
                    );
                })}
            </div>

            {/* Role info callout */}
            <div style={{ background: `${roleObj.color}0D`, border: `1.5px solid ${roleObj.color}40`, borderRadius: 10, padding: '12px 16px', marginBottom: 22, fontSize: '.84rem', color: roleObj.color, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: '1rem' }}>{roleObj.icon}</span>
                <span>{form.role === 'admin' ? 'Admin accounts have full web dashboard access including user management and system settings.' : form.role === 'head_caregiver' ? 'Head Caregiver accounts can access the web dashboard and manage residents and medications.' : 'Caregiver accounts are for the mobile app only. They cannot log into the web dashboard.'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1.5px solid #E8D6CC' }}>
                <button onClick={onClose} style={btnBase}>Cancel</button>
                <button onClick={() => setStep(STEP_INFO)} style={{ ...btnBase, border: 'none', background: `linear-gradient(135deg,${roleObj.color},${roleObj.color}CC)`, color: '#fff', fontWeight: 700, boxShadow: `0 4px 14px ${roleObj.color}40` }}>
                    Next — Enter Details →
                </button>
            </div>
        </div>
    );

    // ── Step 2: Basic details (temporary account) ─────────────────────────────
    const renderStepInfo = () => (
        <div style={{ padding: '24px 28px' }}>
            {/* Info note */}
            <div style={{ background: '#FFF8F3', border: '1.5px solid #E8D6CC', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10 }}>
                <FaEnvelope style={{ color: '#b85c2d', marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: '.83rem', color: '#7A5C4E', lineHeight: 1.5 }}>
                    A <strong>temporary account</strong> will be created. The system will automatically generate credentials and email the new user their username, password, and OTP. They will complete their full profile upon first login.
                </div>
            </div>

            {apiError && (
                <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '.85rem', display: 'flex', gap: 8 }}>
                    ⚠️ {apiError}
                </div>
            )}

            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                    <label style={lbl}>First Name *</label>
                    <input style={inp(errors.firstName)} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="First" />
                    {errors.firstName && <span style={errTxt}>{errors.firstName}</span>}
                </div>
                <div>
                    <label style={{ ...lbl, color: '#9aada8' }}>Middle Name</label>
                    <input style={inp(false)} value={form.middleName} onChange={e => set('middleName', e.target.value)} placeholder="Optional" />
                </div>
                <div>
                    <label style={lbl}>Last Name *</label>
                    <input style={inp(errors.lastName)} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Last" />
                    {errors.lastName && <span style={errTxt}>{errors.lastName}</span>}
                </div>
            </div>

            {/* Email & Phone */}
            <div style={row2}>
                <div>
                    <label style={lbl}>Email *</label>
                    <input type="email" style={inp(errors.email)} value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
                    {errors.email && <span style={errTxt}>{errors.email}</span>}
                </div>
                <div>
                    <label style={{ ...lbl, color: '#9aada8' }}>Phone</label>
                    <input style={inp(false)} value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g,'').slice(0,11))} placeholder="09XXXXXXXXX" />
                </div>
            </div>

            {/* Shift */}
            <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Shift</label>
                <select style={{ ...inp(false), cursor: 'pointer' }} value={form.shift} onChange={e => set('shift', e.target.value)}>
                    {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingTop: 14, borderTop: '1.5px solid #E8D6CC', marginTop: 14 }}>
                <button onClick={() => { setStep(STEP_ROLE); setApiError(''); }} style={btnBase}>← Back</button>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onClose} style={btnBase}>Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} style={{ ...btnBase, border: 'none', background: loading ? '#ccc' : 'linear-gradient(135deg,#F96B38,#D94E1B)', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, boxShadow: loading ? 'none' : '0 4px 14px rgba(249,107,56,.3)' }}>
                        {loading ? 'Creating account…' : `Create ${roleObj.label} Account`}
                    </button>
                </div>
            </div>
        </div>
    );

    // ── Step 3: Done ──────────────────────────────────────────────────────────
    const renderStepDone = () => (
        <div style={{ padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ color: '#28a745', fontSize: '3.2rem', marginBottom: 14 }}><FaCheckCircle /></div>
            <h3 style={{ margin: '0 0 8px', color: '#1A0A00', fontFamily: "'Playfair Display', Georgia, serif" }}>Account Created!</h3>
            <p style={{ color: '#7A5C4E', marginBottom: 4, fontSize: '.92rem' }}>
                <strong>{form.firstName} {form.lastName}</strong> registered as{' '}
                <strong style={{ color: roleObj.color }}>{roleObj.label}</strong>.
            </p>
            {createdId && (
                <div style={{ display: 'inline-block', background: '#FFF8F3', border: `2px solid ${roleObj.color}40`, borderRadius: 10, padding: '7px 20px', margin: '12px 0 16px', fontFamily: 'monospace', fontWeight: 700, color: roleObj.color, fontSize: '1.1rem' }}>
                    {createdId}
                </div>
            )}
            <div style={{ background: '#EEFBF5', border: '1.5px solid #b7e4cc', borderRadius: 10, padding: '14px 18px', margin: '0 auto 24px', maxWidth: 380, fontSize: '.85rem', color: '#1E7D56', lineHeight: 1.6 }}>
                <FaEnvelope style={{ marginRight: 8 }} />
                Login credentials (username, temporary password &amp; OTP) have been sent to <strong>{form.email}</strong>. The user will be prompted to complete their profile on first login.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => { setStep(STEP_ROLE); setForm({ role: 'caregiver', firstName: '', middleName: '', lastName: '', email: '', phone: '', shift: 'morning' }); setCreatedId(''); }} style={btnBase}>
                    Add Another
                </button>
                <button onClick={onClose} style={{ ...btnBase, border: 'none', background: 'linear-gradient(135deg,#F96B38,#D94E1B)', color: '#fff', fontWeight: 700 }}>
                    Done
                </button>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay">
            <div className="registration-modal" style={{ maxWidth: 620 }}>
                {/* Header */}
                <div className="modal-header">
                    <h3 style={{ margin: 0, color: '#fff', fontFamily: "'Playfair Display', Georgia, serif", display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.2rem' }}>
                        <FaUserPlus /> Add New Personnel
                    </h3>
                    <button onClick={onClose} type="button" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.18)', border: '2px solid rgba(255,255,255,.28)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}>
                        <FaTimes />
                    </button>
                </div>

                {/* Step indicator */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 28px', background: '#FFF8F3', borderBottom: '1.5px solid #E8D6CC', gap: 8 }}>
                    {[{ n: 1, l: 'Role' }, { n: 2, l: 'Details' }, { n: 3, l: 'Done' }].map((s, i, arr) => (
                        <React.Fragment key={s.n}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: step >= s.n ? (step === STEP_DONE ? '#28a745' : '#F96B38') : '#E8D6CC',
                                    color: step >= s.n ? '#fff' : '#7A5C4E',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '.74rem', transition: 'all .3s',
                                }}>
                                    {step > s.n ? '✓' : s.n}
                                </div>
                                <span style={{ fontSize: '.78rem', fontWeight: step === s.n ? 700 : 400, color: step >= s.n ? '#1A0A00' : '#7A5C4E' }}>{s.l}</span>
                            </div>
                            {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: step > s.n ? '#F96B38' : '#E8D6CC', borderRadius: 2, transition: 'background .3s' }} />}
                        </React.Fragment>
                    ))}
                </div>

                {step === STEP_ROLE && renderStepRole()}
                {step === STEP_INFO && renderStepInfo()}
                {step === STEP_DONE && renderStepDone()}
            </div>
        </div>
    );
};

export default UserRegistrationModal;