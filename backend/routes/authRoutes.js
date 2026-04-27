const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RegistrationCode = require('../models/VerificationCode');
const { sendEmail, generateOtpTemplate } = require('../models/mailer');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user._id,
                staffId: req.user.staffId,
                username: req.user.username,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                middleName: req.user.middleName,
                phone: req.user.phone,
                role: req.user.role,
                department: req.user.department,
                shift: req.user.shift,
                isActive: req.user.isActive,
                isVerified: req.user.isVerified,
                accountStatus: req.user.accountStatus,
                createdAt: req.user.createdAt,
                hireDate: req.user.hireDate,
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username/email and password are required.' });
        }

        const user = await User.findOne({ $or: [{ email: username }, { username }] });

        // Wrong credentials — do not hint which field was wrong
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // ── Account status gate ───────────────────────────────────────────────
        // Resolve the effective status: prefer accountStatus; fall back to legacy
        // isVerified/isActive for older records that predate the field.
        const status = user.accountStatus || (user.isActive && user.isVerified ? 'active' : 'pending');

        if (status !== 'active') {
            // Each non-active state gets its own specific message
            const statusMessages = {
                pending: {
                    message: 'Your account has not been activated yet. Please verify the OTP sent to your email.',
                    // userId lets the frontend redirect to the OTP activation panel
                    sendUserId: true,
                },
                restricted: {
                    message: 'Your account access has been restricted. Please contact your administrator for assistance.',
                    sendUserId: false,
                },
                suspended: {
                    message: 'Your account has been temporarily suspended. Please contact your supervisor or HR.',
                    sendUserId: false,
                },
                on_leave: {
                    message: 'Your account is currently on approved leave of absence and cannot be accessed at this time.',
                    sendUserId: false,
                },
                terminated: {
                    message: 'Your employment has been terminated and this account no longer has system access.',
                    sendUserId: false,
                },
                deactivated: {
                    message: 'This account has been permanently deactivated. Please contact the administrator if you believe this is an error.',
                    sendUserId: false,
                },
            };

            const config = statusMessages[status] || {
                message: 'Your account is inactive. Please contact your administrator.',
                sendUserId: false,
            };

            return res.status(401).json({
                success: false,
                accountStatus: status,
                message: config.message,
                ...(config.sendUserId && { userId: user._id }),
            });
        }

        // ── Role check (web portal is admin/head_caregiver only) ─────────────
        const WEB_ALLOWED_ROLES = ['admin', 'head_caregiver'];
        if (!WEB_ALLOWED_ROLES.includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access restricted. This portal is for admin and head caregiver use only. Please use the mobile application.'
            });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role, username: user.username, email: user.email },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                staffId: user.staffId,
                username: user.username,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                middleName: user.middleName,
                phone: user.phone,
                department: user.department,
                shift: user.shift,
                accountStatus: user.accountStatus,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

router.post('/validate-code', async (req, res) => {
    try {
        const { registrationCode } = req.body;
        if (!registrationCode) {
            return res.status(400).json({ success: false, message: 'Registration code is required.' });
        }

        const codeDoc = await RegistrationCode.findOne({
            code: registrationCode.toUpperCase(),
            status: 'active',
            expiresAt: { $gt: new Date() }
        });

        if (!codeDoc) {
            return res.status(400).json({ success: false, message: 'Invalid or expired registration code.' });
        }

        const allowedRoles = ['admin', 'head_caregiver', 'caregiver'];
        if (!allowedRoles.includes(codeDoc.role)) {
            return res.status(400).json({ success: false, message: 'Invalid registration code for this role.' });
        }

        const generatedId = `LSAE-${Date.now().toString().slice(-6)}`;
        res.json({ success: true, valid: true, role: codeDoc.role, generatedId });
    } catch (error) {
        console.error('Validate code error:', error);
        res.status(500).json({ success: false, message: 'Server error validating code' });
    }
});

router.post('/register-staff', async (req, res) => {
    try {
        const {
            registrationCode, staffId, username, email, password,
            firstName, lastName, phone, role
        } = req.body;

        if (!registrationCode) {
            return res.status(400).json({ success: false, message: 'Registration code is required.' });
        }

        const codeDoc = await RegistrationCode.findOne({
            code: registrationCode.toUpperCase(),
            status: 'active',
            expiresAt: { $gt: new Date() }
        });

        if (!codeDoc) {
            return res.status(400).json({ success: false, message: 'Invalid or expired registration code.' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email or username already exists.' });
        }

        await RegistrationCode.findOneAndUpdate(
            { code: registrationCode.toUpperCase() },
            { status: 'used', usedAt: new Date() }
        );

        const finalStaffId = staffId || `LSAE-${Date.now().toString().slice(-6)}`;

        const user = new User({
            staffId: finalStaffId,
            username: username || email.split('@')[0],
            email,
            password,
            firstName,
            lastName,
            phone,
            role: codeDoc.role,
            isVerified: false,
            isActive: false,
            accountStatus: 'pending',
        });

        await user.save();

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otpCode;
        user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        console.log('\n=======================================');
        console.log(`OTP Generated for new staff: ${email}`);
        console.log(`OTP CODE: ${otpCode}`);
        console.log('=======================================\n');

        try {
            await sendEmail(email, 'Activate your Kanang-Alalay Account', generateOtpTemplate(otpCode));
        } catch (mailError) {
            console.error('Email send error:', mailError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Staff registered successfully. An OTP has been sent to the provided email for account activation.',
            userId: user._id,
            email: user.email,
            firstName: user.firstName,
            staffId: user.staffId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
});

router.post('/send-otp', async (req, res) => {
    try {
        const { email, userId } = req.body;
        const user = userId ? await User.findById(userId) : await User.findOne({ email });

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        if (user.accountStatus === 'active') {
            return res.status(400).json({ success: false, message: 'Account is already activated.' });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otpCode;
        user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        try {
            await sendEmail(user.email, 'Your Kanang-Alalay OTP', generateOtpTemplate(otpCode));
        } catch (mailErr) {
            console.error('Email error:', mailErr.message);
        }

        res.json({ success: true, message: `OTP sent to ${user.email}.` });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error sending OTP' });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { userId, otp } = req.body;
        if (!userId || !otp) {
            return res.status(400).json({ success: false, message: 'User ID and OTP are required.' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        if (user.otpCode !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }
        if (user.otpExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        // Activate the account
        user.isVerified = true;
        user.isActive = true;
        user.accountStatus = 'active';
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Account activated successfully.' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error verifying OTP' });
    }
});

router.post('/resend-otp', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otpCode;
        user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        try {
            await sendEmail(user.email, 'Your new Kanang-Alalay OTP', generateOtpTemplate(otpCode));
        } catch (mailError) {
            console.error('Email error:', mailError.message);
        }

        res.json({ success: true, message: 'New OTP sent to your email.' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

        const user = await User.findOne({ email });
        if (user) {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            user.resetPasswordOtp = otpCode;
            user.resetPasswordOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
            await user.save();

            try {
                await sendEmail(email, 'Password Reset OTP - Kanang-Alalay', generateOtpTemplate(otpCode));
            } catch (mailErr) {
                console.error('Email error:', mailErr.message);
            }
        }

        res.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

router.post('/verify-reset-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        if (user.resetPasswordOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }
        if (user.resetPasswordOtpExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        res.json({ success: true, message: 'OTP verified. You may now reset your password.' });
    } catch (error) {
        console.error('Verify reset OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/reset-password-with-otp', async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        if (!email || !otp || !password) {
            return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        if (user.resetPasswordOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }
        if (user.resetPasswordOtpExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        user.password = password;
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/resend-reset-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: true, message: 'If that email exists, a new OTP has been sent.' });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOtp = otpCode;
        user.resetPasswordOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        try {
            await sendEmail(email, 'Your new Password Reset OTP', generateOtpTemplate(otpCode));
        } catch (mailError) {
            console.error('Email error:', mailError.message);
        }

        res.json({ success: true, message: 'New OTP sent to your email.' });
    } catch (error) {
        console.error('Resend reset OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification link'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Email verified successfully! You can now login.' });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/resend-verification', async (req, res) => {
    try {
        const crypto = require('crypto');
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.isEmailVerified) return res.status(400).json({ success: false, message: 'Email already verified' });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        console.log(`Verification link: ${verificationLink}`);

        try {
            await sendEmail(email, 'Verify your Email', `Click here: ${verificationLink}`);
        } catch (mailError) {
            console.error('Email error:', mailError.message);
        }

        res.json({ success: true, message: 'Verification email sent' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/validate-token', protect, async (req, res) => {
    const WEB_ALLOWED_ROLES = ['admin', 'head_caregiver'];
    if (!WEB_ALLOWED_ROLES.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Role no longer valid for web login.' });
    }

    // If token is valid but account was deactivated/suspended after login, block here too
    const freshUser = await User.findById(req.user._id).select('accountStatus isActive');
    if (freshUser && freshUser.accountStatus && freshUser.accountStatus !== 'active') {
        return res.status(401).json({ success: false, message: 'Your account status has changed. Please log in again.' });
    }

    res.json({
        success: true,
        user: {
            id: req.user._id,
            staffId: req.user.staffId,
            username: req.user.username,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            middleName: req.user.middleName,
            phone: req.user.phone,
            role: req.user.role,
            department: req.user.department,
            shift: req.user.shift,
            isActive: req.user.isActive,
            accountStatus: req.user.accountStatus,
            createdAt: req.user.createdAt,
        }
    });
});

router.put('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword)
            return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
        if (newPassword.length < 8)
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });

        const user = await User.findById(req.user._id);
        const match = await user.comparePassword(currentPassword);
        if (!match)
            return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        if (currentPassword === newPassword)
            return res.status(400).json({ success: false, message: 'New password must be different from the current one.' });

        user.password = newPassword;
        await user.save();
        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

router.put('/update-phone', protect, async (req, res) => {
    try {
        const { phone } = req.body;
        await User.findByIdAndUpdate(req.user._id, { phone: phone || '' });
        res.json({ success: true, message: 'Contact number updated.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

module.exports = router;