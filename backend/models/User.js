const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    staffId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String, default: '' },
    suffix: { type: String, default: '' },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    department: {
        type: String,
        trim: true,
        default: '',
    },
    shift: {
        type: String,
        enum: ['morning', 'afternoon', 'night', 'flexible', 'rotating'],
        default: 'morning'
    },
    employeeId: { type: String, unique: true, sparse: true },
    hireDate: { type: Date, default: Date.now },
    address: {
        street: String,
        city: String,
        province: String,
        zipCode: String
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    role: {
        type: String,
        enum: ['admin', 'head_caregiver', 'caregiver'],
        default: 'caregiver'
    },

    // ── Account Status ────────────────────────────────────────────────────────
    // 'pending'     → Newly registered, waiting for OTP activation by admin
    // 'active'      → Normal, fully operational account
    // 'restricted'  → Admin restricted access (still employed, limited access)
    // 'suspended'   → Temporarily suspended (policy violation / investigation)
    // 'on_leave'    → On approved leave of absence
    // 'terminated'  → Employment terminated, no longer with organization
    // 'deactivated' → Permanently deactivated (permanent departure)
    accountStatus: {
        type: String,
        enum: ['pending', 'active', 'restricted', 'suspended', 'on_leave', 'terminated', 'deactivated'],
        default: 'pending'
    },
    // Reason recorded when admin changes accountStatus
    statusReason: { type: String, default: '' },
    statusUpdatedAt: { type: Date },
    statusUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Legacy fields — kept for backward compatibility, derived from accountStatus
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },

    otpCode: { type: String },
    otpExpires: { type: Date },
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpires: { type: Date },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    verificationOtp: { type: String },
    verificationOtpExpires: { type: Date },
    resetOtp: { type: String },
    resetOtpExpires: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    // Keep isActive in sync with accountStatus so old code still works
    if (this.isModified('accountStatus')) {
        this.isActive = this.accountStatus === 'active';
    }

    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);