import React, { useState, useEffect } from 'react';
import {
    FaTimes, FaSave, FaEye, FaEyeSlash, FaCheckCircle,
    FaExclamationCircle, FaUser, FaPhone, FaEnvelope,
    FaMapMarkerAlt, FaClock, FaBuilding, FaDoorOpen,
    FaKey, FaShieldAlt, FaArrowRight
} from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
        ? 'https://kanang-alalay-backend.onrender.com/api'
        : 'http://localhost:5000/api');

const ProfileUpdateModal = ({ isOpen, onClose, onComplete, userData }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: {
            street: '',
            city: '',
            province: '',
            zipCode: ''
        },
        shift: 'morning',
        assignedFloor: '',
        assignedRoom: ''
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (userData && isOpen) {
            setForm({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                phone: userData.phone || '',
                address: {
                    street: userData.address?.street || '',
                    city: userData.address?.city || '',
                    province: userData.address?.province || '',
                    zipCode: userData.address?.zipCode || ''
                },
                shift: userData.shift || 'morning',
                assignedFloor: userData.assignedFloor || '',
                assignedRoom: userData.assignedRoom || ''
            });
        }
    }, [userData, isOpen]);

    useEffect(() => {
        const password = passwordData.newPassword;
        if (!password) {
            setPasswordStrength({ score: 0, text: '', color: '' });
            return;
        }

        let score = 0;
        if (password.length >= 8) score++;
        if (password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^A-Za-z0-9]/)) score++;

        let text = '', color = '';
        if (score === 0) { text = 'Very Weak'; color = '#dc3545'; }
        else if (score === 1) { text = 'Weak'; color = '#dc3545'; }
        else if (score === 2) { text = 'Moderate'; color = '#ffc107'; }
        else if (score === 3) { text = 'Strong'; color = '#28a745'; }
        else { text = 'Very Strong'; color = '#28a745'; }

        setPasswordStrength({ score, text, color });
    }, [passwordData.newPassword]);

    if (!isOpen) return null;

    const handleFormChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setForm(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setForm(prev => ({ ...prev, [field]: value }));
        }
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^[0-9+\-\s()]{10,}$/.test(form.phone)) newErrors.phone = 'Valid phone number required';

        if (passwordData.newPassword) {
            if (passwordData.newPassword.length < 8) {
                newErrors.newPassword = 'Password must be at least 8 characters';
            }
            if (!/[A-Z]/.test(passwordData.newPassword)) {
                newErrors.newPassword = 'Password must contain at least one uppercase letter';
            }
            if (!/[0-9]/.test(passwordData.newPassword)) {
                newErrors.newPassword = 'Password must contain at least one number';
            }
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        const token = localStorage.getItem('token');

        const updateData = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phone: form.phone.trim(),
            address: form.address,
            shift: form.shift,
            assignedFloor: form.assignedFloor,
            assignedRoom: form.assignedRoom
        };

        if (passwordData.newPassword) {
            updateData.newPassword = passwordData.newPassword;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update profile');
            }

            setSuccess('Profile updated successfully! Redirecting to dashboard...');

            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            setTimeout(() => {
                if (onComplete) onComplete(data.user || data.data);
                if (onClose) onClose();
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const shiftOptions = [
        { value: 'morning', label: 'Morning Shift (6:00 AM - 2:00 PM)' },
        { value: 'afternoon', label: 'Afternoon Shift (2:00 PM - 10:00 PM)' },
        { value: 'night', label: 'Night Shift (10:00 PM - 6:00 AM)' },
        { value: 'flexible', label: 'Flexible Schedule' },
        { value: 'rotating', label: 'Rotating Shift' }
    ];

    return (
        <div className="modal-overlay" style={styles.overlay}>
            <div className="registration-modal" style={styles.modal}>
                <div style={styles.header}>
                    <div style={styles.headerIcon}>
                        <FaShieldAlt size={24} color="#fff" />
                    </div>
                    <div style={styles.headerText}>
                        <h3 style={styles.title}>Complete Your Profile</h3>
                        <p style={styles.subtitle}>Please update your information before accessing the dashboard</p>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn} disabled={loading}>
                        <FaTimes />
                    </button>
                </div>

                <div style={styles.content}>
                    <div style={styles.infoBanner}>
                        <FaExclamationCircle size={18} color="#F96B38" />
                        <span style={styles.infoText}>
                            This is your first login. Please complete your profile and create a permanent password.
                        </span>
                    </div>

                    <div style={styles.section}>
                        <h4 style={styles.sectionTitle}>
                            <FaUser style={styles.sectionIcon} /> Personal Information
                        </h4>

                        <div style={styles.row}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>First Name *</label>
                                <input
                                    type="text"
                                    style={{ ...styles.input, ...(errors.firstName ? styles.inputError : {}) }}
                                    value={form.firstName}
                                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                                    placeholder="Enter first name"
                                />
                                {errors.firstName && <span style={styles.errorText}>{errors.firstName}</span>}
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Last Name *</label>
                                <input
                                    type="text"
                                    style={{ ...styles.input, ...(errors.lastName ? styles.inputError : {}) }}
                                    value={form.lastName}
                                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                                    placeholder="Enter last name"
                                />
                                {errors.lastName && <span style={styles.errorText}>{errors.lastName}</span>}
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>
                                    <FaPhone style={styles.fieldIcon} /> Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    style={{ ...styles.input, ...(errors.phone ? styles.inputError : {}) }}
                                    value={form.phone}
                                    onChange={(e) => handleFormChange('phone', e.target.value)}
                                    placeholder="+63 XXX XXX XXXX"
                                />
                                {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>
                                    <FaEnvelope style={styles.fieldIcon} /> Email
                                </label>
                                <input
                                    type="email"
                                    style={styles.input}
                                    value={userData?.email || ''}
                                    disabled
                                    readOnly
                                />
                                <span style={styles.helperText}>Email cannot be changed</span>
                            </div>
                        </div>
                    </div>

                    <div style={styles.section}>
                        <h4 style={styles.sectionTitle}>
                            <FaMapMarkerAlt style={styles.sectionIcon} /> Address
                        </h4>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Street</label>
                            <input
                                type="text"
                                style={styles.input}
                                value={form.address.street}
                                onChange={(e) => handleFormChange('address.street', e.target.value)}
                                placeholder="House number, street name"
                            />
                        </div>

                        <div style={styles.row}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>City</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    value={form.address.city}
                                    onChange={(e) => handleFormChange('address.city', e.target.value)}
                                    placeholder="City"
                                />
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Province</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    value={form.address.province}
                                    onChange={(e) => handleFormChange('address.province', e.target.value)}
                                    placeholder="Province"
                                />
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Zip Code</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    value={form.address.zipCode}
                                    onChange={(e) => handleFormChange('address.zipCode', e.target.value)}
                                    placeholder="Zip Code"
                                />
                            </div>
                        </div>
                    </div>

                    <div style={styles.section}>
                        <h4 style={styles.sectionTitle}>
                            <FaClock style={styles.sectionIcon} /> Work Assignment
                        </h4>

                        <div style={styles.row}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Shift</label>
                                <select
                                    style={styles.select}
                                    value={form.shift}
                                    onChange={(e) => handleFormChange('shift', e.target.value)}
                                >
                                    {shiftOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>
                                    <FaBuilding style={styles.fieldIcon} /> Assigned Floor
                                </label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    value={form.assignedFloor}
                                    onChange={(e) => handleFormChange('assignedFloor', e.target.value)}
                                    placeholder="e.g., 2nd Floor, Main Building"
                                />
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>
                                    <FaDoorOpen style={styles.fieldIcon} /> Assigned Room
                                </label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    value={form.assignedRoom}
                                    onChange={(e) => handleFormChange('assignedRoom', e.target.value)}
                                    placeholder="e.g., Room 204, Ward A"
                                />
                            </div>
                        </div>
                    </div>

                    <div style={styles.section}>
                        <h4 style={styles.sectionTitle}>
                            <FaKey style={styles.sectionIcon} /> Create New Password
                        </h4>

                        <div style={styles.passwordNote}>
                            <FaShieldAlt size={14} />
                            <span>Set a permanent password for your account. Leave blank to keep using temporary password (not recommended).</span>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>New Password</label>
                                <div style={styles.passwordWrapper}>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        style={{ ...styles.input, ...(errors.newPassword ? styles.inputError : {}) }}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        style={styles.passwordToggle}
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                                {passwordData.newPassword && (
                                    <div style={styles.strengthContainer}>
                                        <div style={styles.strengthBar}>
                                            <div style={{
                                                ...styles.strengthFill,
                                                width: `${(passwordStrength.score / 4) * 100}%`,
                                                background: passwordStrength.color
                                            }} />
                                        </div>
                                        <span style={{ ...styles.strengthText, color: passwordStrength.color }}>
                                            {passwordStrength.text}
                                        </span>
                                    </div>
                                )}

                                <ul style={styles.passwordRequirements}>
                                    <li style={passwordData.newPassword.length >= 8 ? styles.requirementMet : styles.requirementNotMet}>
                                        {passwordData.newPassword.length >= 8 ? <FaCheckCircle size={12} /> : <FaExclamationCircle size={12} />}
                                        At least 8 characters
                                    </li>
                                    <li style={/[A-Z]/.test(passwordData.newPassword) ? styles.requirementMet : styles.requirementNotMet}>
                                        {/[A-Z]/.test(passwordData.newPassword) ? <FaCheckCircle size={12} /> : <FaExclamationCircle size={12} />}
                                        One uppercase letter
                                    </li>
                                    <li style={/[0-9]/.test(passwordData.newPassword) ? styles.requirementMet : styles.requirementNotMet}>
                                        {/[0-9]/.test(passwordData.newPassword) ? <FaCheckCircle size={12} /> : <FaExclamationCircle size={12} />}
                                        One number
                                    </li>
                                    <li style={/[^A-Za-z0-9]/.test(passwordData.newPassword) ? styles.requirementMet : styles.requirementNotMet}>
                                        {/[^A-Za-z0-9]/.test(passwordData.newPassword) ? <FaCheckCircle size={12} /> : <FaExclamationCircle size={12} />}
                                        One special character
                                    </li>
                                </ul>

                                {errors.newPassword && <span style={styles.errorText}>{errors.newPassword}</span>}
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Confirm Password</label>
                                <div style={styles.passwordWrapper}>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        style={{ ...styles.input, ...(errors.confirmPassword ? styles.inputError : {}) }}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.passwordToggle}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div style={styles.errorBanner}>
                            <FaExclamationCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div style={styles.successBanner}>
                            <FaCheckCircle size={18} />
                            <span>{success}</span>
                        </div>
                    )}
                </div>

                <div style={styles.footer}>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={loading ? styles.submitBtnDisabled : styles.submitBtn}
                    >
                        {loading ? (
                            <>
                                <span className="spin" style={styles.spinner}>⟳</span>
                                Updating Profile...
                            </>
                        ) : (
                            <>
                                <FaSave /> Complete Setup <FaArrowRight />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: '20px'
    },
    modal: {
        maxWidth: 800,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative'
    },
    header: {
        background: 'linear-gradient(135deg, #F96B38, #D94E1B)',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        borderRadius: '20px 20px 0 0',
        position: 'sticky',
        top: 0,
        zIndex: 1
    },
    headerIcon: {
        background: 'rgba(255,255,255,0.2)',
        width: 48,
        height: 48,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        flex: 1
    },
    title: {
        margin: 0,
        color: '#fff',
        fontSize: '1.3rem',
        fontWeight: 600
    },
    subtitle: {
        margin: '4px 0 0',
        color: 'rgba(255,255,255,0.9)',
        fontSize: '0.85rem'
    },
    closeBtn: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#fff',
        fontSize: '1.1rem',
        transition: 'all 0.2s'
    },
    content: {
        padding: '28px'
    },
    infoBanner: {
        background: '#FFF3E0',
        borderLeft: '4px solid #F96B38',
        padding: '12px 16px',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24
    },
    infoText: {
        fontSize: '0.85rem',
        color: '#E65100'
    },
    section: {
        marginBottom: 28,
        borderBottom: '1px solid #E8D6CC',
        paddingBottom: 20
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        margin: '0 0 16px 0',
        color: '#7A5C4E',
        fontSize: '1rem',
        fontWeight: 600
    },
    sectionIcon: {
        color: '#F96B38'
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginBottom: 16
    },
    fieldGroup: {
        marginBottom: 16
    },
    label: {
        display: 'block',
        marginBottom: 6,
        fontWeight: 600,
        fontSize: '0.78rem',
        color: '#7A5C4E',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    fieldIcon: {
        marginRight: 4
    },
    input: {
        width: '100%',
        padding: '10px 14px',
        border: '1.5px solid #E8D6CC',
        borderRadius: 10,
        fontSize: '0.9rem',
        fontFamily: "'DM Sans', sans-serif",
        background: '#FFF8F3',
        color: '#1A0A00',
        outline: 'none',
        transition: 'all 0.2s'
    },
    inputError: {
        borderColor: '#dc3545',
        background: '#fff8f8'
    },
    select: {
        width: '100%',
        padding: '10px 14px',
        border: '1.5px solid #E8D6CC',
        borderRadius: 10,
        fontSize: '0.9rem',
        fontFamily: "'DM Sans', sans-serif",
        background: '#FFF8F3',
        color: '#1A0A00',
        outline: 'none',
        cursor: 'pointer'
    },
    errorText: {
        display: 'block',
        color: '#dc3545',
        fontSize: '0.75rem',
        marginTop: 4
    },
    helperText: {
        display: 'block',
        color: '#9aada8',
        fontSize: '0.7rem',
        marginTop: 4
    },
    passwordWrapper: {
        position: 'relative'
    },
    passwordToggle: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#7A5C4E'
    },
    strengthContainer: {
        marginTop: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 10
    },
    strengthBar: {
        flex: 1,
        height: 4,
        background: '#E8D6CC',
        borderRadius: 2,
        overflow: 'hidden'
    },
    strengthFill: {
        height: '100%',
        transition: 'width 0.3s'
    },
    strengthText: {
        fontSize: '0.7rem',
        fontWeight: 600
    },
    passwordRequirements: {
        listStyle: 'none',
        padding: 0,
        margin: '8px 0 0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12
    },
    requirementMet: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: '0.7rem',
        color: '#28a745'
    },
    requirementNotMet: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: '0.7rem',
        color: '#dc3545'
    },
    passwordNote: {
        background: '#E8F0FE',
        padding: '10px 12px',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        fontSize: '0.8rem',
        color: '#1a56db'
    },
    errorBanner: {
        background: '#FDE8E8',
        borderLeft: '4px solid #dc3545',
        padding: '12px 16px',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginTop: 20,
        color: '#c0392b',
        fontSize: '0.85rem'
    },
    successBanner: {
        background: '#E8F5E9',
        borderLeft: '4px solid #28a745',
        padding: '12px 16px',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginTop: 20,
        color: '#1e7d56',
        fontSize: '0.85rem'
    },
    footer: {
        padding: '20px 28px',
        borderTop: '1.5px solid #E8D6CC',
        display: 'flex',
        justifyContent: 'flex-end',
        background: '#FFF8F3',
        borderRadius: '0 0 20px 20px'
    },
    submitBtn: {
        background: 'linear-gradient(135deg, #F96B38, #D94E1B)',
        border: 'none',
        padding: '12px 28px',
        borderRadius: 10,
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.9rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: 'all 0.2s'
    },
    submitBtnDisabled: {
        background: '#ccc',
        border: 'none',
        padding: '12px 28px',
        borderRadius: 10,
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.9rem',
        cursor: 'not-allowed',
        display: 'flex',
        alignItems: 'center',
        gap: 10
    },
    spinner: {
        display: 'inline-block',
        animation: 'spin 1s linear infinite'
    }
};

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .spin {
            display: inline-block;
            animation: spin 1s linear infinite;
        }
    `;
    document.head.appendChild(style);
}

export default ProfileUpdateModal;