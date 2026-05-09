import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaTimes, FaUserPlus, FaUserMd, FaUserTag, FaCheckCircle } from 'react-icons/fa';

const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
        ? 'https://kanang-alalay-backend.onrender.com/api'
        : 'http://localhost:5000/api');

const ROLES = [
    { value: 'admin', label: 'Admin', icon: <FaUserTag />, color: '#dc3545', desc: 'Full system access (Web Dashboard)' },
    { value: 'head_caregiver', label: 'Head Caregiver', icon: <FaUserMd />, color: '#b85c2d', desc: 'Supervisor access (Web Dashboard)' },
    { value: 'caregiver', label: 'Caregiver', icon: <FaUserPlus />, color: '#28a745', desc: 'Mobile app only access' },
];

const STEP_ROLE = 1;
const STEP_INFO = 2;
const STEP_DONE = 3;

const UserRegistrationModal = ({ isOpen, onClose, onRegister }) => {
    const [step, setStep] = useState(STEP_ROLE);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [createdId, setCreatedId] = useState('');
    const [form, setForm] = useState({
        role: 'caregiver',
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        shift: 'morning',
        assignedFloor: '',
        assignedRoom: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setStep(STEP_ROLE);
            setForm({
                role: 'caregiver',
                firstName: '',
                middleName: '',
                lastName: '',
                email: '',
                phone: '',
                shift: 'morning',
                assignedFloor: '',
                assignedRoom: ''
            });
            setErrors({});
            setApiError('');
            setCreatedId('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const set = (k, v) => {
        setForm(p => ({ ...p, [k]: v }));
        setErrors(p => ({ ...p, [k]: '' }));
        setApiError('');
    };

    const roleObj = ROLES.find(r => r.value === form.role) || ROLES[0];
    const idPreview = form.role ? `${form.role === 'head_caregiver' ? 'HCG' : form.role === 'caregiver' ? 'CG' : form.role.toUpperCase()}-XXXX` : '—';

    const selectRole = (role) => {
        setForm(p => ({ ...p, role }));
        setErrors({});
        setApiError('');
    };

    const getRoleMessage = (role) => {
        switch (role) {
            case 'admin':
                return 'Admin: Full access to web dashboard. Can manage all settings and users.';
            case 'head_caregiver':
                return 'Head Caregiver: Supervisory access to web dashboard. Can manage residents and medications.';
            case 'caregiver':
                return 'Caregiver: Mobile app only. Cannot access web dashboard. For daily care tasks.';
            default:
                return '';
        }
    };

    const validate = () => {
        const e = {};
        if (!form.firstName.trim()) e.firstName = 'Required';
        if (!form.lastName.trim()) e.lastName = 'Required';
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
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                },
                body: JSON.stringify({
                    firstName: form.firstName.trim(),
                    middleName: form.middleName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim().toLowerCase(),
                    phone: form.phone.trim(),
                    role: form.role,
                    shift: form.shift,
                    assignedFloor: form.assignedFloor,
                    assignedRoom: form.assignedRoom
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

    const inp = (hasErr) => ({
        width: '100%',
        padding: '10px 14px',
        border: `1.5px solid ${hasErr ? '#dc3545' : '#E8D6CC'}`,
        borderRadius: 10,
        fontSize: '.9rem',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: hasErr ? '#fff8f8' : '#FFF8F3',
        color: '#1A0A00',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color .2s',
    });
    const lbl = (optional) => ({
        display: 'block',
        marginBottom: 5,
        fontWeight: 600,
        color: optional ? '#9aada8' : '#2c3e50',
        fontSize: '.78rem',
        textTransform: 'uppercase',
        letterSpacing: '.05em',
    });
    const errTxt = { color: '#dc3545', fontSize: '.75rem', marginTop: 3, display: 'block' };
    const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 };
    const btnBase = {
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontWeight: 600,
        cursor: 'pointer',
        borderRadius: 10,
        padding: '10px 20px',
        fontSize: '.9rem',
        border: '1.5px solid #E8D6CC',
        background: 'transparent',
        color: '#7A5C4E'
    };

    const renderStepRole = () => (
        <div style={{ padding: '24px 28px' }}>
            <p style={{ color: '#7A5C4E', fontSize: '.88rem', marginBottom: 20 }}>
                Select the role for the new user.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 22 }}>
                {ROLES.map(r => {
                    const sel = form.role === r.value;
                    return (
                        <div
                            key={r.value}
                            onClick={() => selectRole(r.value)}
                            style={{
                                padding: '16px 14px',
                                borderRadius: 14,
                                cursor: 'pointer',
                                border: `2px solid ${sel ? r.color : '#E8D6CC'}`,
                                background: sel ? `${r.color}12` : '#FFF8F3',
                                transition: 'all .18s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 5,
                            }}
                        >
                            <div style={{ color: r.color, fontSize: '1.3rem' }}>{r.icon}</div>
                            <strong style={{ color: '#1A0A00', fontSize: '.95rem' }}>{r.label}</strong>
                            <small style={{ color: '#7A5C4E', fontSize: '.76rem' }}>{r.desc}</small>
                            <small style={{ color: r.color, fontSize: '.72rem', fontWeight: 700, fontFamily: 'monospace', marginTop: 2 }}>
                                ID: {r.value === 'head_caregiver' ? 'HCG' : r.value === 'caregiver' ? 'CG' : r.value.toUpperCase()}-XXXX
                            </small>
                            {sel && (
                                <small style={{ color: r.color, fontSize: '.7rem', marginTop: 4, fontStyle: 'italic' }}>
                                    {getRoleMessage(r.value)}
                                </small>
                            )}
                        </div>
                    );
                })}
            </div>
            {!form.role && <p style={{ color: '#dc3545', fontSize: '.82rem', marginBottom: 10 }}>Please select a role to continue.</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: '1.5px solid #E8D6CC' }}>
                <button onClick={onClose} style={btnBase}>Cancel</button>
                <button
                    onClick={() => form.role && setStep(STEP_INFO)}
                    disabled={!form.role}
                    style={{
                        ...btnBase,
                        border: 'none',
                        background: form.role ? 'linear-gradient(135deg,#F96B38,#D94E1B)' : '#ddd',
                        color: form.role ? '#fff' : '#aaa',
                        cursor: form.role ? 'pointer' : 'not-allowed',
                        fontWeight: 700,
                        boxShadow: form.role ? '0 3px 12px rgba(249,107,56,.3)' : 'none'
                    }}
                >
                    Next: Enter Details →
                </button>
            </div>
        </div>
    );

    const renderStepInfo = () => (
        <div style={{ padding: '22px 28px' }}>
            {apiError && (
                <div style={{ background: '#f8d7da', color: '#721c24', padding: '11px 15px', borderRadius: 9, marginBottom: 14, borderLeft: '4px solid #dc3545', fontSize: '.86rem' }}>
                    {apiError}
                </div>
            )}

            <div style={{ background: form.role === 'caregiver' ? '#E8F5E9' : form.role === 'head_caregiver' ? '#FFF8E1' : '#FFEBEE', border: `1.5px solid ${roleObj.color}`, borderRadius: 10, padding: '9px 16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', color: roleObj.color, fontWeight: 700, fontSize: '1rem' }}>{idPreview}</span>
                    <small style={{ color: '#7A5C4E', fontSize: '.76rem' }}>Staff ID will be auto-generated on save</small>
                </div>
                <small style={{ color: roleObj.color, fontSize: '.72rem', display: 'block', marginTop: 6 }}>
                    {getRoleMessage(form.role)}
                </small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                    <label style={lbl(false)}>First Name *</label>
                    <input style={inp(errors.firstName)} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="First" />
                    {errors.firstName && <span style={errTxt}>{errors.firstName}</span>}
                </div>
                <div>
                    <label style={lbl(true)}>Middle Name</label>
                    <input style={inp(false)} value={form.middleName} onChange={e => set('middleName', e.target.value)} placeholder="Optional" />
                </div>
                <div>
                    <label style={lbl(false)}>Last Name *</label>
                    <input style={inp(errors.lastName)} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Last" />
                    {errors.lastName && <span style={errTxt}>{errors.lastName}</span>}
                </div>
            </div>

            <div style={row2}>
                <div>
                    <label style={lbl(false)}>Email *</label>
                    <input type="email" style={inp(errors.email)} value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
                    {errors.email && <span style={errTxt}>{errors.email}</span>}
                </div>
                <div>
                    <label style={lbl(true)}>Phone</label>
                    <input style={inp(false)} value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="09XXXXXXXXX" />
                </div>
            </div>

            <div style={row2}>
                <div>
                    <label style={lbl(false)}>Shift</label>
                    <select
                        style={{ ...inp(false), cursor: 'pointer' }}
                        value={form.shift}
                        onChange={e => set('shift', e.target.value)}
                    >
                        <option value="morning">Morning Shift (6:00 AM - 2:00 PM)</option>
                        <option value="afternoon">Afternoon Shift (2:00 PM - 10:00 PM)</option>
                        <option value="night">Night Shift (10:00 PM - 6:00 AM)</option>
                        <option value="flexible">Flexible Schedule</option>
                        <option value="rotating">Rotating Shift</option>
                    </select>
                </div>
                <div>
                    <label style={lbl(true)}>Assigned Floor</label>
                    <input style={inp(false)} value={form.assignedFloor} onChange={e => set('assignedFloor', e.target.value)} placeholder="e.g., 2nd Floor" />
                </div>
            </div>

            <div style={{ marginBottom: 14 }}>
                <label style={lbl(true)}>Assigned Room</label>
                <input style={inp(false)} value={form.assignedRoom} onChange={e => set('assignedRoom', e.target.value)} placeholder="e.g., Room 204, Ward A" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingTop: 14, borderTop: '1.5px solid #E8D6CC', marginTop: 14 }}>
                <button onClick={() => { setStep(STEP_ROLE); setApiError(''); }} style={btnBase}>← Back</button>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onClose} style={btnBase}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            ...btnBase,
                            border: 'none',
                            background: loading ? '#ccc' : 'linear-gradient(135deg,#F96B38,#D94E1B)',
                            color: '#fff',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 700,
                            boxShadow: loading ? 'none' : '0 4px 14px rgba(249,107,56,.3)'
                        }}
                    >
                        {loading ? 'Creating…' : `Create ${roleObj.label}`}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStepDone = () => (
        <div style={{ padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ color: '#28a745', fontSize: '3.2rem', marginBottom: 14 }}><FaCheckCircle /></div>
            <h3 style={{ margin: '0 0 8px', color: '#1A0A00', fontFamily: "'Playfair Display', Georgia, serif" }}>Account Created!</h3>
            <p style={{ color: '#7A5C4E', marginBottom: 4, fontSize: '.92rem' }}>
                <strong>{form.firstName} {form.lastName}</strong> registered as <strong style={{ color: roleObj.color }}>{roleObj.label}</strong>.
            </p>
            {createdId && (
                <div style={{ display: 'inline-block', background: '#FFF8F3', border: `2px solid ${roleObj.color}40`, borderRadius: 10, padding: '7px 20px', margin: '12px 0 16px', fontFamily: 'monospace', fontWeight: 700, color: roleObj.color, fontSize: '1.1rem' }}>
                    {createdId}
                </div>
            )}
            <p style={{ color: '#7A5C4E', fontSize: '.82rem', marginBottom: 24 }}>
                {form.role === 'caregiver' && (
                    <span style={{ display: 'block', marginTop: 8, color: '#28a745', fontWeight: 600 }}>
                        Caregiver accounts are for mobile app use only. They cannot access the web dashboard.
                    </span>
                )}
                {(form.role === 'admin' || form.role === 'head_caregiver') && (
                    <span style={{ display: 'block', marginTop: 8, color: '#b85c2d', fontWeight: 600 }}>
                        Credentials have been sent to {form.email}
                    </span>
                )}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                    onClick={() => {
                        setStep(STEP_ROLE);
                        setForm({
                            role: 'caregiver',
                            firstName: '',
                            middleName: '',
                            lastName: '',
                            email: '',
                            phone: '',
                            shift: 'morning',
                            assignedFloor: '',
                            assignedRoom: ''
                        });
                        setCreatedId('');
                    }}
                    style={btnBase}
                >
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
            <div className="registration-modal" style={{ maxWidth: 660 }}>
                <div className="modal-header">
                    <h3 style={{ margin: 0, color: '#fff', fontFamily: "'Playfair Display', Georgia, serif", display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.2rem' }}>
                        <FaUserPlus /> Add New User
                    </h3>
                    <button
                        onClick={onClose}
                        type="button"
                        style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'rgba(255,255,255,.18)',
                            border: '2px solid rgba(255,255,255,.28)',
                            color: '#fff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.95rem', transition: 'all .2s', flexShrink: 0,
                            lineHeight: 1, padding: 0,
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 28px', background: '#FFF8F3', borderBottom: '1.5px solid #E8D6CC', gap: 8 }}>
                    {[{ n: 1, l: 'Role' }, { n: 2, l: 'Details' }, { n: 3, l: 'Done' }].map((s, i, arr) => (
                        <React.Fragment key={s.n}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: step >= s.n ? (step === STEP_DONE ? '#28a745' : '#F96B38') : '#E8D6CC',
                                    color: step >= s.n ? '#fff' : '#7A5C4E',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '.74rem', transition: 'all .3s'
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