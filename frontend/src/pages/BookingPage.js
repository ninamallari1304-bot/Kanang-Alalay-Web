// BookingPage.js - Updated with new visiting hours (9-11 AM, 3-5 PM) and simplified UI
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/BookingPage.css';

// ── helpers ───────────────────────────────────────────────────────────────────
const uid = () => 'BK-' + Math.random().toString(36).slice(2, 9).toUpperCase();
const API_BASE = (() => {
    const raw =
        process.env.REACT_APP_API_BASE_URL ||
        process.env.REACT_APP_API_URL ||
        (process.env.NODE_ENV === 'production' ? 'https://kanang-alalay-backend.onrender.com/api' : 'http://localhost:5000/api');
    return raw.replace(/\/api\/?$/, '');
})();

// Updated time slots: 9:00 AM - 11:00 AM and 3:00 PM - 5:00 PM
const TIME_SLOTS = [
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '17:00', label: '5:00 PM' },
];

const PURPOSES = [
    { value: 'tour',      label: 'Facility Tour' },
    { value: 'volunteer', label: 'Volunteer Inquiry' },
    { value: 'donation',  label: 'Donation Delivery' },
    { value: 'meeting',   label: 'Administrative Meeting' },
];

const GUIDELINES = [
    { icon: '🕐', text: 'Visiting Hours: 9:00 AM – 11:00 AM & 3:00 PM – 5:00 PM' },
    { icon: '⏰', text: 'Please arrive 10 minutes early' },
    { icon: '👥', text: 'Maximum of 10 visitors per group' },
    { icon: '🪪', text: 'Valid ID required upon arrival' },
    { icon: '📸', text: 'No photography without permission' },
];

// ── Philippine Mobile Number Validation Helpers ──
const validatePhilippineNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10 && cleaned.startsWith('9')) {
        return { isValid: true, formatted: `+63${cleaned}`, display: cleaned };
    }
    if (cleaned.length === 11 && cleaned.startsWith('09')) {
        const number = cleaned.substring(1);
        return { isValid: true, formatted: `+63${number}`, display: cleaned };
    }
    if (cleaned.length === 12 && cleaned.startsWith('639')) {
        const number = cleaned.substring(3);
        return { isValid: true, formatted: `+63${number}`, display: `0${number}` };
    }
    return { isValid: false, formatted: '', display: phone };
};

const formatPhoneDisplay = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 4) {
        if (cleaned.startsWith('09') && cleaned.length >= 4) {
            if (cleaned.length <= 4) return cleaned;
            if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
            return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
        }
    }
    return phone;
};

// ── Main Component ────────────────────────────────────────────────────────────
const BookingPage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        visitTime: '09:00',
        purpose: 'tour',
        numberOfVisitors: 1,
        notes: '',
    });

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [receipt, setReceipt] = useState(null);

    const setFormField = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleChange = e => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '');
            if (digitsOnly.length <= 11) {
                let formattedValue = digitsOnly;
                if (digitsOnly.length >= 4 && digitsOnly.startsWith('09')) {
                    formattedValue = formatPhoneDisplay(digitsOnly);
                }
                setFormField(name, formattedValue);
                setErrors(p => ({ ...p, phone: '' }));
            }
            return;
        }
        if (name === 'numberOfVisitors') {
            const n = Math.max(1, Math.min(10, Number(value)));
            setFormField(name, n);
            return;
        }
        setFormField(name, value);
        setErrors(p => ({ ...p, [name]: '' }));
    };

    const handleDateChange = date => {
        setSelectedDate(date);
        setErrors(p => ({ ...p, visitDate: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.firstName.trim()) e.firstName = 'Required';
        if (!form.lastName.trim()) e.lastName = 'Required';
        if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
        
        if (!form.phone) {
            e.phone = 'Mobile number is required';
        } else {
            const cleaned = form.phone.replace(/\D/g, '');
            const validation = validatePhilippineNumber(cleaned);
            if (!validation.isValid) {
                e.phone = 'Enter a valid Philippine mobile number (e.g., 09123456789 or 9123456789)';
            }
        }
        
        if (!selectedDate) e.visitDate = 'Please select a date';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setApiError('');
        if (!validate()) return;

        setLoading(true);
        try {
            const fullName = [form.firstName, form.middleName, form.lastName]
                .filter(Boolean).join(' ');

            const cleanedPhone = form.phone.replace(/\D/g, '');
            let formattedPhone = cleanedPhone;
            if (cleanedPhone.length === 10 && cleanedPhone.startsWith('9')) {
                formattedPhone = `+63${cleanedPhone}`;
            } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith('09')) {
                formattedPhone = `+63${cleanedPhone.substring(1)}`;
            } else if (cleanedPhone.length === 12 && cleanedPhone.startsWith('639')) {
                formattedPhone = `+63${cleanedPhone.substring(3)}`;
            }

            const submissionData = {
                ...form,
                name: fullName,
                phone: formattedPhone,
                visitDate: selectedDate.toISOString(),
                visitTime: form.visitTime,
            };

            await axios.post(`${API_BASE}/api/bookings`, submissionData);

            setReceipt({
                refId: uid(),
                name: fullName,
                date: selectedDate.toLocaleDateString('en-PH', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                }),
                time: TIME_SLOTS.find(t => t.value === form.visitTime)?.label || form.visitTime,
                purpose: PURPOSES.find(p => p.value === form.purpose)?.label || form.purpose,
                visitors: form.numberOfVisitors,
            });
            setSubmitted(true);
        } catch (err) {
            console.error('Booking submission error:', err);
            setApiError(err.response?.data?.message || 'Booking failed. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const purposeLabel = PURPOSES.find(p => p.value === form.purpose)?.label || '—';
    const timeLabel = TIME_SLOTS.find(t => t.value === form.visitTime)?.label || '—';
    const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ') || '—';
    const hasData = form.firstName || form.email || form.phone;

    // ── Success Screen ────────────────────────────────────────────────────────
    if (submitted && receipt) return (
        <div className="bp-success">
            <div className="bp-success-card">
                <div className="bp-checkmark">✓</div>
                <h2>Booking Submitted!</h2>
                <p>
                    Your visit request has been received. We'll send a confirmation to
                    your email once it's approved.
                </p>
                <div className="bp-receipt">
                    {[
                        ['Reference', receipt.refId],
                        ['Name', receipt.name],
                        ['Date', receipt.date],
                        ['Time', receipt.time],
                        ['Purpose', receipt.purpose],
                        ['Visitors', receipt.visitors],
                    ].map(([l, v]) => (
                        <div className="bp-receipt-row" key={l}>
                            <span>{l}</span>
                            <strong>{v}</strong>
                        </div>
                    ))}
                </div>
                <div className="bp-btn-row">
                    <button
                        className="bp-btn-primary"
                        onClick={() => {
                            setSubmitted(false);
                            setForm({
                                firstName: '', lastName: '', middleName: '',
                                email: '', phone: '', notes: '', numberOfVisitors: 1,
                                visitTime: '09:00', purpose: 'tour',
                            });
                            setSelectedDate(new Date());
                        }}
                    >
                        Book Again
                    </button>
                    <button className="bp-btn-secondary" onClick={() => navigate('/')}>
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    );

    // ── Main Form ─────────────────────────────────────────────────────────────
    return (
        <div className="bp-shell">
            {/* Hero Banner - matches donation page */}
            <div className="bp-hero">
                <button className="bp-back" onClick={() => navigate('/')}>←</button>
                <div className="bp-hero-inner">
                    <div className="bp-hero-badge"><span />Visit Scheduling</div>
                    <h1>Book a Visit<br />to Our Facility</h1>
                    <p>Schedule a tour, drop off a donation, or meet with our team. We'd love to welcome you.</p>
                </div>
            </div>

            {/* Main Body - Two Column Layout */}
            <div className="bp-body">
                <div className="bp-two-col">
                    {/* Form Column */}
                    <div className="bp-form-col">
                        <div className="bp-form-container">
                            {apiError && (
                                <div className="bp-alert danger">⚠ {apiError}</div>
                            )}

                            <form onSubmit={handleSubmit} noValidate>
                                {/* Visitor Information */}
                                <div className="bp-section">
                                    <div className="bp-section-title">Visitor Information</div>
                                    
                                    <div className="bp-row">
                                        <div className="bp-group">
                                            <label>First Name<span className="req">*</span></label>
                                            <input
                                                className={`bp-input${errors.firstName ? ' err' : ''}`}
                                                name="firstName"
                                                value={form.firstName}
                                                onChange={handleChange}
                                                placeholder="First Name"
                                                disabled={loading}
                                            />
                                            {errors.firstName && <div className="bp-err-msg">{errors.firstName}</div>}
                                        </div>
                                        <div className="bp-group">
                                            <label>Last Name<span className="req">*</span></label>
                                            <input
                                                className={`bp-input${errors.lastName ? ' err' : ''}`}
                                                name="lastName"
                                                value={form.lastName}
                                                onChange={handleChange}
                                                placeholder="Last Name"
                                                disabled={loading}
                                            />
                                            {errors.lastName && <div className="bp-err-msg">{errors.lastName}</div>}
                                        </div>
                                    </div>

                                    <div className="bp-group">
                                        <label>Middle Name</label>
                                        <input
                                            className="bp-input"
                                            name="middleName"
                                            value={form.middleName}
                                            onChange={handleChange}
                                            placeholder="Middle Name (Optional)"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="bp-row">
                                        <div className="bp-group">
                                            <label>Email Address<span className="req">*</span></label>
                                            <input
                                                className={`bp-input${errors.email ? ' err' : ''}`}
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="your@email.com"
                                                disabled={loading}
                                            />
                                            {errors.email && <div className="bp-err-msg">{errors.email}</div>}
                                        </div>
                                        <div className="bp-group">
                                            <label>Phone Number<span className="req">*</span></label>
                                            <input
                                                className={`bp-input${errors.phone ? ' err' : ''}`}
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                placeholder="09123456789"
                                                maxLength={15}
                                                disabled={loading}
                                            />
                                            {errors.phone && <div className="bp-err-msg">{errors.phone}</div>}
                                            <div className="bp-hint phone-hint">✓ Format: 09XXXXXXXXX or 9XXXXXXXXX (PH mobile)</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Visit Details */}
                                <div className="bp-section">
                                    <div className="bp-section-title">Visit Details</div>
                                    
                                    <div className="bp-row">
                                        <div className="bp-group">
                                            <label>Purpose of Visit<span className="req">*</span></label>
                                            <select
                                                className="bp-select"
                                                name="purpose"
                                                value={form.purpose}
                                                onChange={handleChange}
                                                disabled={loading}
                                            >
                                                {PURPOSES.map(p => (
                                                    <option key={p.value} value={p.value}>{p.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="bp-group">
                                            <label>Number of Visitors<span className="req">*</span></label>
                                            <input
                                                className="bp-input"
                                                type="number"
                                                name="numberOfVisitors"
                                                min="1"
                                                max="10"
                                                value={form.numberOfVisitors}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                            <div className="bp-hint">Max 10 per group</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="bp-section">
                                    <div className="bp-section-title">Preferred Schedule</div>
                                    
                                    {errors.visitDate && (
                                        <div className="bp-err-msg" style={{ marginBottom: 12 }}>⚠ {errors.visitDate}</div>
                                    )}
                                    
                                    <div className="bp-calendar-section">
                                        <Calendar
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                            minDate={new Date()}
                                        />
                                        {selectedDate && (
                                            <div style={{ marginTop: 12, textAlign: 'center', fontWeight: 600, color: '#D94E1B' }}>
                                                {selectedDate.toLocaleDateString('en-PH', {
                                                    weekday: 'long', year: 'numeric',
                                                    month: 'long', day: 'numeric',
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Time Selection - Updated Hours */}
                                    <div className="bp-time-section">
                                        <label>Preferred Time<span className="req">*</span></label>
                                        <div className="bp-time-grid">
                                            {TIME_SLOTS.map(t => (
                                                <button
                                                    key={t.value}
                                                    type="button"
                                                    className={`bp-time-btn${form.visitTime === t.value ? ' active' : ''}`}
                                                    onClick={() => setFormField('visitTime', t.value)}
                                                    disabled={loading}
                                                >
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="bp-hint">Visiting Hours: 9:00 AM – 11:00 AM & 3:00 PM – 5:00 PM</div>
                                    </div>
                                </div>

                                {/* Additional Notes */}
                                <div className="bp-section">
                                    <div className="bp-group">
                                        <label>Additional Notes (Optional)</label>
                                        <textarea
                                            className="bp-textarea"
                                            name="notes"
                                            value={form.notes}
                                            onChange={handleChange}
                                            placeholder="Special requests or additional information…"
                                            disabled={loading}
                                            rows="3"
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="bp-submit" disabled={loading}>
                                    {loading
                                        ? <><div className="bp-spin" /> Processing…</>
                                        : 'Submit Booking →'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Side Column */}
                    <div className="bp-side-col">
                        {/* Booking Summary */}
                        {hasData && (
                            <div className="bp-summary-box">
                                <h6>Booking Summary</h6>
                                {[
                                    ['Visitor', fullName],
                                    ['Purpose', purposeLabel],
                                    ['Date', selectedDate
                                        ? selectedDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : '—'],
                                    ['Time', timeLabel],
                                    ['Group', `${form.numberOfVisitors} visitor${form.numberOfVisitors > 1 ? 's' : ''}`],
                                ].map(([l, v]) => (
                                    <div className="bp-summary-row" key={l}>
                                        <span>{l}</span>
                                        <span>{v}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Visit Guidelines */}
                        <div className="bp-guidelines">
                            <h5>Visit Guidelines</h5>
                            <ul className="bp-guidelines-list">
                                {GUIDELINES.map((g, i) => (
                                    <li key={i}>
                                        <div className="bp-guideline-icon">{g.icon}</div>
                                        <span>{g.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;