// BookingPage.js
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/BookingPage.css';
import { API_URL } from '../config/api';

// ── helpers ───────────────────────────────────────────────────────────────────
const uid = () => 'BK-' + Math.random().toString(36).slice(2, 9).toUpperCase();

const TIME_SLOTS = [
    { value: '09:00', label: '9:00 AM - 11:00 AM' },
    { value: '15:00', label: '3:00 PM - 5:00 PM' },
];

const PURPOSES = [
    { value: 'tour',      label: 'Facility Tour' },
    { value: 'volunteer', label: 'Volunteer Inquiry' },
    { value: 'donation',  label: 'Donation Delivery' },
    { value: 'meeting',   label: 'Administrative Meeting' },
];

const GUIDELINES = [
    { text: 'Visiting Hours: 9:00 AM – 11:00 AM & 3:00 PM – 5:00 PM' },
    { text: 'Please arrive 10 minutes early' },
    { text: 'Maximum of 10 visitors per group' },
    { text: 'Valid ID required upon arrival' },
    { text: 'No photography without permission' },
];

// ── Philippine Mobile Number Validation ──────────────────────────────────────
const validatePhilippineNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10 && cleaned.startsWith('9'))
        return { isValid: true, formatted: `+63${cleaned}`, display: cleaned };
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
    if (cleaned.length >= 4 && cleaned.startsWith('09')) {
        if (cleaned.length <= 4) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
    }
    return phone;
};

// ── Confirmation Modal ────────────────────────────────────────────────────────
const ConfirmModal = ({ data, onConfirm, onCancel, loading }) => (
    <div className="bp-modal-overlay">
        <div className="bp-modal">
            <h3 className="bp-modal-title">Review Your Booking</h3>
            <p className="bp-modal-subtitle">Please confirm your visit details before submitting.</p>
            <div className="bp-modal-rows">
                {[
                    ['Full Name',    data.name],
                    ['Email',        data.email],
                    ['Phone',        data.phone],
                    ['Purpose',      data.purpose],
                    ['Visit Date',   data.visitDate],
                    ['Time',         data.visitTime],
                    ['Visitors',     `${data.numberOfVisitors} visitor${data.numberOfVisitors > 1 ? 's' : ''}`],
                    ...(data.notes ? [['Notes', data.notes]] : []),
                ].map(([label, value]) => (
                    <div className="bp-modal-row" key={label}>
                        <span className="bp-modal-label">{label}</span>
                        <span className="bp-modal-value">{value}</span>
                    </div>
                ))}
            </div>
            <div className="bp-modal-actions">
                <button className="bp-modal-cancel" onClick={onCancel} disabled={loading}>
                    Go Back
                </button>
                <button className="bp-modal-confirm" onClick={onConfirm} disabled={loading}>
                    {loading ? <><div className="bp-spin" /> Processing…</> : 'Confirm Booking'}
                </button>
            </div>
        </div>
    </div>
);

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
    const [errors, setErrors]             = useState({});
    const [apiError, setApiError]         = useState('');
    const [loading, setLoading]           = useState(false);
    const [submitted, setSubmitted]       = useState(false);
    const [receipt, setReceipt]           = useState(null);
    const [showModal, setShowModal]       = useState(false);
    const [modalData, setModalData]       = useState(null);

    const setFormField = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleChange = e => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '');
            if (digitsOnly.length <= 11) {
                const formattedValue = digitsOnly.length >= 4 && digitsOnly.startsWith('09')
                    ? formatPhoneDisplay(digitsOnly)
                    : digitsOnly;
                setFormField(name, formattedValue);
                setErrors(p => ({ ...p, phone: '' }));
            }
            return;
        }
        if (name === 'numberOfVisitors') {
            setFormField(name, Math.max(1, Math.min(10, Number(value))));
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
        if (!form.lastName.trim())  e.lastName  = 'Required';
        if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
        if (!form.phone) {
            e.phone = 'Mobile number is required';
        } else {
            const cleaned = form.phone.replace(/\D/g, '');
            if (!validatePhilippineNumber(cleaned).isValid)
                e.phone = 'Enter a valid Philippine mobile number (e.g., 09123456789 or 9123456789)';
        }
        if (!selectedDate) e.visitDate = 'Please select a date';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = e => {
        e.preventDefault();
        setApiError('');
        if (!validate()) return;

        const fullName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ');
        const cleanedPhone = form.phone.replace(/\D/g, '');
        let formattedPhone = cleanedPhone;
        if (cleanedPhone.length === 10 && cleanedPhone.startsWith('9'))       formattedPhone = `+63${cleanedPhone}`;
        else if (cleanedPhone.length === 11 && cleanedPhone.startsWith('09')) formattedPhone = `+63${cleanedPhone.substring(1)}`;
        else if (cleanedPhone.length === 12 && cleanedPhone.startsWith('639'))formattedPhone = `+63${cleanedPhone.substring(3)}`;

        setModalData({
            firstName:        form.firstName.trim(),
            middleName:       form.middleName.trim(),
            lastName:         form.lastName.trim(),
            name:             fullName,
            email:            form.email.trim().toLowerCase(),
            phone:            formattedPhone,
            visitDate:        selectedDate.toLocaleDateString('en-PH', {
                                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                              }),
            visitDateRaw:     selectedDate.toISOString().split('T')[0],
            visitTime:        TIME_SLOTS.find(t => t.value === form.visitTime)?.label || form.visitTime,
            visitTimeRaw:     form.visitTime,
            purpose:          PURPOSES.find(p => p.value === form.purpose)?.label || form.purpose,
            purposeRaw:       form.purpose,
            numberOfVisitors: Number(form.numberOfVisitors),
            notes:            form.notes.trim(),
        });
        setShowModal(true);
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const payload = {
                firstName:        modalData.firstName,
                middleName:       modalData.middleName,
                lastName:         modalData.lastName,
                name:             modalData.name,
                email:            modalData.email,
                phone:            modalData.phone,
                visitDate:        modalData.visitDateRaw,
                visitTime:        modalData.visitTimeRaw,
                purpose:          modalData.purposeRaw,
                numberOfVisitors: modalData.numberOfVisitors,
                notes:            modalData.notes,
            };

            console.log('Booking API_BASE:', API_URL);
            console.log('Booking payload:', payload);
            console.log('Booking URL:', `${API_URL}/bookings`);

            const response = await axios.post(`${API_URL}/bookings`, payload, { timeout: 30000 });

            if (response.data.success) {
                setReceipt({
                    bookingId:        response.data.data?.bookingId || uid(),
                    name:             modalData.name,
                    email:            modalData.email,
                    visitDate:        modalData.visitDate,
                    visitTime:        modalData.visitTime,
                    purpose:          modalData.purpose,
                    numberOfVisitors: modalData.numberOfVisitors,
                });
                setShowModal(false);
                setSubmitted(true);
            } else {
                throw new Error(response.data.message || 'Booking failed');
            }
        } catch (err) {
            console.error('Booking submission error:', err);
            setApiError(
                err.response?.data?.message ||
                err.message ||
                'Unable to submit booking. Please try again.'
            );
            setShowModal(false);
        } finally {
            setLoading(false);
        }
    };

    // ── Success Screen ────────────────────────────────────────────────────────
    if (submitted && receipt) {
        return (
            <div className="bp-success">
                <div className="bp-success-card">
                    <div className="bp-checkmark">&#10003;</div>
                    <h2>Booking Submitted!</h2>
                    <p>
                        Your visit has been scheduled. You will receive a confirmation email shortly at{' '}
                        <strong>{receipt.email}</strong>.
                    </p>
                    <div className="bp-receipt">
                        {[
                            ['Booking ID', receipt.bookingId],
                            ['Name',       receipt.name],
                            ['Visit Date', receipt.visitDate],
                            ['Time',       receipt.visitTime],
                            ['Purpose',    receipt.purpose],
                            ['Visitors',   receipt.numberOfVisitors],
                        ].map(([label, value]) => (
                            <div className="bp-receipt-row" key={label}>
                                <span>{label}</span>
                                <strong>{value}</strong>
                            </div>
                        ))}
                    </div>
                    <div className="bp-btn-row">
                        <button className="bp-btn-primary" onClick={() => navigate('/')}>
                            Back to Home
                        </button>
                        <button className="bp-btn-secondary" onClick={() => window.print()}>
                            Print Receipt
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main Form ─────────────────────────────────────────────────────────────
    return (
        <div className="bp-shell">
            {/* Modal */}
            {showModal && modalData && (
                <ConfirmModal
                    data={modalData}
                    onConfirm={handleConfirm}
                    onCancel={() => setShowModal(false)}
                    loading={loading}
                />
            )}

            {/* Hero */}
            <div className="bp-hero">
                <button className="bp-back" onClick={() => navigate('/')}>&#8592;</button>
                <div className="bp-hero-inner">
                    <div className="bp-hero-badge">
                        <span />
                        Book a Visit
                    </div>
                    <h1>Schedule Your Visit</h1>
                    <p>
                        Plan your visit to Kanang Alalay. Select a convenient date and time to
                        tour our facility or meet with our team.
                    </p>
                </div>
            </div>

            {/* Main Body */}
            <div className="bp-body">
                {/* Guidelines */}
                <div className="bp-guidelines-top">
                    <h6>Visit Guidelines</h6>
                    <ul className="bp-guidelines-list-compact">
                        {GUIDELINES.map((g, i) => (
                            <li key={i}>
                                <span className="bp-guideline-bullet" />
                                <span>{g.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Full-width form container */}
                <div className="bp-form-container">
                    {apiError && (
                        <div className="bp-alert danger">
                            <div>{apiError}</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <div className="bp-section">
                            <div className="bp-section-title">Personal Information</div>

                            <div className="bp-row">
                                <div className="bp-group">
                                    <label>First Name<span className="req">*</span></label>
                                    <input
                                        className={`bp-input${errors.firstName ? ' err' : ''}`}
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        placeholder="Juan"
                                        disabled={loading}
                                    />
                                    {errors.firstName && <div className="bp-err-msg">{errors.firstName}</div>}
                                </div>
                                <div className="bp-group">
                                    <label>Middle Name (Optional)</label>
                                    <input
                                        className="bp-input"
                                        name="middleName"
                                        value={form.middleName}
                                        onChange={handleChange}
                                        placeholder="Santos"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="bp-group">
                                    <label>Last Name<span className="req">*</span></label>
                                    <input
                                        className={`bp-input${errors.lastName ? ' err' : ''}`}
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        placeholder="Dela Cruz"
                                        disabled={loading}
                                    />
                                    {errors.lastName && <div className="bp-err-msg">{errors.lastName}</div>}
                                </div>
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
                                        placeholder="juan@example.com"
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
                                    <div className="bp-hint phone-hint">Format: 09XXXXXXXXX or 9XXXXXXXXX (PH mobile)</div>
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
                                <div className="bp-err-msg" style={{ marginBottom: 12 }}>{errors.visitDate}</div>
                            )}

                            <div className="bp-schedule-row">
                                <div className="bp-calendar-section">
                                    <Calendar
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        minDate={new Date()}
                                    />
                                    {selectedDate && (
                                        <div className="bp-selected-date">
                                            {selectedDate.toLocaleDateString('en-PH', {
                                                weekday: 'long', year: 'numeric',
                                                month: 'long', day: 'numeric',
                                            })}
                                        </div>
                                    )}
                                </div>

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
                                    <div className="bp-hint">Choose between morning or afternoon visit</div>
                                </div>
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
                                    placeholder="Special requests or additional information..."
                                    disabled={loading}
                                    rows="3"
                                />
                            </div>
                        </div>

                        <button type="submit" className="bp-submit" disabled={loading}>
                            Review Booking
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;